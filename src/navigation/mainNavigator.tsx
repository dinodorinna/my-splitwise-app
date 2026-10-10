import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppUser } from "../auth/types";
import { MainTabs } from "../components/ui/navigation/mainTabs";
import { Pressable, Text } from "react-native";
import { NewGroupScreen } from "../screens/group/newGroupScreen";
import { createGroup } from "../service/groups";
import { JoinGroupScreen } from "../screens/group/joinGroupScreen";

export type MainStackParamList = {
  MainTabs: undefined;
  NewGroup: undefined;
  JoinGroup: { groupId: string; inviteId: string };
};

export type MainNavigatorProps = {
  user: AppUser | null;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
export const MainNavigator = ({ user }: MainNavigatorProps) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => <MainTabs user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="NewGroup"
        component={NewGroupScreen}
        options={{
          presentation: "modal",
          headerShown: true,
          title: "New group",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="JoinGroup"
        component={JoinGroupScreen}
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Join group",
        }}
      />
    </Stack.Navigator>
  );
};
