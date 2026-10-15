// A link opened while signed out is remembered here, so we can resume it after Google sign-in.
let pendingToken: string | null = null;

export const setPendingInviteToken = (token: string) => {
    pendingToken = token;
};

export const takePendingInviteToken = () => {
    const token = pendingToken;
    pendingToken = null;
    return token;
};
