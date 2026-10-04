import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCi9YjQxlmZNulQE6HmCGNheIn2l4WEdhY",
  authDomain: "sgram-ff75e.firebaseapp.com",
  projectId: "sgram-ff75e",
  storageBucket: "sgram-ff75e.firebasestorage.app",
  messagingSenderId: "923028873984",
  appId: "1:923028873984:web:920f32c6ab2a5e6e0a49e5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth, db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc, setDoc, getDoc,
  collection, query, where, getDocs,
  serverTimestamp
};