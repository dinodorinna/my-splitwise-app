import { getAuth } from "@react-native-firebase/auth";
import {
  arrayUnion,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "@react-native-firebase/firestore";

export type InviteProps = {
  id: string;
  groupId: string;
  groupName: string;
  email: string | null; // null = link invite
  invitedBy: string;
  invitedByName: string;
  status: "pending" | "accepted";
};

const db = getFirestore();
const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Invite by email to an existing group. */
export async function inviteByEmail(
  groupId: string,
  groupName: string,
  email: string,
) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not signed in");

  const batch = writeBatch(db);
  batch.set(doc(collection(db, "groups", groupId, "invites")), {
    email: normalizeEmail(email),
    groupName,
    invitedBy: user.uid,
    invitedByName: user.displayName ?? "",
    status: "pending",
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

/** Create a shareable link invite. Returns the URL. */
export async function createInviteLink(groupId: string, groupName: string) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not signed in");

  const ref = doc(collection(db, "groups", groupId, "invites"));
  const batch = writeBatch(db);
  batch.set(ref, {
    email: null,
    groupName,
    invitedBy: user.uid,
    invitedByName: user.displayName ?? "",
    status: "pending",
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  return `https://splitzy-xxxx.web.app/invite/${groupId}/${ref.id}`;
}

/** Read one invite (used when opening a link). */
export async function getInvite(
  groupId: string,
  inviteId: string,
): Promise<InviteProps | null> {
  const snap = await getDoc(doc(db, "groups", groupId, "invites", inviteId));
  if (!snap.exists()) return null;
  return {
    id: snap.id,
    groupId,
    ...(snap.data() as Omit<InviteProps, "id" | "groupId">),
  };
}

/** Pending email invites for the signed-in user, across all groups. */
export async function getMyPendingInvites(): Promise<InviteProps[]> {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not signed in");
  if (!user.email) return [];

  const q = query(
    collectionGroup(db, "invites"),
    where("email", "==", normalizeEmail(user.email)),
    where("status", "==", "pending"),
  );
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    groupId: d.ref.parent.parent!.id,
    ...(d.data() as Omit<InviteProps, "id" | "groupId">),
  }));
}

/** Join the group using an invite. */
export async function acceptInvite(invite: InviteProps) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not signed in");

  const batch = writeBatch(db);

  batch.set(doc(db, "groups", invite.groupId, "joins", user.uid), {
    inviteId: invite.id,
    joinedAt: serverTimestamp(),
  });
  batch.update(doc(db, "groups", invite.groupId), {
    memberIds: arrayUnion(user.uid),
  });
  // Email invites are single-use; link invites stay reusable
  if (invite.email) {
    batch.update(doc(db, "groups", invite.groupId, "invites", invite.id), {
      status: "accepted",
      acceptedBy: user.uid,
    });
  }

  await batch.commit();
}
