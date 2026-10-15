import { useNavigation } from '@react-navigation/native';
import { useGroupsContext } from '../../context/group/groupsContext';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Check, Plus } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/mainNavigator';
import { themes } from '../../context/theme/themeProvider';

export const ExistGroupDrawerScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const { groups, currentGroupId, onGroupChange } = useGroupsContext();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Yours Groups</Text>
            {groups.map((g) => (
                <Pressable
                    key={g.id}
                    onPress={() => {
                        onGroupChange(g.id ?? 'xxx');
                        navigation.goBack();
                    }}
                    style={[
                        styles.groupItem,
                        {
                            borderColor:
                                g.id === currentGroupId ? themes.main.primary : styles.groupItem?.borderColor,
                        },
                    ]}
                >
                    <Text style={styles.groupItemTitle}>{g.name}</Text>
                    {/* {g.id === currentGroupId && <Check />} */}

                    <Text style={styles.groupItemDetail}>{g.memberIds?.length} members</Text>
                </Pressable>
            ))}
            <Pressable
                onPress={() => navigation.navigate('NewGroup')}
                style={styles.createNewGroupBtn}
            >
                <Plus size={20} />
                <Text style={styles.createNewGroupBtnText}>Create New group</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: themes.palate.lightGray,
        gap: 8,
    },
    groupItem: {
        backgroundColor: '#F1F4F3',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E7EBE9',
    },
    groupItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    groupItemDetail: {
        color: themes.palate.gray,
    },
    createNewGroupBtn: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 4,
        backgroundColor: themes.main.primary,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E7EBE9',
    },
    createNewGroupBtnText: {
        fontWeight: 'bold',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});
