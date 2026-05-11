import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD_9jNSBy5Th0elj8HkjAFr9P8hqXdUELw",
  authDomain: "test-bot-1f9e7.firebaseapp.com",
  projectId: "test-bot-1f9e7",
  storageBucket: "test-bot-1f9e7.firebasestorage.app",
  messagingSenderId: "119758342157",
  appId: "1:119758342157:web:106dac393ccf426f746d44",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
