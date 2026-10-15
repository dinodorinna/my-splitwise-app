import { ChevronDown, UserPlus } from 'lucide-react-native';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { UserProfile } from '../../../service/users';
import { useThemeContext } from '../../../context/theme/themeContext';
import { useGroupsContext } from '../../../context/group/groupsContext';
import { useProfiles } from '../../../context/profiles/profilesContext';
import { useAuth } from '../../../context/auth/authContext';
import { MainStackParamList } from '../../../navigation/mainNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { themes } from '../../../context/theme/themeProvider';

export const GroupHeader = () => {
    const { user } = useAuth();
    const { mode, scheme, themes } = useThemeContext();
    const { getProfile } = useProfiles();
    const { groups } = useGroupsContext();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const isDark = scheme === 'dark';
    const mutedText = isDark ? '#9CA3AF' : themes.palate.gray;
    const borderColor = isDark ? '#FFFFFF14' : '#00000010';

    const paticipants = (groups[0]?.memberIds ?? [])
        .slice()
        .sort((a, b) => (a === user?.uid ? -1 : b === user?.uid ? 1 : 0)) // me first
        .map((uid) => getProfile(uid))
        .filter((p): p is UserProfile => !!p);

    return (
        <View style={styles.headerTop}>
            <View>
                <Text style={[styles.groupLabel, { color: mutedText }]}>GROUP</Text>
                <TouchableOpacity style={styles.groupTitleRow} activeOpacity={0.7}>
                    <Text style={[styles.groupTitle, { color: mode.text }]}>
                        {groups[0]?.name || 'Group Name'}
                    </Text>
                    <ChevronDown
                        size={20}
                        color={mutedText}
                        onPress={() => navigation.navigate('ExistGroupDrawer')}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.headerRight}>
                <View style={styles.avatarStack}>
                    {paticipants.map((member, index) => (
                        <View
                            key={member?.uid}
                            style={[
                                styles.avatarChip,
                                {
                                    borderColor: mode.background,
                                    backgroundColor: '#6366F1',
                                    marginLeft: index === 0 ? 0 : -10,
                                },
                            ]}
                        >
                            {member?.photoURL ? (
                                <Image
                                    source={{ uri: member?.photoURL }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Text style={styles.avatarChipText}>
                                    {member?.displayName?.[0]?.toUpperCase() ?? '?'}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>
                <TouchableOpacity
                    style={[styles.addMemberIconBtn, { borderColor, backgroundColor: mode.card }]}
                    activeOpacity={0.7}
                >
                    <UserPlus size={16} color={mode.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20 },
    header: { paddingTop: 8 },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    groupLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    groupTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    groupTitle: { fontSize: 24, fontWeight: '700' },
    headerRight: {
        alignItems: 'flex-end',
        gap: 10,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    avatarStack: { flexDirection: 'row' },
    avatarChip: {
        width: 30,
        height: 30,
        borderRadius: 16,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: { width: 30, height: 30, borderRadius: 16 },
    avatarChipText: { color: themes.palate.white, fontSize: 12, fontWeight: '700' },
    addMemberIconBtn: {
        width: 30,
        height: 30,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
