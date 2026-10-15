import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeContext } from "../../context/theme/themeContext";
import { handleSignOut } from "../../auth/authService";
import { AppUser } from "../../auth/types";
import { themes } from "../../context/theme/themeProvider";

type AccountScreenProps = {
    user: AppUser | null;
};

export const AccountScreen = ({ user }: AccountScreenProps) => {
    const { theme } = useThemeContext();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.name, { color: theme.text }]}>
                {user?.displayName ?? "Account"}
            </Text>
            {user?.email ? (
                <Text style={[styles.email, { color: theme.text + "99" }]}>{user.email}</Text>
            ) : null}

            <TouchableOpacity
                style={styles.signOutBtn}
                activeOpacity={0.8}
                onPress={() => handleSignOut().catch(console.warn)}
            >
                <Text style={styles.signOutBtnText}>Sign out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    name: { fontSize: 20, fontWeight: "700" },
    email: { fontSize: 14, marginBottom: 24 },
    signOutBtn: {
        marginTop: 24,
        backgroundColor: "#EF4444",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    signOutBtnText: { color: themes.palate.white, fontSize: 15, fontWeight: "600" },
});
