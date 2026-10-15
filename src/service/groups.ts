import {
    getFirestore,
    collection,
    doc,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    writeBatch,
} from "@react-native-firebase/firestore";

import { getAuth } from "@react-native-firebase/auth";
import { GroupDoc, GroupProps, GroupType } from "../context/group/types";
const db = getFirestore();

export type { GroupProps, GroupType };
export type TypeTemplate = {
    id: string;
    icon: React.ReactElement;
    type: GroupType;
    detail: string;
};

// Create a group
export async function createGroup(name: string, type: GroupType, inviteEmails: string[] = []) {
    const user = getAuth().currentUser;
    if (!user) throw new Error("Not signed in");

    const groupRef = doc(collection(db, "groups")); // generate the id first
    const batch = writeBatch(db);

    batch.set(groupRef, {
        name,
        type,
        ownerId: user.uid,
        memberIds: [user.uid],
        createdAt: serverTimestamp(),
    });

    for (const email of inviteEmails) {
        batch.set(doc(collection(db, "groups", groupRef.id, "invites")), {
            email: email.trim().toLowerCase(),
            groupName: name,
            invitedBy: user.uid,
            invitedByName: user.displayName ?? "",
            status: "pending",
            createdAt: serverTimestamp(),
        });
    }

    await batch.commit(); // group and invites are saved together, or not at all
    return groupRef.id;
}

// Listen to my groups (real-time)
export function subscribeToMyGroups(
    uid: string,
    onChange: (groups: GroupProps[]) => void,
    onError?: (error: Error) => void,
) {
    const q = query(
        collection(db, "groups"),
        where("memberIds", "array-contains", uid),
        orderBy("createdAt", "desc"),
    );

    return onSnapshot(
        q,
        (snapshot) => {
            onChange(
                (snapshot?.docs ?? []).map((d) => ({
                    id: d.id,
                    ...(d.data() as GroupDoc),
                })),
            );
        },
        (error) => {
            // e.g. permission-denied after sign-out, or a missing composite index
            console.warn("Failed to listen to groups", error);
            onError?.(error);
        },
    );
}
