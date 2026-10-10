import { AuthNavigator } from "./authNavigator";
import { MainNavigator } from "./mainNavigator";
import { useAuth } from "../context/auth/authContext";

export const RootNavigator = () => {
  const { user, initializing } = useAuth();

  if (initializing) return null;
  return user ? <MainNavigator user={user} /> : <AuthNavigator />;
};
