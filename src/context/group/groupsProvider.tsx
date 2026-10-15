import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/authContext';
import { GroupProps, GroupsContextType } from './types';
import { subscribeToMyGroups } from '../../service/groups';
import { GroupsContext } from './groupsContext';

type GroupsProviderProps = {
    children: ReactNode;
};
export function GroupsProvider({ children }: GroupsProviderProps) {
    const { user } = useAuth();
    const [groups, setGroups] = useState<GroupProps[]>([]);
    const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
    const currentGroup = groups.find((g) => g.id === currentGroupId) ?? groups[0];
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setGroups([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        return subscribeToMyGroups(
            user.uid,
            (list) => {
                setGroups(list);
                console.log({ list });
                setLoading(false);
            },
            () => {
                setGroups([]);
                setLoading(false);
            },
        );
    }, [user?.uid]);

    const onGroupChange = useCallback(
        (groupId: string) => {
            setCurrentGroupId(groupId);
        },
        [setCurrentGroupId],
    );

    const value = useMemo<GroupsContextType>(
        () => ({
            groups,
            currentGroupId,
            currentGroup,
            loading,
            getGroup: (id: string) => groups.find((g) => g.id === id),
            onGroupChange,
        }),
        [groups, loading],
    );

    return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
}
