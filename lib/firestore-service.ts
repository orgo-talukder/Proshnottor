import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Quiz,
  Question,
  QuestionKey,
  ExamAttempt,
  Bookmark,
  AppNotification,
  SystemAuditLog,
} from './types';

// =============================================================
// Quizzes Services (Real Firestore)
// =============================================================

export async function fetchPublishedQuizzes(): Promise<Quiz[]> {
  const path = 'quizzes';
  try {
    const q = query(collection(db, path), where('status', '==', 'published'));
    const snapshot = await getDocs(q);
    const results: Quiz[] = [];
    snapshot.forEach((docSnap) => {
      results.push({ ...(docSnap.data() as Quiz), id: docSnap.id });
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function fetchAllQuizzesAdmin(): Promise<Quiz[]> {
  const path = 'quizzes';
  try {
    const snapshot = await getDocs(collection(db, path));
    const results: Quiz[] = [];
    snapshot.forEach((docSnap) => {
      results.push({ ...(docSnap.data() as Quiz), id: docSnap.id });
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function fetchQuizById(quizId: string): Promise<Quiz | null> {
  const path = `quizzes/${quizId}`;
  try {
    const snap = await getDoc(doc(db, 'quizzes', quizId));
    if (snap.exists()) {
      return { ...(snap.data() as Quiz), id: snap.id };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveQuizToFirestore(quiz: Quiz): Promise<void> {
  const path = `quizzes/${quiz.id}`;
  try {
    await setDoc(doc(db, 'quizzes', quiz.id), quiz, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// =============================================================
// Questions & Keys Services (Real Firestore)
// =============================================================

export async function fetchQuestionsByIds(questionIds: string[]): Promise<Question[]> {
  if (!questionIds || questionIds.length === 0) return [];
  const path = 'questions';
  try {
    const results: Question[] = [];
    // Fetch each question doc
    for (const qId of questionIds) {
      const snap = await getDoc(doc(db, 'questions', qId));
      if (snap.exists()) {
        results.push({ ...(snap.data() as Question), id: snap.id });
      }
    }
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function fetchAllQuestionsAdmin(): Promise<Question[]> {
  const path = 'questions';
  try {
    const snapshot = await getDocs(collection(db, path));
    const results: Question[] = [];
    snapshot.forEach((docSnap) => {
      results.push({ ...(docSnap.data() as Question), id: docSnap.id });
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function fetchQuestionKeysByIds(questionIds: string[]): Promise<Record<string, QuestionKey>> {
  const path = 'questionKeys';
  const keysMap: Record<string, QuestionKey> = {};
  try {
    for (const qId of questionIds) {
      const snap = await getDoc(doc(db, 'questionKeys', qId));
      if (snap.exists()) {
        keysMap[qId] = snap.data() as QuestionKey;
      }
    }
    return keysMap;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return keysMap;
  }
}

export async function saveQuestionAndKeyToFirestore(
  question: Question,
  key: QuestionKey
): Promise<void> {
  try {
    await setDoc(doc(db, 'questions', question.id), question, { merge: true });
    await setDoc(doc(db, 'questionKeys', question.id), key, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `questions/${question.id}`);
    throw error;
  }
}

// =============================================================
// User Attempts & Results (Real User-Specific Data)
// =============================================================

export async function fetchUserAttempts(userId: string): Promise<ExamAttempt[]> {
  if (!userId) return [];
  const path = 'attempts';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const results: ExamAttempt[] = [];
    snapshot.forEach((docSnap) => {
      results.push({ ...(docSnap.data() as ExamAttempt), id: docSnap.id });
    });
    return results.sort((a, b) => (b.submittedAt || b.startedAt) - (a.submittedAt || a.startedAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveAttemptToFirestore(attempt: ExamAttempt): Promise<void> {
  const path = `attempts/${attempt.id}`;
  try {
    await setDoc(doc(db, 'attempts', attempt.id), attempt, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAttemptFromFirestore(attemptId: string): Promise<void> {
  const path = `attempts/${attemptId}`;
  try {
    await deleteDoc(doc(db, 'attempts', attemptId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// =============================================================
// Bookmarks Services (Real User Data)
// =============================================================

export async function fetchUserBookmarks(userId: string): Promise<Bookmark[]> {
  if (!userId) return [];
  const path = 'bookmarks';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const results: Bookmark[] = [];
    snapshot.forEach((docSnap) => {
      results.push({ ...(docSnap.data() as Bookmark), id: docSnap.id });
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function toggleBookmarkInFirestore(
  userId: string,
  questionId: string,
  subject: string,
  topic: string
): Promise<boolean> {
  const path = 'bookmarks';
  try {
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      where('questionId', '==', questionId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      // Remove
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, 'bookmarks', docSnap.id));
      }
      return false;
    } else {
      // Add
      const newBm: Bookmark = {
        id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        questionId,
        subject,
        topic,
        savedAt: Date.now(),
      };
      await setDoc(doc(db, 'bookmarks', newBm.id), newBm);
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

// =============================================================
// Logs & Audit Services
// =============================================================

export async function fetchSystemLogs(): Promise<SystemAuditLog[]> {
  const path = 'logs';
  try {
    const snapshot = await getDocs(collection(db, path));
    const results: SystemAuditLog[] = [];
    snapshot.forEach((docSnap) => {
      results.push({ ...(docSnap.data() as SystemAuditLog), id: docSnap.id });
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function recordAuditLog(
  action: string,
  user: string,
  details: string,
  level: 'info' | 'warn' | 'security' = 'info'
): Promise<void> {
  const path = 'logs';
  try {
    const newLog: SystemAuditLog = {
      id: `log-${Date.now()}`,
      action,
      user,
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      details,
      level,
    };
    await addDoc(collection(db, path), newLog);
  } catch (error) {
    // Non-blocking log failure
  }
}
