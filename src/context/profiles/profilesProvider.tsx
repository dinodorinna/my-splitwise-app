import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../auth/authContext";
import { useGroupsContext } from "../group/groupsContext";
import { getProfilesByIds, UserProfile } from "../../service/users";
import { ProfilesContext } from "./profilesContext";
import { ProfilesContextType } from "./types";

type ProfilesProviderProps = {
  children: ReactNode;
};

// Must be rendered inside GroupsProvider: member uids come from my groups,
// so we don't need a second groups query like getAllFriends() does.
export function ProfilesProvider({ children }: ProfilesProviderProps) {
  const { user } = useAuth();
  const { groups, loading: groupsLoading } = useGroupsContext();
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [pending, setPending] = useState(0);
  // uids already fetched or in flight, so each profile is read only once
  const requested = useRef(new Set<string>());

  const fetchProfiles = useCallback(async (uids: string[]) => {
    if (uids.length === 0) return;
    uids.forEach((uid) => requested.current.add(uid));
    setPending((n) => n + 1);
    try {
      const list = await getProfilesByIds(uids);
      setProfiles((prev) => {
        const next = { ...prev };
        list.forEach((p) => (next[p.uid] = p));
        return next;
      });
    } catch (e) {
      uids.forEach((uid) => requested.current.delete(uid)); // allow retry
      console.warn("Failed to load profiles", e);
    } finally {
      setPending((n) => n - 1);
    }
  }, []);

  // Reset the cache when the signed-in user changes
  useEffect(() => {
    requested.current = new Set();
    setProfiles({});
  }, [user?.uid]);

  const memberIds = useMemo(() => {
    const ids = new Set<string>();
    groups.forEach((g) => (g.memberIds ?? []).forEach((uid) => ids.add(uid)));
    return [...ids];
  }, [groups]);

  console.log({ memberIds });

  // Fetch only the uids we haven't seen yet (e.g. someone joined a group)
  useEffect(() => {
    if (!user) return;
    fetchProfiles(memberIds.filter((uid) => !requested.current.has(uid)));
  }, [user?.uid, memberIds, fetchProfiles]);

  const refresh = useCallback(
    (uids?: string[]) => fetchProfiles(uids ?? memberIds),
    [fetchProfiles, memberIds],
  );

  const friends = useMemo(
    () =>
      memberIds
        .filter((uid) => uid !== user?.uid)
        .map((uid) => profiles[uid])
        .filter((p): p is UserProfile => !!p)
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [memberIds, profiles, user?.uid],
  );

  const value = useMemo<ProfilesContextType>(
    () => ({
      profiles,
      friends,
      loading: groupsLoading || pending > 0,
      getProfile: (uid: string) => profiles[uid],
      refresh,
    }),
    [profiles, friends, groupsLoading, pending, refresh],
  );

  return (
    <ProfilesContext.Provider value={value}>
      {children}
    </ProfilesContext.Provider>
  );
}
