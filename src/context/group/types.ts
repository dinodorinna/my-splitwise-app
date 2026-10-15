import type { Timestamp } from '@react-native-firebase/firestore';

export type GroupType = 'trip' | 'home' | 'couple' | 'other';
export type GroupProps = {
    id: string; // document id (not stored in the doc)
    name: string;
    type: GroupType;
    ownerId: string;
    memberIds: string[];
    createdAt: Timestamp | null; // null right after creating (see note)
};

export type GroupDoc = Omit<GroupProps, 'id'>;

export type GroupsContextType = {
    groups: GroupProps[];
    currentGroupId: string | null;
    currentGroup: GroupProps | undefined;
    loading: boolean;
    getGroup: (id: string) => GroupProps | undefined;
    onGroupChange: (groupId: string) => void;
};
