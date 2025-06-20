// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAF_rbGCJeQ6GF7a0kLi_SgsQRhVoHbGp4",
  authDomain: "pocketmoney-72e6a.firebaseapp.com",
  projectId: "pocketmoney-72e6a",
  storageBucket: "pocketmoney-72e6a.firebasestorage.app",
  messagingSenderId: "825952168133",
  appId: "1:825952168133:web:8b9979af4d393ef59768ac",
  measurementId: "G-P1YQ28G5N4",
};

const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
