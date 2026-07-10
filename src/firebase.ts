import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  projectId: "gen-lang-client-0366958966",
  appId: "1:783346450190:web:8eba34c70a701eaf26215f",
  apiKey: "AIzaSyCvWAAqTWym4NItkFBdr1-q1cBDQzQgTeQ",
  authDomain: "gen-lang-client-0366958966.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-naqshefaryadi-89f211f4-8a68-4504-baca-cbfc86a04146",
  storageBucket: "gen-lang-client-0366958966.firebasestorage.app",
  messagingSenderId: "783346450190"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore on the custom database id
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
