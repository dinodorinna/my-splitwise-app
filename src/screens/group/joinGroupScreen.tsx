import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../navigation/mainNavigator";
import { acceptInvite, getInvite, InviteProps } from "../../service/invites";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

type JoinGroupScreenProps = NativeStackScreenProps<MainStackParamList, "JoinGroup">;
export const JoinGroupScreen = ({ route, navigation }: JoinGroupScreenProps) => {
    const { groupId, inviteId } = route.params;
    const [invite, setInvite] = useState<InviteProps | null>(null);

    useEffect(() => {
        getInvite(groupId, inviteId).then(setInvite);
    }, []);

    if (!invite) return <Text>Loading invite…</Text>;
    return (
        <View>
            <Text>Join &quot;{invite.groupName}&quot;?</Text>
            <TouchableOpacity
                onPress={async () => {
                    await acceptInvite(invite);
                    navigation.goBack();
                }}
            >
                <Text>Join group</Text>
            </TouchableOpacity>
        </View>
    );
};
