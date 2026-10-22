import { View, Text, StyleSheet, Image, Pressable, Alert } from 'react-native';
import { useThemeContext } from '../../../context/theme/themeContext';
import { useProfiles } from '../../../context/profiles/profilesContext';
import { themes } from '../../../context/theme/themeProvider';
import { SearchBar } from '../search';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useAuth } from '../../../context/auth/authContext';
import { useGroupsContext } from '../../../context/group/groupsContext';
import { useAllGroupsExpenses } from '../../../context/expense/useAllGroupsExpenses';
import { computeNetByMember, createSettlement } from '../../../service/expense';
import { formatBaht } from '../../../utils';
import { UserProfile } from '../../../service/users';
import { PromptPaySheet } from './promptPaySheet';

export const FriendsMembers = () => {
    const { mode, scheme } = useThemeContext();
    const { friends, getProfile } = useProfiles();
    const { user } = useAuth();
    const { groups } = useGroupsContext();
    const { expenses } = useAllGroupsExpenses(groups.map((g) => g.id));
    const netByFriend = useMemo(
        () => computeNetByMember(expenses, user?.uid ?? ''),
        [expenses, user?.uid],
    );

    const isDark = scheme === 'dark';
    const mutedText = isDark ? '#9CA3AF' : themes.palate.gray;
    const borderColor = isDark ? '#FFFFFF14' : '#d6d6d6';

    const onConfirmSettle = async () => {
        if (!settling || !user) return;
        const { friend, net } = settling;
        // Net spans every group, so record it in any group we share
        const shared = groups.find(
            (g) => g.memberIds.includes(user.uid) && g.memberIds.includes(friend.uid),
        );
        if (!shared) return;
        try {
            await createSettlement(shared.id, {
                payerId: net > 0 ? friend.uid : user.uid,
                payeeId: net > 0 ? user.uid : friend.uid,
                amount: Math.abs(net),
            });
            setSettling(null);
        } catch {
            Alert.alert('Could not settle up', 'Please try again.');
        }
    };

    const [searchText, setSearchText] = useState('');
    const [settling, setSettling] = useState<{ friend: UserProfile; net: number } | null>(null);
    const [value] = useDebounce(searchText, 1000);

    // const filteredFriends = friends.

    return (
        <View style={{ marginTop: 20 }}>
            <SearchBar value={value} onChangeText={setSearchText} />
            <View style={styles.sectionHeaderRow}></View>
            <View style={[styles.membersCard, { borderColor: borderColor }]}>
                {friends.map((friend, index) => {
                    const net = netByFriend[friend.uid] ?? 0; // satang, + = they owe me
                    const owesYou = net > 0;
                    const settled = net === 0;
                    const statusColor = settled ? mutedText : owesYou ? '#0F766E' : '#F97316';
                    const statusText = settled
                        ? 'settled up'
                        : owesYou
                          ? `owes you ${formatBaht(net / 100)}`
                          : `you owe ${formatBaht(net / 100)}`;
                    return (
                        <View
                            key={friend.uid}
                            style={[
                                styles.memberRow,
                                index !== friends.length - 1 && {
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                    borderBottomColor: borderColor,
                                },
                            ]}
                        >
                            {friend.photoURL ? (
                                <Image
                                    source={{ uri: friend.photoURL }}
                                    style={styles.avatarLarge}
                                />
                            ) : (
                                <Text style={styles.avatarLargeText}>
                                    {friend.displayName?.[0]?.toUpperCase() ?? '?'}
                                </Text>
                            )}
                            <View style={styles.memberInfo}>
                                <Text style={[styles.memberName, { color: mode.text }]}>
                                    {friend.displayName}
                                </Text>
                                <Text style={[styles.memberStatus, { color: statusColor }]}>
                                    {statusText}
                                </Text>
                            </View>

                            {settled ? (
                                <View style={[styles.settledBadge, { borderColor }]}>
                                    <Text style={[styles.actionBadgeText, { color: mutedText }]}>
                                        Settled
                                    </Text>
                                </View>
                            ) : (
                                <Pressable
                                    style={styles.actionBadge}
                                    onPress={() => setSettling({ friend, net })}
                                >
                                    <Text style={styles.actionBadgeText}>
                                        {owesYou ? 'Request' : 'Pay · QR'}
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    );
                })}
            </View>
            <PromptPaySheet
                visible={!!settling}
                mode={settling && settling.net > 0 ? 'request' : 'pay'}
                friend={settling?.friend}
                payeeName={
                    settling && settling.net > 0 ? 'You' : (settling?.friend.displayName ?? '')
                }
                payeePromptPayId={
                    settling && settling.net > 0
                        ? getProfile(user?.uid ?? '')?.promptPayId
                        : settling?.friend.promptPayId
                }
                amount={Math.abs(settling?.net ?? 0) / 100}
                onClose={() => setSettling(null)}
                onConfirm={onConfirmSettle}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // alignItems: 'center',
        marginBottom: 12,
    },
    sectionHeader: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
    peopleText: { fontSize: 14, fontWeight: '600' },
    membersCard: {
        borderRadius: 18,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 20,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
    },
    avatarLarge: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarLargeText: { color: themes.palate.white, fontSize: 15, fontWeight: '700' },
    memberInfo: { flex: 1, gap: 2 },
    memberName: { fontSize: 15, fontWeight: '600' },
    memberStatus: { fontSize: 13, fontWeight: '500' },
    actionBadge: {
        backgroundColor: themes.main.dark,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
    },
    settledBadge: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
    },
    actionBadgeText: { fontSize: 13, fontWeight: '600' },
    addMemberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
    },
    addMemberDashedCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addMemberRowTitle: { fontSize: 15, fontWeight: '600' },
    addMemberRowSubtitle: { fontSize: 12.5, marginTop: 1 },
});
