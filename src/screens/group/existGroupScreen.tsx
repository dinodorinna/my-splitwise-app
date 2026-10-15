import {
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GroupMember, Member } from '../../components/ui/group/groupMembers';
import { GroupOverview } from '../../components/ui/group/groupOverview';
import { GroupHeader } from '../../components/ui/group/groupHeader';
import { Plus } from 'lucide-react-native';
import { useThemeContext } from '../../context/theme/themeContext';
import { useGroupsContext } from '../../context/group/groupsContext';
import { useMemo, useState } from 'react';
import { InviteMemberSheet } from '../../components/ui/friend/inviteMemberSheet';
import { createInviteLink } from '../../service/invites';
import { themes } from '../../context/theme/themeProvider';
import { useAuth } from '../../context/auth/authContext';
import { useProfiles } from '../../context/profiles/profilesContext';
import { useGroupExpenses } from '../../context/expense/useGroupExpenses';
import { computeMyBalance } from '../../service/expense';
import { MainStackParamList } from '../../navigation/mainNavigator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const ExistGroupScreen = () => {
    const { mode, scheme, brand } = useThemeContext();
    const isDark = scheme === 'dark';
    const [inviteOpen, setInviteOpen] = useState(false);
    const { groups, currentGroup } = useGroupsContext();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const { user } = useAuth();
    const { getProfile } = useProfiles();
    const { expenses } = useGroupExpenses(currentGroup?.id);
    const balance = useMemo(
        () => computeMyBalance(expenses, user?.uid ?? ''),
        [expenses, user?.uid],
    );

    console.log({ balance, expenses });

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: mode.background }]}
            edges={['top']}
        >
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={mode.background}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <GroupHeader />

                    {/* Balance summary */}
                    <GroupOverview
                        totalBalance={balance.overall / 100}
                        totalOwed={balance.youOwe / 100}
                        totalOwedToYou={balance.owedToYou / 100}
                    />
                </View>

                {/* Members */}
                <GroupMember isShowBanner onAddMember={() => setInviteOpen(true)} />

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating add expense button */}
            <TouchableOpacity
                style={[styles.addExpenseBtn, { backgroundColor: brand.main }]}
                activeOpacity={0.85}
                onPress={() => {
                    // Navigate to AddExpenseScreen with the current group ID
                    if (currentGroup) {
                        navigation.navigate('AddExpense', { groupId: currentGroup.id });
                    }
                }}
            >
                <Plus size={20} color={themes.palate.white} />
                <Text style={styles.addExpenseBtnText}>Add expense</Text>
            </TouchableOpacity>

            <InviteMemberSheet
                visible={inviteOpen}
                onClose={() => setInviteOpen(false)}
                onSendEmail={() => {}}
                onShareLink={async () => {
                    if (!currentGroup) return;
                    const inviteWithLink = await createInviteLink(
                        currentGroup,
                        currentGroup.memberIds.map((uid) => getProfile(uid)?.displayName ?? ''),
                    );

                    await Share.share({ message: inviteWithLink });
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20 },
    header: { paddingTop: 8 },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    addExpenseBtn: {
        position: 'absolute',
        right: 20,
        bottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    addExpenseBtnText: { color: themes.palate.white, fontSize: 15, fontWeight: '700' },
});
