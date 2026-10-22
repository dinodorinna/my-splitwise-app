import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useThemeContext } from '../../../context/theme/themeContext';
import { GroupDashboardScreen } from '../../../screens/dashboard/groupDashboardScreen';
import { ActivityScreen } from '../../../screens/dashboard/activityScreen';
import { FriendsScreen } from '../../../screens/dashboard/friendsScreen';
import { AccountScreen } from '../../../screens/dashboard/accountScreen';
import { User, UserPlus, Users, Zap } from 'lucide-react-native';
import { MainNavigatorProps } from '../../../navigation/mainNavigator';
import { themes } from '../../../context/theme/themeProvider';

export type MainTabParamList = {
    Groups: undefined;
    Activity: undefined;
    Friends: undefined;
    Account: undefined;
};

const BRAND = themes.main.primary;

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = ({ user }: MainNavigatorProps) => {
    const { themes, mode, scheme } = useThemeContext();
    const isDark = scheme === 'dark';
    const inactiveColor = isDark ? themes.palate.gray : '#9CA3AF';

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: BRAND,
                tabBarInactiveTintColor: inactiveColor,
                tabBarStyle: {
                    backgroundColor: mode.background,
                    borderTopColor: isDark ? '#FFFFFF14' : '#00000010',
                },
            }}
        >
            <Tab.Screen
                name="Groups"
                component={GroupDashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
                }}
            />
            {/* <Tab.Screen
                name="Activity"
                component={ActivityScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Zap color={color} size={size} />,
                }}
            /> */}
            <Tab.Screen
                name="Friends"
                component={FriendsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <UserPlus color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Account"
                options={{
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            >
                {() => <AccountScreen user={user} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};
