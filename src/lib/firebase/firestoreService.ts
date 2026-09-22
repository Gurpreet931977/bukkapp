// ============================================================================
// BUKKAPP Cloud Firestore Service
// Provides real-time and document synchronization with Firebase Firestore
// ============================================================================

import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { Booking, Business, Review, User } from '@/types';

export async function syncBookingToFirestore(booking: Booking): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const ref = doc(db, 'bookings', booking.id);
    await setDoc(ref, booking, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore booking sync warning:', err);
    return false;
  }
}

export async function syncBusinessToFirestore(business: Business): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const ref = doc(db, 'businesses', business.id);
    await setDoc(ref, business, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore business sync warning:', err);
    return false;
  }
}

export async function syncReviewToFirestore(review: Review): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const ref = doc(db, 'reviews', review.id);
    await setDoc(ref, review, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore review sync warning:', err);
    return false;
  }
}

export async function syncUserToFirestore(user: User): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const ref = doc(db, 'users', user.id);
    await setDoc(ref, user, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore user sync warning:', err);
    return false;
  }
}
