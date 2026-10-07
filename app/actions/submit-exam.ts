'use server';

import { doc, getDoc, getDocs, collection, setDoc, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ExamAttempt, QuestionKey, Question } from '../../lib/types';

interface SubmitExamPayload {
  attemptId: string;
  quizId: string;
  userId: string;
  userAnswers: Record<string, { selected: string[]; timeSpentMs?: number }>;
  startedAt: number;
  questionOrder: string[];
}

export async function submitExamAction(payload: SubmitExamPayload): Promise<{
  success: boolean;
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  accuracy: number;
  attempt: ExamAttempt;
  error?: string;
}> {
  try {
    const { attemptId, quizId, userId, userAnswers, startedAt, questionOrder } = payload;

    // Fetch quiz doc for negativeRatio and totalMarks
    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);
    const quizData = quizSnap.exists() ? quizSnap.data() : null;
    const negativeRatio = quizData?.settings?.negativeRatio ?? 0.25;
    const durationMinutes = quizData?.settings?.durationMinutes ?? 30;

    // Fetch all question keys for the questions in this exam
    const keysMap: Record<string, QuestionKey> = {};
    const keysSnap = await getDocs(collection(db, 'questionKeys'));
    keysSnap.forEach((docSnap) => {
      keysMap[docSnap.id] = docSnap.data() as QuestionKey;
    });

    // Fetch questions metadata for defaultMarks
    const questionsMap: Record<string, Question> = {};
    const questionsSnap = await getDocs(collection(db, 'questions'));
    questionsSnap.forEach((docSnap) => {
      questionsMap[docSnap.id] = docSnap.data() as Question;
    });

    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    let rawScore = 0;

    const evaluatedAnswers: Record<string, any> = {};

    for (const qId of questionOrder) {
      const qObj = questionsMap[qId];
      const keyObj = keysMap[qId];
      const userAns = userAnswers[qId];
      const userSelected = userAns?.selected || [];
      const correctOptions = keyObj?.correctOptionIds || (keyObj?.correctIndex !== undefined ? [String(keyObj.correctIndex)] : []);

      let isCorrect = false;
      let marksAwarded = 0;

      if (userSelected.length === 0) {
        unattemptedCount += 1;
        isCorrect = false;
        marksAwarded = 0;
      } else {
        const sortedUser = [...userSelected].sort().join(',');
        const sortedCorrect = [...correctOptions].sort().join(',');

        if (sortedUser === sortedCorrect) {
          isCorrect = true;
          marksAwarded = qObj?.defaultMarks || 1;
          correctCount += 1;
          rawScore += marksAwarded;
        } else {
          isCorrect = false;
          const penalty = (qObj?.defaultMarks || 1) * negativeRatio;
          marksAwarded = -penalty;
          wrongCount += 1;
          rawScore -= penalty;
        }
      }

      evaluatedAnswers[qId] = {
        selected: userSelected,
        correctOptionIds: correctOptions,
        isCorrect,
        marksAwarded,
        explanation: keyObj?.explanation || 'No detailed explanation provided.',
      };
    }

    const totalMarks = questionOrder.length;
    const finalScore = Math.max(0, Math.round(rawScore * 100) / 100);
    const attemptedCount = correctCount + wrongCount;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const submittedAt = Date.now();

    const completedAttempt: ExamAttempt = {
      id: attemptId,
      token: `token-${attemptId}`,
      userId,
      quizId,
      quizTitle: quizData?.title || 'Mock Examination',
      quizType: quizData?.type || 'mock',
      totalQuestions: questionOrder.length,
      totalMarks,
      durationMinutes,
      startedAt,
      expiresAt: startedAt + durationMinutes * 60 * 1000,
      submittedAt,
      status: 'completed',
      score: finalScore,
      correctCount,
      wrongCount,
      unattemptedCount,
      accuracy,
      questionOrder,
      answers: evaluatedAnswers,
    };

    // Save completed attempt to Firestore
    await setDoc(doc(db, 'attempts', attemptId), completedAttempt, { merge: true });

    return {
      success: true,
      score: finalScore,
      totalMarks,
      correctCount,
      wrongCount,
      unattemptedCount,
      accuracy,
      attempt: completedAttempt,
    };
  } catch (err: any) {
    console.error('Server side exam evaluation error:', err);
    return {
      success: false,
      score: 0,
      totalMarks: 0,
      correctCount: 0,
      wrongCount: 0,
      unattemptedCount: 0,
      accuracy: 0,
      attempt: {} as ExamAttempt,
      error: err?.message || 'Server evaluation failed.',
    };
  }
}
