import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useThemeContext } from '../../../context/theme/themeContext';
import { ChevronRight, Plus, QrCode, UserPlus } from 'lucide-react-native';
import { formatBaht } from '../../../utils';
import { useProfiles } from '../../../context/profiles/profilesContext';
import { useGroupsContext } from '../../../context/group/groupsContext';
import { useAuth } from '../../../context/auth/authContext';
import { UserProfile } from '../../../service/users';
import { themes } from '../../../context/theme/themeProvider';
import { useGroupExpenses } from '../../../context/expense/useGroupExpenses';
import { computeNetByMember, createSettlement } from '../../../service/expense';
import { PromptPaySheet } from '../friend/promptPaySheet';

export type Member = {
    id: string;
    name: string;
    initial: string;
    color: string;
    balance: number; // positive = owes you, negative = you owe them
    status: 'DEFAULT' | 'REQUEST' | 'PAY';
};

type GroupMemberProps = {
    onAddMember?: () => void;
    isShowBanner?: boolean;
    pendingEmails?: string[];
    groupId?: string;
};

export const GroupMember = ({
    onAddMember = () => {},
    isShowBanner,
    groupId,
}: GroupMemberProps) => {
    const { user } = useAuth();
    const { mode, scheme } = useThemeContext();
    const { friends, getProfile } = useProfiles();

    const { groups, currentGroup, getGroup } = useGroupsContext();
    const group = groupId ? getGroup(groupId) : (currentGroup ?? groups[0]);

    const { expenses } = useGroupExpenses(group?.id);
    const netByMember = useMemo(
        () => computeNetByMember(expenses, user?.uid ?? ''),
        [expenses, user?.uid],
    );
    const [settling, setSettling] = useState<{ friend: UserProfile; net: number } | null>(null);

    const onConfirmSettle = async () => {
        if (!settling || !user || !group) return;
        const { friend, net } = settling;
        try {
            await createSettlement(group.id, {
                payerId: net > 0 ? friend.uid : user.uid,
                payeeId: net > 0 ? user.uid : friend.uid,
                amount: Math.abs(net),
            });
            setSettling(null);
        } catch {
            Alert.alert('Could not settle up', 'Please try again.');
        }
    };

    const isDark = scheme === 'dark';
    const mutedText = isDark ? '#9CA3AF' : themes.palate.gray;
    const borderColor = isDark ? '#FFFFFF14' : '#d6d6d6';

    const participants = (group?.memberIds ?? [])
        .slice()
        .sort((a, b) => (a === user?.uid ? -1 : b === user?.uid ? 1 : 0)) // me first
        .map((uid) => getProfile(uid))
        .filter((p): p is UserProfile => !!p);

    // if (friends.length === 0) {
    //   return (
    //     <View
    //       style={{
    //         borderWidth: 1,
    //         borderStyle: "dashed",
    //         borderColor: "#9CA3AF",
    //         borderRadius: 10,
    //       }}
    //     >
    //       <View
    //         style={{
    //           padding: 16,
    //           display: "flex",
    //           flexDirection: "row",
    //           gap: 12,
    //         }}
    //       >
    //         <UserPlus size={18} color={"#0F766E"} />
    //         <Text style={{ color: "#6B7280", flexShrink: 1 }}>
    //           You&apos;ll get an invite link to share right after the group is created.
    //         </Text>
    //       </View>
    //     </View>
    //   );
    // }

    return (
        <View>
            <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeader, { color: mutedText }]}>MEMBERS</Text>
                <View>
                    <Text style={[styles.peopleText, { color: mutedText }]}>
                        {participants?.length} people
                    </Text>
                </View>
            </View>
            <View style={[styles.membersCard, { borderColor: borderColor }]}>
                {participants?.map((member, index) => {
                    const isMe = member.uid === user?.uid;
                    const net = netByMember[member.uid] ?? 0; // satang, + = they owe me
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
                            key={member.uid}
                            style={[
                                styles.memberRow,
                                index !== participants.length - 1 && {
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                    borderBottomColor: borderColor,
                                },
                            ]}
                        >
                            {member?.photoURL ? (
                                <Image
                                    source={{ uri: member?.photoURL }}
                                    style={styles.avatarLarge}
                                />
                            ) : (
                                <Text style={styles.avatarLargeText}>
                                    {member?.displayName?.[0]?.toUpperCase() ?? '?'}
                                </Text>
                            )}

                            <View style={styles.memberInfo}>
                                <Text style={[styles.memberName, { color: mode.text }]}>
                                    {member.displayName}
                                </Text>
                                {!isMe && (
                                    <Text style={[styles.memberStatus, { color: statusColor }]}>
                                        {statusText}
                                    </Text>
                                )}
                            </View>
                            {!isMe && settled && (
                                <View style={[styles.settledBadge, { borderColor }]}>
                                    <Text
                                        style={[styles.memberActionBtnText, { color: mutedText }]}
                                    >
                                        Settled
                                    </Text>
                                </View>
                            )}
                            {!isMe && !settled && (
                                <TouchableOpacity
                                    style={styles.memberActionBtn}
                                    activeOpacity={0.8}
                                    onPress={() => setSettling({ friend: member, net })}
                                >
                                    <Text style={styles.memberActionBtnText}>
                                        {owesYou ? 'Request' : 'Pay · QR'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}

                {friends.length === 0 && participants.length === 0 ? (
                    <View
                        style={{
                            borderTopWidth: 1,
                            borderStyle: 'dashed',
                            borderColor: '#9CA3AF',
                        }}
                    >
                        <View
                            style={{
                                padding: 16,
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 12,
                            }}
                        >
                            <UserPlus size={18} color={'#0F766E'} />
                            <Text style={{ color: themes.palate.gray, flexShrink: 1 }}>
                                You&apos;ll get an invite link to share right after the group is
                                created.
                            </Text>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addMemberRow}
                        activeOpacity={0.7}
                        onPress={onAddMember}
                    >
                        <View style={[styles.addMemberDashedCircle, { borderColor: '#0F766E' }]}>
                            <UserPlus size={18} color={'#0F766E'} />
                        </View>
                        <View style={styles.memberInfo}>
                            <Text style={[styles.addMemberRowTitle, { color: '#0F766E' }]}>
                                Add member
                            </Text>
                            <Text style={[styles.addMemberRowSubtitle, { color: mutedText }]}>
                                From friends, contacts or invite link
                            </Text>
                        </View>
                        <ChevronRight size={18} color={mutedText} />
                    </TouchableOpacity>
                )}
            </View>

            {/* PromptPay info */}
            {isShowBanner && (
                <View
                    style={[
                        styles.infoCard,
                        {
                            borderColor: '#0F766E' + '33',
                            backgroundColor: '#0F766E' + '0D',
                        },
                    ]}
                >
                    <QrCode size={20} color={'#0F766E'} />
                    <Text style={[styles.infoCardText, { color: mutedText }]}>
                        Settlements generate an EMVCo-compliant PromptPay payload from the
                        receiver&apos;s registered ID — scannable in any Thai banking app.
                    </Text>
                </View>
            )}
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
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionHeader: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
    peopleContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
    settledBadge: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    memberActionBtn: {
        backgroundColor: '#0F766E',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    memberActionBtnText: { color: themes.palate.white, fontSize: 13, fontWeight: '600' },
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
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        borderWidth: 1,
        borderRadius: 14,
        padding: 14,
    },
    infoCardText: { flex: 1, fontSize: 12.5, lineHeight: 18 },
    addExpenseBtn: {
        position: 'absolute',
        right: 20,
        bottom: 24,
        backgroundColor: '#0F766E',
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
});
