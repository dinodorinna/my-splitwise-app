import { View, Text, StyleSheet } from "react-native";
import { useThemeContext } from "../../../context/theme/themeContext";
import { Plus } from "lucide-react-native";
import { formatBaht } from "../../../utils";

type GroupOverviewProps = {
  totalBalance: number;
  totalOwed: number;
  totalOwedToYou: number;
};

export const GroupOverview = ({
  totalBalance,
  totalOwed,
  totalOwedToYou,
}: GroupOverviewProps) => {
  const { theme, scheme } = useThemeContext();
  const isDark = scheme === "dark";
  const mutedText = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#FFFFFF14" : "#00000010";

  return (
    <View
      style={[styles.balanceCard, { backgroundColor: theme.card, borderColor }]}
    >
      <View style={styles.balanceCol}>
        <View style={styles.balanceLabelRow}>
          <Plus size={12} color={"#1CC29F"} />
          <Text style={[styles.balanceLabel, { color: mutedText }]}>
            OVERALL
          </Text>
        </View>
        <Text style={[styles.balanceValue, { color: "#1CC29F" }]}>
          {formatBaht(totalBalance)}
        </Text>
      </View>

      <View style={[styles.balanceDivider, { backgroundColor: borderColor }]} />

      <View style={styles.balanceCol}>
        <Text style={[styles.balanceLabel, { color: mutedText }]}>YOU OWE</Text>
        <Text style={[styles.balanceValue, { color: "#F97316" }]}>
          {formatBaht(totalOwed)}
        </Text>
      </View>

      <View style={[styles.balanceDivider, { backgroundColor: borderColor }]} />

      <View style={styles.balanceCol}>
        <Text style={[styles.balanceLabel, { color: mutedText }]}>
          YOU'RE OWED
        </Text>
        <Text style={[styles.balanceValue, { color: "#1CC29F" }]}>
          {formatBaht(totalOwedToYou)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 18,
    marginBottom: 28,
  },
  balanceCol: { flex: 1, alignItems: "center", gap: 6 },
  balanceLabelRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  balanceLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },
  balanceValue: { fontSize: 17, fontWeight: "700" },
  balanceDivider: { width: StyleSheet.hairlineWidth },
});
