import { ChevronDown, UserPlus } from "lucide-react-native";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useThemeContext } from "../../../context/theme/themeContext";

type GroupHeaderProps = {
  groupName: string;
  paticipants: any[]; // maybe it has name, image
};
export const GroupHeader = ({ groupName, paticipants }: GroupHeaderProps) => {
  const { theme, scheme } = useThemeContext();
  const isDark = scheme === "dark";
  const mutedText = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#FFFFFF14" : "#00000010";

  return (
    <View style={styles.headerTop}>
      <View>
        <Text style={[styles.groupLabel, { color: mutedText }]}>GROUP</Text>
        <TouchableOpacity style={styles.groupTitleRow} activeOpacity={0.7}>
          <Text style={[styles.groupTitle, { color: theme.text }]}>
            {groupName}
          </Text>
          <ChevronDown size={20} color={mutedText} />
        </TouchableOpacity>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.avatarStack}>
          {paticipants.map((member, index) => (
            <View
              key={member.id}
              style={[
                styles.avatarChip,
                {
                  backgroundColor: member.color,
                  marginLeft: index === 0 ? 0 : -10,
                  borderColor: theme.background,
                },
              ]}
            >
              <Text style={styles.avatarChipText}>{member.initial}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[
            styles.addMemberIconBtn,
            { borderColor, backgroundColor: theme.card },
          ]}
          activeOpacity={0.7}
        >
          <UserPlus size={18} color={theme.text} />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  groupTitleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  groupTitle: { fontSize: 24, fontWeight: "700" },
  headerRight: { alignItems: "flex-end", gap: 10 },
  avatarStack: { flexDirection: "row" },
  avatarChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarChipText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  addMemberIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
