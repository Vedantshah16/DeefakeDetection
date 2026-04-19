// Firebase client SDK initialization for TrueSight AI.
// The config values below are PUBLIC by design (they ship in the frontend bundle).
// Security is enforced by Firebase Auth rules + backend token verification.

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB40y6sPLAbY5VKC6gVGrYw8z-WFOwQm-w",
  authDomain: "truesight-ai-1a895.firebaseapp.com",
  projectId: "truesight-ai-1a895",
  storageBucket: "truesight-ai-1a895.firebasestorage.app",
  messagingSenderId: "227840884343",
  appId: "1:227840884343:web:d2255e4015104f8786d072"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Optional: make sign-in popup prompt account selection every time
googleProvider.setCustomParameters({
  prompt: 'select_account'
});


