import {
    StatusBar,
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { useThemeContext } from '../../../context/theme/themeContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, House, Icon, Plane, Plus, UserGroup, UserRoundPlus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../navigation/mainNavigator';

export const NoGroups = () => {
    const { mode, scheme, themes } = useThemeContext();

    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

    const isDark = scheme === 'dark';
    const mutedText = isDark ? '#9CA3AF' : themes.palate.gray;
    const mutedIcon = isDark ? themes.palate.white : '#1DC29E';

    const insets = useSafeAreaInsets();

    const DEFAULT_TEMPLATE = [
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
        <SafeAreaView
            style={[styles.container, { backgroundColor: mode.background }]}
            edges={['top']}
        >
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={mode.background}
            />
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.groupLabel, { color: mutedText }]}>Groups</Text>
            </View>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.iconView}>
                    <View style={{}}>
                        <UserRoundPlus size={68} color="#1F9D7A" />
                    </View>
                </View>
                <View style={styles.title}>
                    <Text style={[styles.groupLabel, { color: mutedText }]}>No groups yet</Text>
                </View>
                <View style={styles.desc}>
                    <Text style={styles.descText}>
                        Create a group for a trip, a condo or a dinner. Add friends, log expenses,
                        and settle with a PromptPay QR.
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.addCreateGroupBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('NewGroup')}
                >
                    <View
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Plus size={20} color={themes.palate.black} />
                        <Text style={{ textAlign: 'center' }}>Create a group</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.templateHeader}>
                    <Text>Start from a template</Text>
                </View>

                <View style={styles.grid}>
                    {DEFAULT_TEMPLATE.map((item) => (
                        <Pressable
                            key={item.id}
                            onPress={() =>
                                navigation.navigate('NewGroup', { groupName: item.type })
                            }
                            style={[styles.card]}
                        >
                            {item.icon}
                            <Text style={styles.templateTitle}>{item.type}</Text>
                            <Text style={styles.templateDetail}>{item.detail}</Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20 },
    header: { paddingTop: 8, paddingHorizontal: 20 },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    groupLabel: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    iconView: {
        padding: 48,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    desc: {
        paddingInline: 48,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    descText: {
        textAlign: 'center',
    },
    addCreateGroupBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: '#1DC29E',
        borderRadius: 20,
        paddingVertical: 18,
        margin: 16,
        shadowColor: '#1DC29E',
        shadowOpacity: 0.35,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    templateButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    templateHeader: {
        paddingBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 12,
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        padding: 16,
        gap: 8,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardActive: {
        borderColor: '#16936F',
        borderWidth: 2,
    },
    templateTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
    templateDetail: { fontSize: 14, color: '#6B7570' },
});
