import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GroupMember, Member } from "../../components/ui/group/groupMembers";
import { GroupOverview } from "../../components/ui/group/groupOverview";
import { GroupHeader } from "../../components/ui/group/groupHeader";
import { Plus } from "lucide-react-native";
import { useThemeContext } from "../../context/theme/themeContext";
import { useProfiles } from "../../context/profiles/profilesContext";

const GROUP_MEMBERS: Member[] = [
  {
    id: "you",
    name: "You",
    initial: "P",
    color: "#10B981",
    balance: 0,
    status: "PAY",
  },
  {
    id: "mint",
    name: "Mint",
    initial: "M",
    color: "#8B5CF6",
    balance: -310,
    status: "PAY",
  },
  {
    id: "nam",
    name: "Nam",
    initial: "N",
    color: "#F97316",
    balance: 465.5,
    status: "REQUEST",
  },
  {
    id: "beam",
    name: "Beam",
    initial: "B",
    color: "#3B82F6",
    balance: 1120,
    status: "PAY",
  },
];

const TOTAL_BALANCE = 1275.5;
const TOTAL_OWE = 310.0;
const TOTAL_OWED_TO_YOU = 1585.5;

export const ExistGroupScreen = () => {
  const { theme, scheme, brand } = useThemeContext();
  const isDark = scheme === "dark";
  const { profiles, friends } = useProfiles();

  console.log({ profiles, friends });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <GroupHeader groupName="name" paticipants={GROUP_MEMBERS} />

          {/* Balance summary */}
          <GroupOverview
            totalBalance={TOTAL_BALANCE}
            totalOwed={TOTAL_OWE}
            totalOwedToYou={TOTAL_OWED_TO_YOU}
          />
        </View>

        {/* Members */}
        <GroupMember isShowBanner otherMembers={[]} />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating add expense button */}
      <TouchableOpacity
        style={[styles.addExpenseBtn, { backgroundColor: brand.main }]}
        activeOpacity={0.85}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.addExpenseBtnText}>Add expense</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { paddingTop: 8 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  addExpenseBtn: {
    position: "absolute",
    right: 20,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  addExpenseBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
