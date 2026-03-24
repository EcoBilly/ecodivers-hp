import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAOKo-7TrKA8vrBOZRd72QoE8G4vJWpPv8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ecodivers-61b6f.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ecodivers-61b6f",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ecodivers-61b6f.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "456756337579",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:456756337579:web:81b715862015ea3fb850ee",
};

// Initialize Firebase only if it hasn't been initialized already and we're not in a build environment without keys
const app = getApps().length === 0 
  ? (firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null)
  : getApps()[0];

const db = app ? getFirestore(app) : null as any;

if (!app) {
  console.warn("Firebase App not initialized. Check your environment variables.");
} else {
  console.log("Firebase App initialized (v1.1) for project:", firebaseConfig.projectId);
}

export { db, app };
