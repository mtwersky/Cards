// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCZXFCXXxenKLoBjQc0XGqc3zQjgLPJgfU",
    authDomain: "category-cards.firebaseapp.com",
    projectId: "category-cards",
    storageBucket: "category-cards.firebasestorage.app",
    messagingSenderId: "48864669825",
    appId: "1:48864669825:web:6b19bd3a3ac19ae2cb1d80"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);
