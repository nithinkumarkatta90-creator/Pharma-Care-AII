import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

const redirectFallbackCodes = new Set([
  'auth/popup-blocked',
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/operation-not-supported-in-this-environment',
]);

export async function ensureUserProfile(user: User, fallbackName = '') {
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);
  const now = new Date().toISOString();

  await setDoc(
    userRef,
    {
      name: user.displayName || fallbackName,
      email: user.email,
      photoURL: user.photoURL || '',
      role: existing.exists() ? existing.data().role || 'user' : 'user',
      createdAt: existing.exists() ? existing.data().createdAt || now : now,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    if (redirectFallbackCodes.has(error.code)) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    throw error;
  }
}

export async function completeGoogleRedirectSignIn() {
  const result = await getRedirectResult(auth);

  if (!result?.user) {
    return null;
  }

  await ensureUserProfile(result.user);
  return result.user;
}

export function getAuthErrorMessage(error: any, fallback: string) {
  switch (error?.code) {
    case 'auth/unauthorized-domain':
      return `This domain (${window.location.hostname}) is not authorized in Firebase Authentication. Add ${window.location.hostname} and your production domain in Firebase console.`;
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled in Firebase Authentication. Enable Google as a sign-in provider in Firebase console.';
    case 'auth/popup-blocked':
      return 'The Google sign-in popup was blocked. Allow popups for this site and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using another sign-in method.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid email or password.';
    case 'auth/user-not-found':
      return 'No account was found for this email.';
    default:
      return error?.message || fallback;
  }
}
