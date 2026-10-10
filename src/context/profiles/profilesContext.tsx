import { createContext, useContext } from "react";
import { ProfilesContextType } from "./types";

export const ProfilesContext = createContext<ProfilesContextType | undefined>(
  undefined,
);

export function useProfiles(): ProfilesContextType {
  const context = useContext(ProfilesContext);
  if (context === undefined) {
    throw new Error("useProfiles must be used within a ProfilesProvider");
  }
  return context;
}
