
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDgl8RYnzn78ItiRdEcbn-HlJHVCUn4x8",
  authDomain: "crimsonpos.firebaseapp.com",
  projectId: "crimsonpos",
  storageBucket: "crimsonpos.firebasestorage.app",
  messagingSenderId: "242700334573",
  appId: "1:242700334573:web:9269d64d8404ae19cda3e4",
  measurementId: "G-8LPGS8HCBN"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
