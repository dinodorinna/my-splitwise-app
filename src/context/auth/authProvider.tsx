import { ReactNode, useEffect, useMemo, useState } from "react";
import { subscribeToAuth } from "../../auth/authService";
import { AppUser } from "../../auth/types";
import { AuthContext } from "./authContext";

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(
        () =>
            subscribeToAuth((u) => {
                setUser(u);
                setInitializing(false);
            }),
        [],
    );

    const value = useMemo(() => ({ user, initializing }), [user, initializing]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
