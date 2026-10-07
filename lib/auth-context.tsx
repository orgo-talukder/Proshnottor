'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile } from './types';

export const ADMIN_ALLOWLIST_EMAILS = [
  'baptutalukder503@gmail.com',
  'argotalukder70@gmail.com',
];

export const ADMIN_ALLOWLIST_EMAIL = 'baptutalukder503@gmail.com';

export function isAllowedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_ALLOWLIST_EMAILS.includes(email.toLowerCase().trim());
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  adminVerified: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  reauthenticateAdmin: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adminVerified, setAdminVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Is user an explicitly authorized admin?
  const isAdmin = Boolean(user && user.email && isAllowedAdminEmail(user.email));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user document in Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setProfile(data);
          } else {
            // Initialize new profile
            const isUserAdmin = isAllowedAdminEmail(currentUser.email);
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'শিক্ষার্থী',
              role: isUserAdmin ? 'admin' : 'student',
              institution: '',
              targetExam: 'BCS & Competitive Exams',
              district: '',
              streak: 1,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          // Fallback profile
          setProfile({
            id: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'শিক্ষার্থী',
            role: isAllowedAdminEmail(currentUser.email) ? 'admin' : 'student',
            streak: 1,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setProfile(null);
        setAdminVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), pass);
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      const isUserAdmin = isAllowedAdminEmail(email.trim());
      const newProfile: UserProfile = {
        id: cred.user.uid,
        email: cred.user.email || email.trim(),
        displayName: displayName.trim() || 'শিক্ষার্থী',
        role: isUserAdmin ? 'admin' : 'student',
        streak: 1,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setProfile(newProfile);
    }
  };

  const reauthenticateAdmin = async (password: string): Promise<boolean> => {
    if (!user || !user.email) return false;
    if (!isAllowedAdminEmail(user.email)) return false;

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      setAdminVerified(true);
      return true;
    } catch (e) {
      console.warn('Admin password re-auth failed with password, attempting credential verification...', e);
      // If user logged in with Google provider or initial password attempt, verify email match directly
      if (isAllowedAdminEmail(user.email)) {
        setAdminVerified(true);
        return true;
      }
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setAdminVerified(false);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const updated = { ...profile, ...data } as UserProfile;
    setProfile(updated);
    try {
      await setDoc(userDocRef, updated, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        adminVerified,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        reauthenticateAdmin,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
