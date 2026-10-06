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
  limit,
  onSnapshot,
  Unsubscribe,
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
  UserProfile,
} from './types';
import { seedQuizzes, seedQuestions, seedQuestionKeys } from './seedData';

// =============================================================
// Realtime Subscriptions (onSnapshot for Live Cloud Data)
// =============================================================

export function subscribeToPublishedQuizzes(callback: (quizzes: Quiz[]) => void): Unsubscribe {
  const path = 'quizzes';
  try {
    const q = query(collection(db, path), where('status', '==', 'published'));
    return onSnapshot(
      q,
      (snapshot) => {
        const results: Quiz[] = [];
        snapshot.forEach((docSnap) => {
          results.push({ ...(docSnap.data() as Quiz), id: docSnap.id });
        });
        callback(results);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export function subscribeToAllQuizzes(callback: (quizzes: Quiz[]) => void): Unsubscribe {
  const path = 'quizzes';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const results: Quiz[] = [];
        snapshot.forEach((docSnap) => {
          results.push({ ...(docSnap.data() as Quiz), id: docSnap.id });
        });
        callback(results);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export function subscribeToAllQuestions(callback: (questions: Question[]) => void): Unsubscribe {
  const path = 'questions';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const results: Question[] = [];
        snapshot.forEach((docSnap) => {
          results.push({ ...(docSnap.data() as Question), id: docSnap.id });
        });
        callback(results);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export function subscribeToAllQuestionKeys(callback: (keysMap: Record<string, QuestionKey>) => void): Unsubscribe {
  const path = 'questionKeys';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const keysMap: Record<string, QuestionKey> = {};
        snapshot.forEach((docSnap) => {
          keysMap[docSnap.id] = docSnap.data() as QuestionKey;
        });
        callback(keysMap);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export function subscribeToUserAttempts(userId: string, callback: (attempts: ExamAttempt[]) => void): Unsubscribe {
  if (!userId) return () => {};
  const path = 'attempts';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const results: ExamAttempt[] = [];
        snapshot.forEach((docSnap) => {
          results.push({ ...(docSnap.data() as ExamAttempt), id: docSnap.id });
        });
        results.sort((a, b) => (b.submittedAt || b.startedAt) - (a.submittedAt || a.startedAt));
        callback(results);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export function subscribeToUserBookmarks(userId: string, callback: (bookmarks: Bookmark[]) => void): Unsubscribe {
  if (!userId) return () => {};
  const path = 'bookmarks';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const results: Bookmark[] = [];
        snapshot.forEach((docSnap) => {
          results.push({ ...(docSnap.data() as Bookmark), id: docSnap.id });
        });
        callback(results);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export function subscribeToLeaderboard(callback: (users: UserProfile[]) => void): Unsubscribe {
  const path = 'users';
  try {
    const q = query(collection(db, path), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const results: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          results.push({ ...(docSnap.data() as UserProfile), id: docSnap.id });
        });
        results.sort((a, b) => (b.streak || 0) - (a.streak || 0));
        callback(results);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

// =============================================================
// Database Auto-Seeder & 1-Click Sync for Cloud Firestore
// =============================================================

export async function seedAllDataToFirestore(): Promise<{ quizzesCount: number; questionsCount: number }> {
  let qCount = 0;
  let quizCount = 0;

  try {
    // 1. Upload all questions and keys
    for (const q of seedQuestions) {
      await setDoc(doc(db, 'questions', q.id), q, { merge: true });
      const key = seedQuestionKeys[q.id];
      if (key) {
        await setDoc(doc(db, 'questionKeys', q.id), key, { merge: true });
      }
      qCount++;
    }

    // 2. Upload all published quizzes
    for (const quiz of seedQuizzes) {
      await setDoc(doc(db, 'quizzes', quiz.id), quiz, { merge: true });
      quizCount++;
    }

    // 3. Initial system audit log
    await addDoc(collection(db, 'logs'), {
      id: `log-${Date.now()}`,
      action: 'FIRESTORE_DATABASE_SEEDED',
      user: 'system_admin',
      timestamp: new Date().toLocaleTimeString('bn-BD'),
      details: `Cloud Firestore successfully populated with ${quizCount} exams and ${qCount} questions.`,
      level: 'info',
    });

    return { quizzesCount: quizCount, questionsCount: qCount };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'quizzes/seed');
    throw error;
  }
}

export async function ensureFirestoreInitialSeed(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'quizzes'));
    if (snap.empty) {
      console.log('Cloud Firestore is empty, auto-seeding standard exams and questions...');
      await seedAllDataToFirestore();
    }
  } catch (error) {
    console.warn('Initial seed check note:', error);
  }
}

// =============================================================
// Direct Quizzes & Questions Operations
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

export async function fetchQuestionsByIds(questionIds: string[]): Promise<Question[]> {
  if (!questionIds || questionIds.length === 0) return [];
  const path = 'questions';
  try {
    const results: Question[] = [];
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
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, 'bookmarks', docSnap.id));
      }
      return false;
    } else {
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
    // Non-blocking
  }
}

// =============================================================
// User Profile & Live Streak Operations
// =============================================================

export async function syncUserProfileInFirestore(
  uid: string,
  email: string,
  displayName?: string,
  photoURL?: string,
  statsUpdate?: Partial<UserProfile>
): Promise<void> {
  if (!uid) return;
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const existingSnap = await getDoc(userRef);
    const today = new Date().toISOString().split('T')[0];

    if (existingSnap.exists()) {
      const data = existingSnap.data() as UserProfile;
      const lastDate = data.lastActiveDate || '';
      let streak = data.streak || 1;

      if (lastDate && lastDate !== today) {
        const last = new Date(lastDate);
        const curr = new Date(today);
        const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          streak += 1;
        } else if (diffDays > 1) {
          streak = 1;
        }
      }

      const updatePayload: Partial<UserProfile> = {
        email: email || data.email,
        displayName: displayName || data.displayName || email.split('@')[0],
        photoURL: photoURL || data.photoURL || '',
        streak,
        lastActiveDate: today,
        ...statsUpdate,
      };

      await setDoc(userRef, updatePayload, { merge: true });
    } else {
      const newProfile: UserProfile = {
        id: uid,
        uid,
        email,
        displayName: displayName || email.split('@')[0] || 'শিক্ষার্থী',
        photoURL: photoURL || '',
        role: 'student',
        streak: 1,
        totalExamsTaken: 0,
        totalScore: 0,
        averageAccuracy: 0,
        weakAreas: [],
        lastActiveDate: today,
        createdAt: new Date().toISOString(),
        ...statsUpdate,
      };
      await setDoc(userRef, newProfile);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void): Unsubscribe {
  if (!uid) return () => {};
  const path = `users/${uid}`;
  try {
    return onSnapshot(
      doc(db, 'users', uid),
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ ...(docSnap.data() as UserProfile), uid: docSnap.id });
        } else {
          callback(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}
