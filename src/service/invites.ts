import { getAuth } from '@react-native-firebase/auth';
import {
    arrayUnion,
    collection,
    collectionGroup,
    doc,
    getDoc,
    getCountFromServer,
    getDocs,
    getFirestore,
    setDoc,
    Timestamp,
    query,
    serverTimestamp,
    where,
    writeBatch,
} from '@react-native-firebase/firestore';

export type InviteProps = {
    id: string;
    groupId: string;
    groupName: string;
    email: string | null; // null = link invite
    invitedBy: string;
    invitedByName: string;
    status: 'pending' | 'accepted';
};

const db = getFirestore();
const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Invite by email to an existing group. */
export async function inviteByEmail(groupId: string, groupName: string, email: string) {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not signed in');

    const batch = writeBatch(db);
    batch.set(doc(collection(db, 'groups', groupId, 'invites')), {
        email: normalizeEmail(email),
        groupName,
        invitedBy: user.uid,
        invitedByName: user.displayName ?? '',
        status: 'pending',
        createdAt: serverTimestamp(),
    });
    await batch.commit();
}

export const INVITE_LINK_TTL_DAYS = 7;
const INVITE_LINK_BASE = 'https://splitzy-ceb27.web.app/invite';

/**
 * Public snapshot behind a share link, stored at inviteLinks/{token}.
 * The doc id IS the token (Firestore auto-id: 20 random chars), so it can be read with `get`
 * by whoever holds the link, but never listed. Nothing else about the group is exposed.
 */
export type InviteLink = {
    token: string;
    groupId: string;
    groupName: string;
    groupType: string;
    invitedBy: string;
    invitedByName: string;
    memberCount: number;
    memberNames: string[]; // first few, for the avatar row
    expenseCount: number;
    groupCreatedAt: Timestamp | null;
    expiresAt: Timestamp;
    revoked: boolean;
};

export type InviteLinkResult =
    | { status: 'valid'; link: InviteLink }
    | { status: 'expired'; link: InviteLink }
    | { status: 'invalid' }; // unknown token, revoked, or unreadable

export type InviteLinkGroup = {
    id: string;
    name: string;
    type: string;
    memberIds: string[];
    createdAt: Timestamp | null;
};

/** Create a shareable link invite that expires after INVITE_LINK_TTL_DAYS. Returns the URL. */
export async function createInviteLink(group: InviteLinkGroup, memberNames: string[] = []) {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not signed in');

    let expenseCount = 0;
    try {
        const count = await getCountFromServer(collection(db, 'groups', group.id, 'expenses'));
        expenseCount = count.data().count;
    } catch {
        // the preview just shows 0 expenses
    }

    const ref = doc(collection(db, 'inviteLinks'));
    await setDoc(ref, {
        groupId: group.id,
        groupName: group.name,
        groupType: group.type,
        invitedBy: user.uid,
        invitedByName: user.displayName ?? '',
        memberCount: group.memberIds.length,
        memberNames: memberNames.slice(0, 3),
        expenseCount,
        groupCreatedAt: group.createdAt,
        revoked: false,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + INVITE_LINK_TTL_DAYS * 24 * 60 * 60 * 1000),
    });
    return `${INVITE_LINK_BASE}/${ref.id}`;
}

/** Look up a link by token. Works signed out; the Firestore rules must allow `get` on inviteLinks. */
export async function getInviteLink(token: string): Promise<InviteLinkResult> {
    // Cheap guard: ignore anything that can't be an auto-id, so guesses never hit Firestore
    if (!/^[A-Za-z0-9]{20}$/.test(token)) return { status: 'invalid' };
    try {
        const snap = await getDoc(doc(db, 'inviteLinks', token));
        if (!snap.exists()) return { status: 'invalid' };
        const link = { token: snap.id, ...(snap.data() as Omit<InviteLink, 'token'>) };
        if (link.revoked) return { status: 'invalid' };
        if (link.expiresAt.toMillis() <= Date.now()) return { status: 'expired', link };
        return { status: 'valid', link };
    } catch (e) {
        console.warn('Failed to read invite link', e);
        return { status: 'invalid' };
    }
}

/** Join the group through a link. The rules re-check expiry server-side via joins.inviteId. */
export async function acceptInviteLink(link: InviteLink) {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not signed in');

    const batch = writeBatch(db);
    batch.set(doc(db, 'groups', link.groupId, 'joins', user.uid), {
        inviteId: link.token,
        joinedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'groups', link.groupId), { memberIds: arrayUnion(user.uid) });
    await batch.commit();
}

/** Read one invite (used when opening a link). */
export async function getInvite(groupId: string, inviteId: string): Promise<InviteProps | null> {
    const snap = await getDoc(doc(db, 'groups', groupId, 'invites', inviteId));
    if (!snap.exists()) return null;
    return {
        id: snap.id,
        groupId,
        ...(snap.data() as Omit<InviteProps, 'id' | 'groupId'>),
    };
}

/** Pending email invites for the signed-in user, across all groups. */
export async function getMyPendingInvites(): Promise<InviteProps[]> {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not signed in');
    if (!user.email) return [];

    const q = query(
        collectionGroup(db, 'invites'),
        where('email', '==', normalizeEmail(user.email)),
        where('status', '==', 'pending'),
    );
    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
        id: d.id,
        groupId: d.ref.parent.parent!.id,
        ...(d.data() as Omit<InviteProps, 'id' | 'groupId'>),
    }));
}

/** Join the group using an invite. */
export async function acceptInvite(invite: InviteProps) {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Not signed in');

    const batch = writeBatch(db);

    batch.set(doc(db, 'groups', invite.groupId, 'joins', user.uid), {
        inviteId: invite.id,
        joinedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'groups', invite.groupId), {
        memberIds: arrayUnion(user.uid),
    });
    // Email invites are single-use; link invites stay reusable
    if (invite.email) {
        batch.update(doc(db, 'groups', invite.groupId, 'invites', invite.id), {
            status: 'accepted',
            acceptedBy: user.uid,
        });
    }

    await batch.commit();
}
