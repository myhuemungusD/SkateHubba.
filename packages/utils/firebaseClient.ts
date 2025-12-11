import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
};

const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Check if we have a valid config (at least apiKey)
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'dummy-api-key') {
    console.warn("Firebase API Key is missing or invalid. Using a dummy config for build/dev purposes.");
    
    // If we are in the browser (not build server), alert the user
    if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
      console.error("CRITICAL: Firebase Environment Variables are missing in Vercel!");
    }

    // Return a dummy app to prevent build crashes when env vars are missing
    return initializeApp({
      apiKey: "AIzaSyDummyKeyForBuildProcessOnly",
      authDomain: "dummy.firebaseapp.com",
      projectId: "dummy-project",
      storageBucket: "dummy.appspot.com",
      messagingSenderId: "00000000000",
      appId: "1:00000000000:web:00000000000000"
    }, "dummy-app");
  }

  return initializeApp(firebaseConfig);
};

export const firebaseApp = getFirebaseApp();

export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp);
