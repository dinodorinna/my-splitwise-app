import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../../context/theme/themeContext';

export const ActivityScreen = () => {
    const { mode } = useThemeContext();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: mode.background }]}>
            <Text style={[styles.text, { color: mode.text }]}>Activity</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    text: { fontSize: 18, fontWeight: '600' },
});
