// src/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, enableLogging } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Make sure these env vars are defined in .env.local and ALL start with NEXT_PUBLIC_
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // *** CRITICAL ***
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Avoid duplicate init in Next dev
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// RTDB instance bound to the EXACT databaseURL above
export const database = getDatabase(app);

// TEMP: turn on verbose RTDB logs so you see the write in the console
if (typeof window !== 'undefined') {
  enableLogging(true); // comment this out later
}

export const auth = getAuth(app);
