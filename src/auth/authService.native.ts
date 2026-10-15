import {
    GoogleSignin,
    isSuccessResponse,
    isErrorWithCode,
    statusCodes,
} from "@react-native-google-signin/google-signin";
import {
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    signOut as firebaseSignOut,
} from "@react-native-firebase/auth";
import { AppUser } from "./types";
import { upsertMyProfile } from "../service/users";

GoogleSignin.configure({
    webClientId: "345418081208-9hm9l0b1nhgjqovkdci1g7bt4a66s795.apps.googleusercontent.com",
});

export async function signInWithGoogle() {
    try {
        await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
        });

        // 1. Native Google popup
        const response = await GoogleSignin.signIn();
        if (!isSuccessResponse(response)) return; // user cancelled

        const idToken = response.data.idToken;
        if (!idToken) throw new Error("No idToken returned. Check webClientId.");

        // 2. Hand the Google token to Firebase
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(getAuth(), credential);
        await upsertMyProfile();
    } catch (error) {
        if (isErrorWithCode(error) && error.code === statusCodes.IN_PROGRESS) return;
        console.warn("Google sign-in failed", error);
    }
}

export async function handleSignOut() {
    await GoogleSignin.signOut(); // clear the Google session
    await firebaseSignOut(getAuth()); // clear the Firebase session
}

export function subscribeToAuth(callback: (user: AppUser | null) => void) {
    return onAuthStateChanged(getAuth(), (u) =>
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
