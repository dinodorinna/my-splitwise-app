import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../../context/theme/themeContext';
import { themes } from '../../context/theme/themeProvider';
import { FriendsMembers } from '../../components/ui/friend/friendsMembers';
import { InviteMemberSheet } from '../../components/ui/friend/inviteMemberSheet';
import { useGroupsContext } from '../../context/group/groupsContext';
import { createInviteLink } from '../../service/invites';
import { useProfiles } from '../../context/profiles/profilesContext';
import { UserPlus } from 'lucide-react-native';

export const FriendsScreen = () => {
    const { mode } = useThemeContext();
    const [inviteOpen, setInviteOpen] = useState(false);
    const { currentGroup } = useGroupsContext();
    const { getProfile } = useProfiles();

    const onAddFriend = useCallback(() => {
        setInviteOpen(true);
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: mode.background }]}>
            <View style={styles.titleRow}>
                <Text style={[styles.text, { color: mode.text }]}>Friends</Text>
                <Pressable
                    onPress={onAddFriend}
                    hitSlop={10}
                    style={{
                        backgroundColor: themes.main.dark,
                        padding: 8,
                        borderRadius: 16,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                    }}
                >
                    <UserPlus size={14} />
                    <Text style={[styles.addText]}>Add</Text>
                </Pressable>
            </View>
            <FriendsMembers />
            <InviteMemberSheet
                visible={inviteOpen}
                onClose={() => setInviteOpen(false)}
                onSendEmail={() => {}}
                onShareLink={async () => {
                    if (!currentGroup) return;
                    const inviteWithLink = await createInviteLink(
                        currentGroup,
                        currentGroup.memberIds.map((uid) => getProfile(uid)?.displayName ?? ''),
                    );

                    await Share.share({ message: inviteWithLink });
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    text: { fontSize: 26, fontWeight: '600' },
    addText: { fontSize: 12, fontWeight: '600' },
});
