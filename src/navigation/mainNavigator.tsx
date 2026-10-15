import {
    createNativeStackNavigator,
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { AppUser } from '../auth/types';
import { MainTabs } from '../components/ui/navigation/mainTabs';
import { Pressable, Text } from 'react-native';
import { NewGroupScreen } from '../screens/group/newGroupScreen';
import { createGroup } from '../service/groups';
import { JoinGroupScreen } from '../screens/group/joinGroupScreen';
import { ExistGroupDrawerScreen } from '../screens/group/existGroupDrawerScreen';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { takePendingInviteToken } from '../service/pendingInvite';
import { AddExpenseScreen } from '../screens/expense/addExpenseScreen';

export type MainStackParamList = {
    MainTabs: undefined;
    NewGroup: { groupName?: string } | undefined;
    ExistGroupDrawer: undefined;
    JoinGroup: { token: string };
    AddExpense: { groupId: string; expenseId?: string };
};

export type MainNavigatorProps = {
    user: AppUser | null;
};

// Resume an invite link that was opened before sign-in
const PendingInviteRedirect = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    useEffect(() => {
        const token = takePendingInviteToken();
        if (token) navigation.navigate('JoinGroup', { token });
    }, [navigation]);
    return null;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
export const MainNavigator = ({ user }: MainNavigatorProps) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs">
                {() => (
                    <>
                        <MainTabs user={user} />
                        <PendingInviteRedirect />
                    </>
                )}
            </Stack.Screen>
            <Stack.Screen
                name="NewGroup"
                component={NewGroupScreen}
                options={{
                    presentation: 'modal',
                    headerShown: true,
                    title: 'New group',
                    headerShadowVisible: false,
                }}
            />
            <Stack.Screen
                name="ExistGroupDrawer"
                component={ExistGroupDrawerScreen}
                options={{
                    presentation: 'formSheet',
                    headerShown: false,
                    title: 'Your groups',
                    sheetAllowedDetents: 'fitToContents',
                    sheetGrabberVisible: true,
                    sheetCornerRadius: 16,
                }}
            />
            <Stack.Screen
                name="JoinGroup"
                component={JoinGroupScreen}
                options={{
                    presentation: 'modal',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="AddExpense"
                component={AddExpenseScreen}
                options={{
                    presentation: 'modal',
                    headerShown: true,
                    title: 'Add Expense',
                    headerShadowVisible: false,
                }}
            />
        </Stack.Navigator>
    );
};
