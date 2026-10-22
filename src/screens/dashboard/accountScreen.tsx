import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../../context/theme/themeContext';
import { handleSignOut } from '../../auth/authService';
import { AppUser } from '../../auth/types';
import { themes } from '../../context/theme/themeProvider';
import { useProfiles } from '../../context/profiles/profilesContext';
import { getProfilesByIds, normalizePromptPayId, setMyPromptPayId } from '../../service/users';

type AccountScreenProps = {
    user: AppUser | null;
};

export const AccountScreen = ({ user }: AccountScreenProps) => {
    const { mode } = useThemeContext();
    const { refresh } = useProfiles();
    const [promptPay, setPromptPay] = useState('');
    const [saved, setSaved] = useState('');
    const [saving, setSaving] = useState(false);
    const promptPayId = normalizePromptPayId(promptPay);
    const dirty = !!promptPayId && promptPayId !== saved;

    useEffect(() => {
        if (!user) return;
        getProfilesByIds([user.uid])
            .then(([me]) => {
                setPromptPay(me?.promptPayId ?? '');
                setSaved(me?.promptPayId ?? '');
            })
            .catch(() => {});
    }, [user]);

    const onSave = async () => {
        if (!promptPayId || !user) return;
        setSaving(true);
        try {
            await setMyPromptPayId(promptPayId);
            setSaved(promptPayId);
            setPromptPay(promptPayId);
            refresh([user.uid]);
        } catch (e) {
            console.warn('Failed to save PromptPay ID', e);
            Alert.alert('Could not save', 'Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: mode.background }]}>
            <KeyboardAvoidingView
                style={styles.inner}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Text style={[styles.name, { color: mode.text }]}>
                    {user?.displayName ?? 'Account'}
                </Text>
                {user?.email ? (
                    <Text style={[styles.email, { color: mode.text + '99' }]}>{user.email}</Text>
                ) : null}

                <View style={styles.promptPayBox}>
                    <Text style={[styles.promptPayLabel, { color: mode.text + '99' }]}>
                        YOUR PROMPTPAY NUMBER
                    </Text>
                    <TextInput
                        value={promptPay}
                        onChangeText={setPromptPay}
                        placeholder="Mobile number or national ID"
                        placeholderTextColor={mode.text + '66'}
                        keyboardType="number-pad"
                        maxLength={17}
                        style={[
                            styles.promptPayInput,
                            { color: mode.text, backgroundColor: mode.card },
                        ]}
                    />
                    {promptPay.length > 0 && !promptPayId && (
                        <Text style={styles.promptPayError}>
                            Enter a 10-digit mobile number or 13-digit national ID
                        </Text>
                    )}
                    <TouchableOpacity
                        style={[styles.saveBtn, (!dirty || saving) && { opacity: 0.5 }]}
                        disabled={!dirty || saving}
                        activeOpacity={0.8}
                        onPress={onSave}
                    >
                        <Text style={styles.saveBtnText}>
                            {saved && !dirty ? 'Saved' : 'Save PromptPay number'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.signOutBtn}
                    activeOpacity={0.8}
                    onPress={() => handleSignOut().catch(console.warn)}
                >
                    <Text style={styles.signOutBtnText}>Sign out</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    promptPayBox: { alignSelf: 'stretch', paddingHorizontal: 24, gap: 8 },
    promptPayLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    promptPayInput: { height: 50, borderRadius: 14, paddingHorizontal: 14, fontSize: 16 },
    promptPayError: { color: '#EF4444', fontSize: 12.5 },
    saveBtn: {
        backgroundColor: themes.main.primary,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: { color: '#0B3B30', fontSize: 15, fontWeight: '700' },
    name: { fontSize: 20, fontWeight: '700' },
    email: { fontSize: 14, marginBottom: 24 },
    signOutBtn: {
        marginTop: 24,
        backgroundColor: '#EF4444',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    signOutBtnText: { color: themes.palate.white, fontSize: 15, fontWeight: '600' },
});
