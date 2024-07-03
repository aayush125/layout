import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBwekTdnYfi_52RwFxy_aTVBjwGfV4I-00",
  authDomain: "layout-1eea1.firebaseapp.com",
  projectId: "layout-1eea1",
  storageBucket: "layout-1eea1.appspot.com",
  messagingSenderId: "103360653153",
  appId: "1:103360653153:web:4c47488f0ad378c95c8720",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();

export const auth = getAuth();
export const signInWithGooglePopup = () => signInWithPopup(auth, provider);
export const signOutofGoogle = () => signOut(auth);
