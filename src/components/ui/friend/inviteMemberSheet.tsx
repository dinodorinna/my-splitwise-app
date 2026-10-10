import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { X, Mail, Link, AtSign, LucideIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type InviteMethod = "email" | "link";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSendEmail: (email: string) => void;
  onShareLink: () => void;
};

export function InviteMemberSheet({
  visible,
  onClose,
  onSendEmail,
  onShareLink,
}: Props) {
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState<InviteMethod>("email");
  const [email, setEmail] = useState("");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose} // Android back button
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Backdrop: tap to close */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Invite new member</Text>
              <Text style={styles.subtitle}>Choose how to send the invite</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <X size={20} color="#333" />
            </Pressable>
          </View>

          {/* Method cards */}
          <View style={styles.options}>
            <OptionCard
              active={method === "email"}
              onPress={() => setMethod("email")}
              Icon={Mail}
              title="Invite via email"
              desc="Send a personal invite"
            />
            <OptionCard
              active={method === "link"}
              onPress={() => setMethod("link")}
              Icon={Link}
              title="Invite with link"
              desc="Share anywhere, e.g. LINE"
            />
          </View>

          {/* Content for the chosen method */}
          {method === "email" ? (
            <>
              <View style={styles.inputRow}>
                <View style={styles.inputBox}>
                  <AtSign size={18} color="#8A938F" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="friend@email.com"
                    placeholderTextColor="#8A938F"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.sendBtn, !email && { opacity: 0.5 }]}
                  disabled={!email}
                  onPress={() => {
                    onSendEmail(email);
                    setEmail("");
                  }}
                >
                  <Text style={styles.sendText}>Send</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>
                They'll get an email to join the group with Google sign-in.
              </Text>
            </>
          ) : (
            <TouchableOpacity style={styles.shareBtn} onPress={onShareLink}>
              <Text style={styles.sendText}>Share invite link</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function OptionCard({
  active,
  onPress,
  Icon,
  title,
  desc,
}: {
  active: boolean;
  onPress: () => void;
  Icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, active && styles.cardActive]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.cardIcon, active && styles.cardIconActive]}>
          <Icon size={20} color={active ? "#0B3B30" : "#16936F"} />
        </View>
        <View style={[styles.radio, active && styles.radioActive]} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DDE2E0",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111" },
  subtitle: { fontSize: 14, color: "#6B7570", marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF1F0",
    alignItems: "center",
    justifyContent: "center",
  },
  options: { flexDirection: "row", gap: 12 },
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    gap: 4,
    backgroundColor: "#F5F7F6",
    borderWidth: 1,
    borderColor: "#E6E9E8",
  },
  cardActive: { backgroundColor: "#EDFAF5", borderColor: "#1DC29E" },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E6F4EF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconActive: { backgroundColor: "#1DC29E" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D5DCD9",
  },
  radioActive: { backgroundColor: "#1DC29E", borderColor: "#1DC29E" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  cardDesc: { fontSize: 13, color: "#6B7570" },
  inputRow: { flexDirection: "row", gap: 10 },
  inputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F2F4F3",
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 14, color: "#111" },
  sendBtn: {
    backgroundColor: "#1DC29E",
    borderRadius: 14,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  shareBtn: {
    backgroundColor: "#1DC29E",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  sendText: { fontSize: 16, fontWeight: "700", color: "#0B3B30" },
  hint: { fontSize: 13, color: "#6B7570", marginTop: -6 },
  doneBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#F5F7F6",
    borderWidth: 1,
    borderColor: "#E6E9E8",
  },
  doneText: { fontSize: 16, fontWeight: "700", color: "#111" },
});
