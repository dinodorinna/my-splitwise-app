import { initializeApp, getApps, getApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
} from "firebase/auth";
import type { AppUser } from "./types";

const firebaseConfig = {
    apiKey: "AIzaSyB7KN4Oyr6QjUOZZVZq1X_1SbeR5o4cumw",
    authDomain: "splitzy-ceb27.firebaseapp.com",
    projectId: "splitzy-ceb27",
    storageBucket: "splitzy-ceb27.firebasestorage.app",
    messagingSenderId: "345418081208",
    appId: "1:345418081208:web:28a0bdfc09cf0c5028a54d",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
}

export async function signOut() {
    await firebaseSignOut(auth);
}

export function subscribeToAuth(callback: (user: AppUser | null) => void) {
    return onAuthStateChanged(auth, (u) =>
        callback(
            u
                ? {
                      uid: u.uid,
                      displayName: u.displayName,
                      email: u.email,
                      photoURL: u.photoURL,
                  }
                : null,
        ),
    );
}
