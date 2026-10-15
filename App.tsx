import { SafeAreaProvider } from "react-native-safe-area-context";
import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation/rootNavigation";
import { AuthProvider } from "./src/context/auth/authProvider";
import { GroupsProvider } from "./src/context/group/groupsProvider";
import { ProfilesProvider } from "./src/context/profiles/profilesProvider";
import { ThemeProvider } from "./src/context/theme/themeProvider";
import { MainStackParamList } from "./src/navigation/mainNavigator";

export default function App() {
    const linking: LinkingOptions<MainStackParamList> = {
        prefixes: ["splitzy://"],
        config: {
            screens: {
                JoinGroup: "invite/:groupId/:inviteId",
            },
        },
    };

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <GroupsProvider>
                    <ProfilesProvider>
                        <ThemeProvider>
                            <NavigationContainer>
                                <RootNavigator />
                            </NavigationContainer>
                        </ThemeProvider>
                    </ProfilesProvider>
                </GroupsProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
