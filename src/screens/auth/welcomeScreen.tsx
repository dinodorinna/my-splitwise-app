import React from "react";
import { OnboardingScreen } from "../../components/auth/onboardingScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Moon, QrCode, Sun, Users, Wallet } from "lucide-react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/authNavigator";
import { signInWithGoogle } from "../../auth/authService";
import { useThemeContext } from "../../context/theme/themeContext";
import { themes } from "../../context/theme/themeProvider";

type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, "Welcome">;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
    const { scheme, theme, setOverride } = useThemeContext();
    const isDark = scheme === "dark";

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={theme.background} // Android only; iOS ignores this prop
            />
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.brandName, { color: theme.text }]}>
                        Split<Text style={styles.brandHighlight}>zy</Text>
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.themeToggleBtn,
                        { backgroundColor: theme.card, borderColor: theme.text + "22" },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setOverride(isDark ? "light" : "dark")}
                >
                    {isDark ? (
                        <Sun size={18} color={theme.text} />
                    ) : (
                        <Moon size={18} color={theme.text} />
                    )}
                </TouchableOpacity>
            </View>
            <OnboardingScreen
                slides={ONBOARDING_DATA}
                onFinish={() => signInWithGoogle().catch(console.warn)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        height: "100%",
    },
    header: {
        paddingHorizontal: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 8,
        paddingBottom: 8,
    },
    brandName: {
        fontSize: 20,
        fontWeight: "700",
    },
    brandHighlight: {
        color: themes.main.primary,
    },
    themeToggleBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    iconOuter: {
        position: "relative",
        marginBottom: 36,
        alignItems: "center",
    },
    qrCard: {
        width: 140,
        height: 140,
        borderRadius: 28,
        backgroundColor: "rgba(28, 194, 159, 0.08)",
        borderWidth: 1.5,
        borderColor: "rgba(28, 194, 159, 0.25)",
        alignItems: "center",
        justifyContent: "center",
    },
});

const ONBOARDING_DATA = [
    {
        id: "1",
        title: "Split Expenses Effortlessly",
        desc: "Keep track of shared trip costs, dining, and utility bills with friends without awkward calculations.",
        icon: <Users size={88} color={themes.main.primary} />,
    },
    {
        id: "2",
        title: "Instant Thai PromptPay Settlement",
        desc: "Settle up directly using auto-generated EMVCo PromptPay QR codes. Scan, pay, and sync balances instantly.",
        icon: <QrCode size={88} color={themes.main.primary} />,
    },
    {
        id: "3",
        title: "Clear Net Balances",
        desc: "Smart algorithm minimizes transfers so everyone knows exactly who owes what in Thai Baht (฿).",
        icon: <Wallet size={88} color={themes.main.primary} />,
    },
];
