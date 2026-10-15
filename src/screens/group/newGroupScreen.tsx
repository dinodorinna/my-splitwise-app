import {
    Alert,
    Pressable,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../../context/theme/themeContext';
import { Plane, House, Heart, UserGroup } from 'lucide-react-native';
import { useLayoutEffect, useState } from 'react';
import { GroupNameInput } from '../../components/ui/group/groupNameInput';
import { GroupMember, Member } from '../../components/ui/group/groupMembers';
import { InviteMemberSheet } from '../../components/ui/friend/inviteMemberSheet';
import { createGroup, GroupType } from '../../service/groups';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/mainNavigator';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { createInviteLink } from '../../service/invites';
import { useProfiles } from '../../context/profiles/profilesContext';
import { themes } from '../../context/theme/themeProvider';

const GROUP_MEMBERS: Member[] = [
    {
        id: 'you',
        name: 'You',
        initial: 'P',
        color: '#10B981',
        balance: 0,
        status: 'DEFAULT',
    },
];

export const NewGroupScreen = () => {
    const { mode, scheme } = useThemeContext();

    const route = useRoute<RouteProp<MainStackParamList, 'NewGroup'>>();
    const groupName = route.params?.groupName;

    const isDark = scheme === 'dark';
    const mutedText = isDark ? '#9CA3AF' : themes.palate.gray;
    const mutedIcon = isDark ? themes.palate.white : '#1DC29E';

    const DEFAULT_TEMPLATE: {
        id: string;
        icon: React.ReactElement;
        type: GroupType;
        detail: string;
    }[] = [
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

    const [inviteOpen, setInviteOpen] = useState(false);

    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const [name, setName] = useState('');
    const [typeSelected, setTypeSelected] = useState(
        DEFAULT_TEMPLATE.find((t) => t.type === groupName) || DEFAULT_TEMPLATE[0],
    );
    const [saving, setSaving] = useState(false);
    const [pendingEmails, setPendingEmails] = useState<string[]>([]);

    const canCreate = name.trim().length > 0 && !saving;

    const handleCreate = async () => {
        if (!canCreate) return;
        setSaving(true);
        try {
            (await createGroup(name.trim(), typeSelected.type), pendingEmails);
            navigation.goBack();
        } catch (e) {
            console.warn('Create group failed', e);
            setSaving(false);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable onPress={handleCreate} disabled={!canCreate} hitSlop={10}>
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: canCreate ? '#16936F' : '#B5C2BD',
                        }}
                    >
                        Create
                    </Text>
                </Pressable>
            ),
        });
    }, [navigation, name, typeSelected.type, canCreate]);

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.background }]}
            edges={['top']}
        >
            {/* Group name */}
            <View style={styles.groupName}>
                <GroupNameInput
                    value={name}
                    onChangeText={setName}
                    setTypeSelected={setTypeSelected}
                    typeSelected={typeSelected}
                    // typeIcon={type.icon}
                />
            </View>

            {/* Members */}
            <View>
                <GroupMember onAddMember={() => setInviteOpen(true)} />
            </View>

            <InviteMemberSheet
                visible={inviteOpen}
                onClose={() => setInviteOpen(false)}
                onSendEmail={(email) =>
                    setPendingEmails((prev) => [...new Set([...prev, email.trim().toLowerCase()])])
                }
                onShareLink={() => {}}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20, gap: 16 },
    icon: {},
    typeWrapper: {
        flexDirection: 'row',
        gap: 16,
    },
    groupName: {
        gap: 12,
        display: 'flex',
        flexDirection: 'row',
    },
});
