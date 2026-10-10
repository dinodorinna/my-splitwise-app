import { createContext, useContext } from "react";
import { GroupsContextType } from "./types";

export const GroupsContext = createContext<GroupsContextType | undefined>(
  undefined,
);

export function useGroupsContext(): GroupsContextType {
  const context = useContext(GroupsContext);
  if (context === undefined) {
    throw new Error("useGroupsContext must be used within a GroupsProvider");
  }
  return context;
}
