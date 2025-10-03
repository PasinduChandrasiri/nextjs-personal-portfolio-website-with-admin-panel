// Firebase configuration and helper functions
// This file initializes Firebase and exports the services used in the app.

import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Pull config from environment variables. These are exposed via NEXT_PUBLIC_*
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialise Firebase only once (during hot reload the same app instance is reused)
function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
}

// Export database and auth services
export const app = getFirebaseApp();
export const database = getDatabase(app);
export const auth = getAuth(app);



// const firebaseConfig = {
//   apiKey: "AIzaSyDb6BbwPCZowiqls971pYognyR6KNW_TBM",
//   authDomain: "dev-portfolio-26e43.firebaseapp.com",
//   databaseURL: "https://dev-portfolio-26e43-default-rtdb.firebaseio.com",
//   projectId: "dev-portfolio-26e43",
//   storageBucket: "dev-portfolio-26e43.firebasestorage.app",
//   messagingSenderId: "573376511287",
//   appId: "1:573376511287:web:9343a50fc41daf0539aeb2"
// };

