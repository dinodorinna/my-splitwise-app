import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BedDouble, Bus, Martini, Pencil, Receipt, Utensils } from 'lucide-react-native';
import { useLayoutEffect, useMemo, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from 'react-native';
import { MainStackParamList } from '../../navigation/mainNavigator';
import { useAuth } from '../../context/auth/authContext';
import { useGroupsContext } from '../../context/group/groupsContext';
import { useProfiles } from '../../context/profiles/profilesContext';
import { useThemeContext } from '../../context/theme/themeContext';
import {
    createExpense,
    ExpenseCategory,
    ExpenseInput,
    splitEqually,
    SplitMode,
} from '../../service/expense';

const AVATAR_COLORS = ['#10B981', '#8B5CF6', '#F97316', '#3B82F6', '#EC4899', '#EAB308'];

const CATEGORIES: { key: ExpenseCategory; label: string; Icon: typeof Utensils }[] = [
    { key: 'food', label: 'Food', Icon: Utensils },
    { key: 'travel', label: 'Travel', Icon: Bus },
    { key: 'stay', label: 'Stay', Icon: BedDouble },
    { key: 'bills', label: 'Bills', Icon: Receipt },
    { key: 'fun', label: 'Fun', Icon: Martini },
];

// A valid amount: digits, optionally one dot and up to 2 decimals (satang)
const isValidAmount = (text: string) => /^\d*(\.\d{0,2})?$/.test(text);

// Stops invalid keys before they are typed (web / hardware keyboards). Phones use the
// decimal-pad keyboard, which has no letters; isValidAmount in onChangeText is the fallback.
const amountKeyGuard = (current: string): TextInputProps => ({
    keyboardType: 'decimal-pad',
    inputMode: 'decimal',
    onKeyPress: (e) => {
        const { key, ctrlKey, metaKey } = e.nativeEvent as typeof e.nativeEvent & {
            ctrlKey?: boolean;
            metaKey?: boolean;
        };
        if (key.length > 1 || ctrlKey || metaKey) return; // Backspace, arrows, Enter, copy/paste...
        const ok = /\d/.test(key) || (key === '.' && !current.includes('.'));
        if (!ok) (e as unknown as { preventDefault?: () => void }).preventDefault?.();
    },
});

const toSatang = (text: string) => {
    const n = parseFloat(text.replace(/,/g, ''));
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
};
const formatBaht = (satang: number) =>
    `฿${(satang / 100).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

type Person = { uid: string; name: string; initial: string; color: string };

export const AddExpenseScreen = () => {
    const { user } = useAuth();
    const route = useRoute<RouteProp<MainStackParamList, 'AddExpense'>>();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const { groupId } = route.params;
    const { mode, scheme, themes, brand } = useThemeContext();
    const { getGroup } = useGroupsContext();
    const { getProfile } = useProfiles();

    const isDark = scheme === 'dark';
    const mutedText = isDark ? '#9CA3AF' : themes.palate.gray;
    const surface = isDark ? themes.palate.darkGray : themes.palate.white;
    const border = isDark ? '#2C2C2E' : '#E5E7EB';
    const chipBg = brand.main;

    // Group members, with "You" first
    const members = useMemo<Person[]>(() => {
        const ids = getGroup(groupId)?.memberIds ?? (user?.uid ? [user.uid] : []);
        const ordered = [...ids].sort((a, b) => (a === user?.uid ? -1 : b === user?.uid ? 1 : 0));
        return ordered.map((uid, i) => {
            const name = uid === user?.uid ? 'You' : getProfile(uid)?.displayName || 'Member';
            return {
                uid,
                name,
                initial: (name[0] ?? '?').toUpperCase(),
                color: AVATAR_COLORS[i % AVATAR_COLORS.length],
            };
        });
    }, [getGroup, groupId, getProfile, user?.uid]);

    const [amountText, setAmountText] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('food');
    const [paidBy, setPaidBy] = useState(user?.uid ?? '');
    const [splitMode, setSplitMode] = useState<SplitMode>('equal');
    const [excluded, setExcluded] = useState<Set<string>>(new Set());
    const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const amount = toSatang(amountText);
    const participants = members.map((p) => p.uid).filter((uid) => !excluded.has(uid));

    // Final shares in satang (what gets saved)
    const splits = useMemo<Record<string, number>>(() => {
        if (splitMode === 'equal') return splitEqually(amount, participants);
        return Object.fromEntries(
            participants.map((uid) => [uid, toSatang(customAmounts[uid] ?? '')]),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [splitMode, amount, excluded, customAmounts, members]);

    const splitTotal = Object.values(splits).reduce((a, b) => a + b, 0);
    const remaining = amount - splitTotal;
    const canSave =
        !saving &&
        amount > 0 &&
        description.trim().length > 0 &&
        participants.length > 0 &&
        remaining === 0;

    const switchMode = (next: SplitMode) => {
        if (next === 'custom' && splitMode === 'equal') {
            // pre-fill custom fields with the current equal shares
            setCustomAmounts(
                Object.fromEntries(
                    Object.entries(splits).map(([uid, s]) => [uid, s ? (s / 100).toFixed(2) : '']),
                ),
            );
        }
        setSplitMode(next);
    };

    const toggleParticipant = (uid: string) => {
        if (splitMode !== 'equal') return;
        setExcluded((prev) => {
            const next = new Set(prev);
            if (next.has(uid)) next.delete(uid);
            else next.add(uid);
            return next;
        });
    };

    const handleSave = async () => {
        if (!canSave) return;
        const expense: ExpenseInput = {
            description: description.trim(),
            category,
            amount,
            paidBy,
            splitMode,
            splits,
        };
        setSaving(true);
        try {
            await createExpense(groupId, expense);
            navigation.goBack();
        } catch (e) {
            console.warn('Create expense failed', e);
            Alert.alert('Could not save expense', 'Please try again.');
            setSaving(false);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable onPress={handleSave} disabled={!canSave} hitSlop={10}>
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: canSave ? '#16936F' : '#B5C2BD',
                        }}
                    >
                        Save
                    </Text>
                </Pressable>
            ),
        });
    });

    const Avatar = ({ p, size = 28 }: { p: Person; size?: number }) => (
        <View
            style={[
                styles.avatar,
                { width: size, height: size, borderRadius: size / 2, backgroundColor: p.color },
            ]}
        >
            <Text style={styles.avatarText}>{p.initial}</Text>
        </View>
    );

    return (
        <ScrollView
            style={{ backgroundColor: mode.background }}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="automatic"
        >
            {/* Amount */}
            <View style={styles.amountBlock}>
                <Text style={[styles.label, { color: mutedText }]}>AMOUNT (THB)</Text>
                <View style={[styles.amountRow, { borderBottomColor: brand.main }]}>
                    <Text style={[styles.currency, { color: mutedText }]}>฿</Text>
                    <TextInput
                        value={amountText}
                        onChangeText={(t) => isValidAmount(t) && setAmountText(t)}
                        placeholder="0.00"
                        placeholderTextColor={mutedText}
                        {...amountKeyGuard(amountText)}
                        style={[styles.amountInput, { color: mode.text }]}
                    />
                </View>
            </View>

            {/* Description + category */}
            <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
                <Text style={[styles.label, { color: mutedText }]}>DESCRIPTION</Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="e.g. Dinner at Huen Phen"
                    placeholderTextColor={mutedText}
                    style={[styles.descInput, { color: mode.text, borderBottomColor: border }]}
                />
                <Text style={[styles.label, { color: mutedText, marginTop: 16 }]}>CATEGORY</Text>
                <View style={styles.chips}>
                    {CATEGORIES.map(({ key, label, Icon }) => {
                        const active = category === key;
                        return (
                            <Pressable
                                key={key}
                                onPress={() => setCategory(key)}
                                style={[
                                    styles.chip,
                                    active
                                        ? { backgroundColor: chipBg, borderColor: chipBg }
                                        : { backgroundColor: surface, borderColor: border },
                                ]}
                            >
                                <Icon size={18} color={active ? '#fff' : mode.text} />
                                <Text
                                    style={[
                                        styles.chipText,
                                        { color: active ? '#fff' : mode.text },
                                    ]}
                                >
                                    {label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* Paid by */}
            <Text style={[styles.sectionLabel, { color: mutedText }]}>PAID BY</Text>
            <View style={styles.chips}>
                {members.map((p) => {
                    const active = paidBy === p.uid;
                    return (
                        <Pressable
                            key={p.uid}
                            onPress={() => setPaidBy(p.uid)}
                            style={[
                                styles.chip,
                                active
                                    ? { backgroundColor: chipBg, borderColor: chipBg }
                                    : { backgroundColor: surface, borderColor: border },
                            ]}
                        >
                            <Avatar p={p} />
                            <Text style={[styles.chipText, { color: active ? '#fff' : mode.text }]}>
                                {p.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Split */}
            <Text style={[styles.sectionLabel, { color: mutedText }]}>SPLIT</Text>
            <View style={[styles.segment, { backgroundColor: isDark ? '#1C1C1E' : '#EEF1F0' }]}>
                {(['equal', 'custom'] as SplitMode[]).map((m) => {
                    const active = splitMode === m;
                    return (
                        <Pressable
                            key={m}
                            onPress={() => switchMode(m)}
                            style={[styles.segmentItem, active && { backgroundColor: surface }]}
                        >
                            <Text
                                style={[
                                    styles.segmentText,
                                    { color: active ? mode.text : mutedText },
                                ]}
                            >
                                {m === 'equal' ? 'Split equally' : 'Custom amounts'}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <View
                style={[
                    styles.card,
                    styles.splitCard,
                    { backgroundColor: surface, borderColor: border },
                ]}
            >
                {members.map((p, i) => {
                    const included = !excluded.has(p.uid);
                    return (
                        <Pressable
                            key={p.uid}
                            onPress={() => toggleParticipant(p.uid)}
                            style={[
                                styles.row,
                                i > 0 && {
                                    borderTopWidth: StyleSheet.hairlineWidth,
                                    borderTopColor: border,
                                },
                                { opacity: included ? 1 : 0.4 },
                            ]}
                        >
                            <Avatar p={p} size={40} />
                            <Text style={[styles.rowName, { color: mode.text }]}>{p.name}</Text>
                            {splitMode === 'equal' ? (
                                <Text style={[styles.rowAmount, { color: mode.text }]}>
                                    {formatBaht(splits[p.uid] ?? 0)}
                                </Text>
                            ) : (
                                <View style={styles.customWrap}>
                                    <Text style={[styles.rowAmount, { color: mutedText }]}>฿</Text>
                                    <TextInput
                                        value={customAmounts[p.uid] ?? ''}
                                        onChangeText={(t) =>
                                            isValidAmount(t) &&
                                            setCustomAmounts((prev) => ({ ...prev, [p.uid]: t }))
                                        }
                                        placeholder="0.00"
                                        placeholderTextColor={mutedText}
                                        {...amountKeyGuard(customAmounts[p.uid] ?? '')}
                                        style={[styles.customInput, { color: mode.text }]}
                                    />
                                    <Pencil size={14} color={mutedText} />
                                </View>
                            )}
                        </Pressable>
                    );
                })}
                <View style={[styles.footer, { backgroundColor: isDark ? '#111' : '#F7F8F7' }]}>
                    {splitMode === 'equal' ? (
                        <Text style={[styles.footerText, { color: mutedText }]}>
                            Equal · {participants.length}{' '}
                            {participants.length === 1 ? 'person' : 'people'}
                        </Text>
                    ) : (
                        <Text
                            style={[
                                styles.footerText,
                                { color: remaining === 0 ? mutedText : '#DC2626' },
                            ]}
                        >
                            {remaining === 0
                                ? 'All assigned'
                                : remaining > 0
                                  ? `${formatBaht(remaining)} left`
                                  : `${formatBaht(-remaining)} over`}
                        </Text>
                    )}
                    <Text style={[styles.rowAmount, { color: mode.text }]}>
                        {formatBaht(splitTotal)}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    content: { padding: 20, paddingBottom: 48, gap: 12 },
    label: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
    sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginTop: 8 },
    amountBlock: { alignItems: 'center', gap: 8, marginBottom: 8 },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderBottomWidth: 2,
        paddingHorizontal: 12,
        minWidth: 220,
    },
    currency: { fontSize: 32, fontWeight: '700' },
    amountInput: { fontSize: 48, fontWeight: '800', minWidth: 120, textAlign: 'center' },
    card: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
    descInput: { fontSize: 17, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
    },
    chipText: { fontSize: 16, fontWeight: '600' },
    avatar: { alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontWeight: '700' },
    segment: { flexDirection: 'row', borderRadius: 14, padding: 4 },
    segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 11 },
    segmentText: { fontSize: 15, fontWeight: '700' },
    splitCard: { padding: 0, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
    rowName: { flex: 1, fontSize: 18, fontWeight: '500' },
    rowAmount: { fontSize: 18, fontWeight: '700' },
    customWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    customInput: { fontSize: 18, fontWeight: '700', minWidth: 70, textAlign: 'right' },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    footerText: { fontSize: 15, fontWeight: '600' },
});
