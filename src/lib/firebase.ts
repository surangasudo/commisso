
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBBB5Sl3XmcRjMLBoTkNCeRn9xQgCuj5E0',
  authDomain: 'commisso.firebaseapp.com',
  projectId: 'commisso',
  storageBucket: 'commisso.firebasestorage.app',
  messagingSenderId: '297541340555',
  appId: '1:297541340555:web:7130bc6caa8e2d6743f38e'
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

