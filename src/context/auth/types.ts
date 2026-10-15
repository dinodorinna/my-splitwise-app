import { AppUser } from "../../auth/types";

export type AuthContextType = {
    user: AppUser | null;
    initializing: boolean;
};
