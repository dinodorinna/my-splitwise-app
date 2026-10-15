import {
    getFirestore,
    doc,
    setDoc,
    getDocs,
    collection,
    query,
    where,
    documentId,
} from "@react-native-firebase/firestore";
import { getAuth } from "@react-native-firebase/auth";

const db = getFirestore();

export type UserProfile = {
    uid: string;
    displayName: string;
    photoURL?: string | null;
};

export async function upsertMyProfile() {
    const user = getAuth().currentUser;
    if (!user) return;
    await setDoc(
        doc(db, "users", user.uid),
        { displayName: user.displayName ?? "", photoURL: user.photoURL ?? null },
        { merge: true },
    );
}

// Fetch profiles by uid (Firestore "in" queries are capped at 30 ids)
export async function getProfilesByIds(ids: string[]): Promise<UserProfile[]> {
    const profiles: UserProfile[] = [];
    for (let i = 0; i < ids.length; i += 30) {
        const snap = await getDocs(
            query(collection(db, "users"), where(documentId(), "in", ids.slice(i, i + 30))),
        );
        snap.docs.forEach((d) =>
            profiles.push({ uid: d.id, ...(d.data() as Omit<UserProfile, "uid">) }),
        );
    }
    return profiles;
}

export async function getAllFriends(): Promise<UserProfile[]> {
    const me = getAuth().currentUser;
    if (!me) throw new Error("Not signed in");

    const groupSnap = await getDocs(
        query(collection(db, "groups"), where("memberIds", "array-contains", me.uid)),
    );

    const friendIds = new Set<string>();
    groupSnap.docs.forEach((d) => {
        (d.data().memberIds as string[]).forEach((uid) => {
            if (uid !== me.uid) friendIds.add(uid);
        });
    });

    const friends = await getProfilesByIds([...friendIds]);
    return friends.sort((a, b) => a.displayName.localeCompare(b.displayName));
}
