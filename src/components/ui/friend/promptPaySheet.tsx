import { Modal, View, Text, Pressable, StyleSheet, Share, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { X, Share2, CircleCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { detectTargetType, generatePromptPayPayload } from '@dinodorinna/promptpay-generator';
import { themes } from '../../../context/theme/themeProvider';
import { formatBaht } from '../../../utils';
import { UserProfile } from '../../../service/users';

export type PromptPayMode = 'request' | 'pay';

type Props = {
    visible: boolean;
    mode: PromptPayMode;
    friend?: UserProfile;
    payeeName: string; // who receives the money
    payeePromptPayId?: string;
    amount: number; // baht
    onClose: () => void;
    onConfirm: () => void;
};

export function PromptPaySheet({
    visible,
    mode,
    friend,
    payeeName,
    payeePromptPayId,
    amount,
    onClose,
    onConfirm,
}: Props) {
    const insets = useSafeAreaInsets();
    const isRequest = mode === 'request';
    const friendName = friend?.displayName ?? '';

    const payload = payeePromptPayId
        ? generatePromptPayPayload(payeePromptPayId, { amount })
        : null;
    const idLabel =
        payeePromptPayId && detectTargetType(payeePromptPayId) === 'PHONE' ? 'Mobile' : 'ID';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Pressable style={styles.backdrop} onPress={onClose} />
            <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
                <View style={styles.handle} />

                <View style={styles.headerRow}>
                    <View style={styles.avatar}>
                        {friend?.photoURL ? (
                            <Image source={{ uri: friend.photoURL }} style={styles.avatarImg} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {friendName[0]?.toUpperCase() ?? '?'}
                            </Text>
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>
                            {isRequest ? `Request from ${friendName}` : `Pay ${friendName}`}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isRequest
                                ? `Send this QR so ${friendName} can pay you`
                                : 'Scan with any Thai banking app'}
                        </Text>
                    </View>
                    <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
                        <X size={20} color="#333" />
                    </Pressable>
                </View>

                <View style={styles.qrCard}>
                    <View style={styles.qrHeader}>
                        <Text style={styles.qrHeaderLeft}>PROMPTPAY</Text>
                        <Text style={styles.qrHeaderRight}>Thai QR Payment</Text>
                    </View>
                    <View style={styles.qrBody}>
                        {payload ? (
                            <>
                                <QRCode value={payload} size={220} />
                                <Text style={styles.amountLabel}>AMOUNT</Text>
                                <Text style={styles.amount}>{formatBaht(amount)}</Text>
                                <Text style={styles.payee}>
                                    {payeeName} · PromptPay {idLabel} {payeePromptPayId}
                                </Text>
                                <View style={styles.dashed} />
                                <Text style={styles.payload}>{payload}</Text>
                            </>
                        ) : (
                            <Text style={styles.missing}>
                                {payeeName} hasn&apos;t added a PromptPay ID yet, so a QR can&apos;t
                                be generated.
                            </Text>
                        )}
                    </View>
                </View>

                <Pressable
                    style={[styles.secondaryBtn, !payload && styles.disabled]}
                    disabled={!payload}
                    onPress={() => payload && Share.share({ message: payload })}
                >
                    <Share2 size={18} color="#111" />
                    <Text style={styles.secondaryText}>Share to LINE</Text>
                </Pressable>

                <Pressable style={styles.primaryBtn} onPress={onConfirm}>
                    <CircleCheck size={20} color="#111" />
                    <Text style={styles.primaryText}>
                        {isRequest ? 'Mark as received' : 'I have paid · settle up'}
                    </Text>
                </Pressable>
                <Text style={styles.footnote}>
                    Balances update for everyone in the group once confirmed.
                </Text>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 10,
        gap: 14,
    },
    handle: {
        alignSelf: 'center',
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#DDE2E0',
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: themes.main.primary,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImg: { width: 42, height: 42 },
    avatarText: { color: themes.palate.white, fontSize: 15, fontWeight: '700' },
    title: { fontSize: 18, fontWeight: '700', color: '#111' },
    subtitle: { fontSize: 13, color: '#6B7570', marginTop: 2 },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EEF1F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrCard: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E6E9E8',
        overflow: 'hidden',
    },
    qrHeader: {
        backgroundColor: themes.main.primary,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    qrHeaderLeft: { fontSize: 13, fontWeight: '800', letterSpacing: 2, color: '#0B3B30' },
    qrHeaderRight: { fontSize: 13, fontWeight: '700', color: '#0B3B30' },
    qrBody: { alignItems: 'center', padding: 20, gap: 6 },
    amountLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, color: '#6B7570' },
    amount: { fontSize: 34, fontWeight: '800', color: '#111' },
    payee: { fontSize: 13, color: '#6B7570', fontWeight: '500' },
    dashed: {
        alignSelf: 'stretch',
        borderTopWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#DDE2E0',
        marginVertical: 8,
    },
    payload: { fontSize: 10, color: '#9CA3AF', fontFamily: 'Courier' },
    missing: { fontSize: 14, color: '#6B7570', textAlign: 'center', paddingVertical: 40 },
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: '#F5F7F6',
        borderWidth: 1,
        borderColor: '#E6E9E8',
    },
    secondaryText: { fontSize: 15, fontWeight: '700', color: '#111' },
    disabled: { opacity: 0.5 },
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: themes.main.primary,
    },
    primaryText: { fontSize: 16, fontWeight: '700', color: '#111' },
    footnote: { fontSize: 12.5, color: '#6B7570', textAlign: 'center' },
});
