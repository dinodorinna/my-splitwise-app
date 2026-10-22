import { Search } from 'lucide-react-native';
import { View, TextInput, StyleSheet } from 'react-native';

export function SearchBar({
    value,
    onChangeText,
}: {
    value: string;
    onChangeText: (t: string) => void;
}) {
    return (
        <View style={styles.container}>
            <Search color="#9CA3AF" size={20} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder="Search name or phone"
                placeholderTextColor="#9CA3AF"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F3F2',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 48,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        paddingVertical: 0, // removes Android's extra vertical padding
    },
});
