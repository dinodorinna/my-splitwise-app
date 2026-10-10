import { UserProfile } from "../../service/users";

export type ProfilesContextType = {
  profiles: Record<string, UserProfile>; // { [uid]: profile }
  friends: UserProfile[]; // everyone I share a group with, minus me
  loading: boolean;
  getProfile: (uid: string) => UserProfile | undefined;
  refresh: (uids?: string[]) => Promise<void>;
};
