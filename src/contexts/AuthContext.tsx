import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { sanitizeForFirestore } from '../services/firestoreStorageService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('terrace_garden_guest_mode') === 'true';
  });
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Set local persistence
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Firebase persistence warning:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuest(false);
        localStorage.removeItem('terrace_garden_guest_mode');
        // Record / update profile doc in Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(
            userRef,
            sanitizeForFirestore({
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Terrace Gardener',
              photoURL: currentUser.photoURL || '',
              lastLoginAt: new Date().toISOString(),
            }),
            { merge: true }
          );
        } catch (err) {
          console.warn('Failed to sync user profile document to Firestore:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setIsGuest(false);
      localStorage.removeItem('terrace_garden_guest_mode');
    } catch (err: unknown) {
      console.error('Google Sign-In failed:', err);
      let message = 'Failed to sign in with Google. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('popup-closed-by-user')) {
          message = 'Sign-in cancelled. Please click "Sign in with Google" to log in.';
        } else if (err.message.includes('popup-blocked')) {
          message = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
        } else if (err.message.includes('network-request-failed')) {
          message = 'Network error while contacting Google. Please check your internet connection.';
        } else if (err.message.includes('auth/unauthorized-domain')) {
          const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
          message = `UNAUTHORIZED_DOMAIN:${currentHost}`;
        } else {
          message = err.message;
        }
      }
      setAuthError(message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsGuest(false);
      localStorage.removeItem('terrace_garden_guest_mode');
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('terrace_garden_guest_mode', 'true');
    setAuthError(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        authError,
        signInWithGoogle,
        signOut,
        continueAsGuest,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
