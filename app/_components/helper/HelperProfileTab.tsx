import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { User, Phone, Mail, Building2, Bus, MapPin, LogOut } from "lucide-react-native";

import { useRouter } from "expo-router";
import { HelperAssignment } from "../../_context/HelperAssignmentContext";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logoutThunk } from "../../../store/slices/authSlice";
import HelperProfileInfoRow from "./HelperProfileInfoRow";

interface Props {
  assignment: HelperAssignment;
  onChangeAssignment: () => void;
}

function displayOrDash(v: string | null | undefined) {
  const t = v?.trim();
  return t ? t : "—";
}

export default function HelperProfileTab({ assignment, onChangeAssignment }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const me = useAppSelector((s) => s.auth.me);
  const { bus, route } = assignment;

  const confirmChangeBusRoute = () => {
    Alert.alert(
      "Change bus & route?",
      "You will return to bus and route selection. Current screen data is local only.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", style: "destructive", onPress: onChangeAssignment },
      ]
    );
  };

  const confirmLogout = () => {
    Alert.alert("Sign out?", undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await dispatch(logoutThunk());
          router.replace("/screens/Auth/LoginScreen" as any);
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <User size={40} color="#0F766E" />
        </View>
        <Text style={styles.name}>{displayOrDash(me?.user?.name)}</Text>
        <Text style={styles.role}>Bus helper</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact</Text>
        <HelperProfileInfoRow icon={Phone} label="Phone" value={displayOrDash(me?.user?.phone)} />
        <HelperProfileInfoRow icon={Mail} label="Email" value={displayOrDash(me?.user?.email)} />
        <HelperProfileInfoRow
          icon={Building2}
          label="School"
          value={displayOrDash(me?.user?.school?.name)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current shift</Text>
        <HelperProfileInfoRow
          icon={Bus}
          label="Bus"
          value={`${bus.name} · ${bus.licensePlate}`}
        />
        <HelperProfileInfoRow icon={MapPin} label="Route" value={route.name} />
        <TouchableOpacity style={styles.linkBtn} onPress={confirmChangeBusRoute} activeOpacity={0.85}>
          <Text style={styles.linkBtnText}>Change bus & route</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logout} onPress={confirmLogout} activeOpacity={0.88}>
        <LogOut size={20} color="#B91C1C" />
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 112,
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#99F6E4",
  },
  name: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  role: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  linkBtn: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  linkBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0D9488",
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#B91C1C",
  },
});
