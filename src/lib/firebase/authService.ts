// ============================================================================
// BUKKAPP Firebase Authentication Service
// Wraps Firebase Auth with role handling and persistent fallback
// ============================================================================

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';
import { User, UserRole } from '@/types';

export async function firebaseLogin(email: string, pass: string): Promise<FirebaseUser | null> {
  if (!isFirebaseConfigured || !auth) {
    return null;
  }
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
}

export async function firebaseSignup(email: string, pass: string): Promise<FirebaseUser | null> {
  if (!isFirebaseConfigured || !auth) {
    return null;
  }
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  return credential.user;
}

export async function firebaseLogout(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  }
}

export function subscribeToFirebaseAuth(callback: (user: FirebaseUser | null) => void): () => void {
  if (!isFirebaseConfigured || !auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
