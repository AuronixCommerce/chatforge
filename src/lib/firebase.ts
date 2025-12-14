
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import 'dotenv/config';

const firebaseConfig = {
  projectId: "chatforge-ai-tj6ol",
  appId: "1:328718085562:web:5cb7208048d47801edc183",
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyB_W4nF30VWw-e6JoAkZORyf3yP3P1K94o", // Use env var if available
  authDomain: "chatforge-ai-tj6ol.firebaseapp.com",
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

export function getDb(): Firestore {
    return db;
}
