import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../../context/theme/themeContext';
import { GroupHeader } from '../../components/ui/group/groupHeader';
import { GroupOverview } from '../../components/ui/group/groupOverview';
import { GroupMember, Member } from '../../components/ui/group/groupMembers';
import { Plus } from 'lucide-react-native';
import { NoGroups } from '../../components/ui/group/noGroups';
import { useGroupsContext } from '../../context/group/groupsContext';
import { ExistGroupScreen } from '../group/existGroupScreen';
import { themes } from '../../context/theme/themeProvider';

const BRAND = themes.main.primary;

const GROUP_MEMBERS: Member[] = [
    {
        id: 'you',
        name: 'You',
        initial: 'P',
        color: '#10B981',
        balance: 0,
        status: 'PAY',
    },
    {
        id: 'mint',
        name: 'Mint',
        initial: 'M',
        color: '#8B5CF6',
        balance: -310,
        status: 'PAY',
    },
    {
        id: 'nam',
        name: 'Nam',
        initial: 'N',
        color: '#F97316',
        balance: 465.5,
        status: 'REQUEST',
    },
    {
        id: 'beam',
        name: 'Beam',
        initial: 'B',
        color: '#3B82F6',
        balance: 1120,
        status: 'PAY',
    },
];

export const GroupDashboardScreen = () => {
    const { mode, scheme } = useThemeContext();
    const isDark = scheme === 'dark';

    const { groups } = useGroupsContext();

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: mode.background }]}
            edges={['top']}
        >
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={mode.background}
            />

            {groups.length === 0 ? <NoGroups /> : <ExistGroupScreen />}
        </SafeAreaView>
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
    addExpenseBtn: {
        position: 'absolute',
        right: 20,
        bottom: 24,
        backgroundColor: BRAND,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    addExpenseBtnText: { color: themes.palate.white, fontSize: 15, fontWeight: '700' },
});
