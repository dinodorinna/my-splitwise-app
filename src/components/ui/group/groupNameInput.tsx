import { Heart, House, LucideIcon, Plane, UserGroup } from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeContext } from '../../../context/theme/themeContext';
import { GroupType, TypeTemplate } from '../../../service/groups';
import { startWithUpperCase } from '../../../utils';
import { themes } from '../../../context/theme/themeProvider';

type GroupNameInputProps = {
    value: string;
    onChangeText?: (text: string) => void;
    typeSelected: TypeTemplate;
    setTypeSelected: (value: React.SetStateAction<TypeTemplate>) => void;
};
export function GroupNameInput({
    value,
    onChangeText,
    typeSelected,
    setTypeSelected,
}: GroupNameInputProps) {
    const { themes, scheme } = useThemeContext();
    const isDark = scheme === 'dark';
    const mutedIcon = isDark ? themes.palate.white : themes.main.dark;

    const [focused, setFocused] = useState(false);

    const DEFAULT_TEMPLATE: TypeTemplate[] = [
        {
            id: '1',
            icon: <Plane size={24} color={mutedIcon} />,
            type: 'trip',
            detail: 'Hotels, Transport, food',
        },
        {
            id: '2',
            icon: <House size={24} color={mutedIcon} />,
            type: 'home',
            detail: 'Rent, Water, Wifi',
        },
        {
            id: '3',
            icon: <Heart size={24} color={mutedIcon} />,
            type: 'couple',
            detail: 'Shared day to day',
        },
        {
            id: '4',
            icon: <UserGroup size={24} color={mutedIcon} />,
            type: 'other',
            detail: 'Anything shared',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.groupNameContainer}>
                <View style={styles.iconBox}>{typeSelected.icon}</View>

                <View style={styles.field}>
                    <Text style={styles.label}>GROUP NAME</Text>
                    <TextInput
                        value={value}
                        onChangeText={onChangeText}
                        placeholder="e.g. Chiang Mai Trip"
                        placeholderTextColor="#8A938F"
                        style={[styles.input, focused && styles.inputFocused]}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        autoFocus
                        returnKeyType="done"
                        maxLength={40}
                    />
                </View>
            </View>

            <View style={styles.typeContainer}>
                <Text style={styles.typeTitle}>Type</Text>
                <View style={styles.typeBtnContainer}>
                    {DEFAULT_TEMPLATE.map((item) => (
                        <Pressable
                            key={item.id}
                            onPress={() => {
                                setTypeSelected(item);
                            }}
                            style={[
                                styles.typeIcon,
                                typeSelected.type === item.type && styles.typeIconActive,
                            ]}
                        >
                            {item.icon}
                            <Text>{startWithUpperCase(item.type)}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
    },
    groupNameContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#EEF1F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    field: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.2,
        color: '#6B7570',
        marginBottom: 4,
    },
    input: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        paddingVertical: 6,
        paddingHorizontal: 0,
        borderBottomWidth: 2,
        borderBottomColor: '#D5DCD9',
    },
    inputFocused: {
        borderBottomColor: '#1DC29E',
    },
    typeTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.2,
        color: '#6B7570',
        marginBottom: 4,
    },
    typeContainer: {
        flexDirection: 'column',
        gap: 16,
        padding: 16,
        borderRadius: 16,
    },
    typeBtnContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    typeIcon: {
        flexDirection: 'row',
        gap: 8,
        padding: 16,
        borderStyle: 'solid',
        borderColor: '#9CA3AF',
        borderWidth: 1,
        borderRadius: 32,
    },
    typeIconActive: {
        borderColor: '#1DC29E',
        borderWidth: 3,
        // backgroundColor: "#1DC29E",
    },
});
