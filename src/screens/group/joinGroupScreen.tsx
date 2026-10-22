import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    Eye,
    Heart,
    House,
    Link2Off,
    LucideIcon,
    MessageCircle,
    QrCode,
    Umbrella,
    Users,
    X,
} from 'lucide-react-native';
import { MainStackParamList } from '../../navigation/mainNavigator';
import {
    acceptInviteLink,
    getInviteLink,
    InviteLink,
    InviteLinkResult,
} from '../../service/invites';
import { setPendingInviteToken } from '../../service/pendingInvite';
import { signInWithGoogle } from '../../auth/authService';
import { getProfilesByIds, normalizePromptPayId, setMyPromptPayId } from '../../service/users';
import { useAuth } from '../../context/auth/authContext';
import { useGroupsContext } from '../../context/group/groupsContext';
import { useThemeContext } from '../../context/theme/themeContext';
import { themes } from '../../context/theme/themeProvider';

type JoinGroupScreenProps = NativeStackScreenProps<MainStackParamList, 'JoinGroup'>;

const TYPE_LABEL: Record<string, string> = {
    trip: 'TRIP GROUP',
    home: 'HOME GROUP',
    couple: 'COUPLE GROUP',
    other: 'GROUP',
};
const TYPE_ICON: Record<string, LucideIcon> = {
    trip: Umbrella,
    home: House,
    couple: Heart,
    other: Users,
};
const AVATAR_COLORS = ['#7B6BE0', '#5B9BE8', '#D9776A', '#E0A44B'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const JoinGroupScreen = ({ route, navigation }: JoinGroupScreenProps) => {
    const { token } = route.params;
    const { user } = useAuth();
    const { groups, onGroupChange } = useGroupsContext();
    const { mode, scheme } = useThemeContext();
    const isDark = scheme === 'dark';
    const muted = isDark ? '#9CA3AF' : themes.palate.gray;
    const border = isDark ? '#FFFFFF14' : '#00000010';

    const [result, setResult] = useState<InviteLinkResult | null>(null);
    const [busy, setBusy] = useState(false);
    const [promptPay, setPromptPay] = useState('');
    const promptPayId = normalizePromptPayId(promptPay);

    // Pre-fill if this user already set a PromptPay ID before
    useEffect(() => {
        if (!user) return;
        getProfilesByIds([user.uid])
            .then(([me]) => me?.promptPayId && setPromptPay(me.promptPayId))
            .catch(() => {});
    }, [user]);

    useEffect(() => {
        let cancelled = false;
        getInviteLink(token).then((r) => !cancelled && setResult(r));
        return () => {
            cancelled = true;
        };
    }, [token]);

    const close = () =>
        navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs');

    const onJoin = async (link: InviteLink) => {
        setBusy(true);
        try {
            if (!promptPayId) return;
            await setMyPromptPayId(promptPayId);
            if (!groups.some((g) => g.id === link.groupId)) await acceptInviteLink(link);
            onGroupChange(link.groupId);
            navigation.navigate('MainTabs');
        } catch (e) {
            console.warn('Failed to join group', e);
            Alert.alert('Could not join', 'This invite may have expired. Ask for a new link.');
        } finally {
            setBusy(false);
        }
    };

    const onSignIn = async () => {
        setBusy(true);
        setPendingInviteToken(token); // resumed by MainNavigator once we're signed in
        await signInWithGoogle();
        setBusy(false);
    };

    const askOnLine = () =>
        Linking.openURL('line://').catch(() => Linking.openURL('https://line.me').catch(() => {}));

    const shortUrl = `splitzy.app/j/${token}`;
    const link = result && result.status !== 'invalid' ? result.link : null;
    const inviter = link?.invitedByName || 'your friend';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: mode.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.topBar}>
                    <Pressable
                        onPress={close}
                        hitSlop={10}
                        style={[styles.closeBtn, { backgroundColor: mode.card }]}
                    >
                        <X size={18} color={muted} />
                    </Pressable>
                    <Text style={[styles.url, { color: muted }]} numberOfLines={1}>
                        {shortUrl}
                    </Text>
                    <View style={styles.closeBtn} />
                </View>

                {!result ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={themes.main.primary} />
                    </View>
                ) : result.status === 'valid' ? (
                    <>
                        <ScrollView
                            style={styles.bodyScroll}
                            contentContainerStyle={styles.body}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.inviter}>
                                <Avatar name={inviter} index={0} size={36} />
                                <Text style={[styles.inviterText, { color: muted }]}>
                                    <Text style={[styles.bold, { color: mode.text }]}>
                                        {inviter}
                                    </Text>{' '}
                                    invited you to split expenses
                                </Text>
                            </View>

                            <GroupCard
                                link={result.link}
                                textColor={mode.text}
                                muted={muted}
                                border={border}
                                cardBg={mode.card}
                            />

                            <Note Icon={Eye} muted={muted}>
                                Members will see your name and email. Expenses added before you join
                                aren&apos;t split with you.
                            </Note>
                            {user && (
                                <View style={styles.promptPayBox}>
                                    <Text style={[styles.promptPayLabel, { color: muted }]}>
                                        YOUR PROMPTPAY NUMBER
                                    </Text>
                                    <TextInput
                                        value={promptPay}
                                        onChangeText={setPromptPay}
                                        placeholder="Mobile number or national ID"
                                        placeholderTextColor={muted}
                                        keyboardType="number-pad"
                                        maxLength={17}
                                        style={[
                                            styles.promptPayInput,
                                            {
                                                color: mode.text,
                                                backgroundColor: mode.card,
                                                borderColor: border,
                                            },
                                        ]}
                                    />
                                </View>
                            )}
                            <Note Icon={QrCode} muted={muted}>
                                Friends use this to pay you by PromptPay QR.
                            </Note>
                        </ScrollView>

                        <View style={styles.footer}>
                            {user ? (
                                <>
                                    <View
                                        style={[
                                            styles.joiningAs,
                                            { backgroundColor: mode.card, borderColor: border },
                                        ]}
                                    >
                                        <Avatar
                                            name={user.displayName || user.email || '?'}
                                            index={4}
                                            size={28}
                                        />
                                        <Text
                                            style={[styles.joiningAsText, { color: muted }]}
                                            numberOfLines={1}
                                        >
                                            Joining as{' '}
                                            <Text style={[styles.bold, { color: mode.text }]}>
                                                {user.email}
                                            </Text>
                                        </Text>
                                    </View>
                                    <PrimaryButton
                                        label="Join group"
                                        busy={busy}
                                        disabled={!promptPayId}
                                        onPress={() => onJoin(result.link)}
                                    />
                                </>
                            ) : (
                                <>
                                    <Text style={[styles.signInHint, { color: muted }]}>
                                        Sign in to join — it takes a few seconds.
                                    </Text>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        disabled={busy}
                                        onPress={onSignIn}
                                        style={[
                                            styles.googleBtn,
                                            { backgroundColor: mode.card, borderColor: border },
                                        ]}
                                    >
                                        {busy ? (
                                            <ActivityIndicator color={mode.text} />
                                        ) : (
                                            <>
                                                <Text style={styles.googleG}>G</Text>
                                                <Text
                                                    style={[
                                                        styles.googleText,
                                                        { color: mode.text },
                                                    ]}
                                                >
                                                    Continue with Google to join
                                                </Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </>
                            )}
                            <TouchableOpacity onPress={close} style={styles.secondary}>
                                <Text style={[styles.secondaryText, { color: muted }]}>
                                    Not now
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={[styles.body, styles.centerBody]}>
                            <View style={[styles.errorIcon, { backgroundColor: mode.card }]}>
                                <Link2Off size={40} color="#E8643C" />
                            </View>
                            <Text style={[styles.errorTitle, { color: mode.text }]}>
                                {result.status === 'expired'
                                    ? 'This invite has expired'
                                    : 'This invite link isn’t valid'}
                            </Text>
                            <Text style={[styles.errorDesc, { color: muted }]}>
                                {result.status === 'expired'
                                    ? `Invite links last 7 days. Ask ${inviter} to send you a new one from the group.`
                                    : 'The link may have been revoked or mistyped. Ask for a new one from the group.'}
                            </Text>
                        </View>
                        <View style={styles.footer}>
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={askOnLine}
                                style={styles.lineBtn}
                            >
                                <MessageCircle size={20} color="#fff" />
                                <Text style={styles.lineBtnText}>
                                    {link ? `Ask ${inviter} on LINE` : 'Ask for a new link on LINE'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={close} style={styles.secondary}>
                                <Text style={[styles.secondaryText, { color: muted }]}>
                                    {user ? 'Go to my groups' : 'Close'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const GroupCard = ({
    link,
    textColor,
    muted,
    border,
    cardBg,
}: {
    link: InviteLink;
    textColor: string;
    muted: string;
    border: string;
    cardBg: string;
}) => {
    const Icon = TYPE_ICON[link.groupType] ?? Users;
    const created = link.groupCreatedAt?.toDate();
    const names = link.memberNames.length ? link.memberNames : [link.invitedByName || '?'];
    return (
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            <View style={styles.groupIcon}>
                <Icon size={32} color={themes.main.primary} />
            </View>
            <Text style={[styles.cardKicker, { color: muted }]}>
                {TYPE_LABEL[link.groupType] ?? 'GROUP'}
            </Text>
            <Text style={[styles.cardTitle, { color: textColor }]}>{link.groupName}</Text>

            <View style={styles.membersRow}>
                <View style={styles.avatarStack}>
                    {names.map((n, i) => (
                        <View key={i} style={i > 0 && styles.avatarOverlap}>
                            <Avatar name={n} index={i} size={32} ring={cardBg} />
                        </View>
                    ))}
                </View>
                <Text style={[styles.membersText, { color: muted }]} numberOfLines={1}>
                    {names.join(', ')} · {link.memberCount} members
                </Text>
            </View>

            <View style={[styles.statsRow, { borderTopColor: border }]}>
                <Stat
                    label="EXPENSES"
                    value={`${link.expenseCount} so far`}
                    textColor={textColor}
                    muted={muted}
                />
                <View style={[styles.statDivider, { backgroundColor: border }]} />
                <Stat
                    label="CREATED"
                    value={created ? `${created.getDate()} ${MONTHS[created.getMonth()]}` : '—'}
                    textColor={textColor}
                    muted={muted}
                />
            </View>
        </View>
    );
};

const Stat = ({
    label,
    value,
    textColor,
    muted,
}: {
    label: string;
    value: string;
    textColor: string;
    muted: string;
}) => (
    <View style={styles.stat}>
        <Text style={[styles.statLabel, { color: muted }]}>{label}</Text>
        <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
    </View>
);

const Note = ({ Icon, muted, children }: { Icon: LucideIcon; muted: string; children: string }) => (
    <View style={styles.note}>
        <Icon size={16} color={themes.main.primary} style={styles.noteIcon} />
        <Text style={[styles.noteText, { color: muted }]}>{children}</Text>
    </View>
);

const Avatar = ({
    name,
    index,
    size,
    ring,
}: {
    name: string;
    index: number;
    size: number;
    ring?: string;
}) => (
    <View
        style={[
            styles.avatar,
            {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
            },
            ring ? { borderWidth: 2, borderColor: ring } : null,
        ]}
    >
        <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
            {(name.trim()[0] ?? '?').toUpperCase()}
        </Text>
    </View>
);

const PrimaryButton = ({
    label,
    busy,
    disabled,
    onPress,
}: {
    label: string;
    busy: boolean;
    disabled?: boolean;
    onPress: () => void;
}) => (
    <TouchableOpacity
        activeOpacity={0.85}
        disabled={busy || disabled}
        onPress={onPress}
        style={[styles.primaryBtn, disabled && { opacity: 0.5 }]}
    >
        {busy ? (
            <ActivityIndicator color="#0B3B30" />
        ) : (
            <Text style={styles.primaryBtnText}>{label}</Text>
        )}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    url: { flex: 1, textAlign: 'center', fontSize: 12, fontFamily: 'Menlo' },
    bodyScroll: { flex: 1 },
    body: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, gap: 14 },
    centerBody: { alignItems: 'center', justifyContent: 'center', paddingTop: 0, gap: 12 },
    inviter: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    inviterText: { fontSize: 15, flexShrink: 1 },
    bold: { fontWeight: '700' },
    card: {
        borderRadius: 24,
        borderWidth: 1,
        paddingTop: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    groupIcon: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: themes.main.primary + '1A',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    cardKicker: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
    cardTitle: { fontSize: 26, fontWeight: '800', marginTop: 4, textAlign: 'center' },
    membersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 14,
        marginBottom: 20,
    },
    avatarStack: { flexDirection: 'row' },
    avatarOverlap: { marginLeft: -8 },
    membersText: { fontSize: 13, flexShrink: 1 },
    statsRow: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingVertical: 16,
    },
    stat: { flex: 1, alignItems: 'center', gap: 4 },
    statDivider: { width: StyleSheet.hairlineWidth },
    statLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    statValue: { fontSize: 17, fontWeight: '800' },
    promptPayBox: { gap: 6 },
    promptPayLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    promptPayInput: {
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 14,
        fontSize: 16,
    },
    note: { flexDirection: 'row', gap: 10 },
    noteIcon: { marginTop: 2 },
    noteText: { flex: 1, fontSize: 13, lineHeight: 19 },
    avatar: { alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontWeight: '700' },
    footer: { paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
    joiningAs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderRadius: 14,
        borderWidth: 1,
        padding: 12,
    },
    joiningAsText: { flex: 1, fontSize: 14 },
    primaryBtn: {
        backgroundColor: themes.main.primary,
        borderRadius: 16,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#0B3B30' },
    signInHint: { textAlign: 'center', fontSize: 13 },
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 54,
        borderRadius: 16,
        borderWidth: 1,
    },
    googleG: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
    googleText: { fontSize: 16, fontWeight: '700' },
    secondary: { alignItems: 'center', paddingVertical: 8 },
    secondaryText: { fontSize: 15, fontWeight: '600' },
    errorIcon: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    errorTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
    errorDesc: { fontSize: 14, lineHeight: 20, textAlign: 'center', maxWidth: 280 },
    lineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 54,
        borderRadius: 16,
        backgroundColor: '#5AC663',
    },
    lineBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
