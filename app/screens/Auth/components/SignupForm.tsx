import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { Shield, HardHat, User, Mail, Lock } from "lucide-react-native";
import * as Haptics from "expo-haptics";

const roles = [
  { 
    id: "driver", 
    label: "Driver", 
    icon: Shield, 
    color: "#38BDF8" 
  },
  { 
    id: "helper", 
    label: "Helper", 
    icon: HardHat, 
    color: "#F59E0B" 
  },
] as const;

interface SignupFormProps {
  onSignup: () => void;
}

export default function SignupForm({ onSignup }: SignupFormProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"driver" | "helper">("driver");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSignup();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join our specialized team of drivers and helpers</Text>
      </View>

      {/* Role Selection */}
      <View style={styles.roleSection}>
        <Text style={styles.sectionLabel}>Select Your Professional Role</Text>
        <View style={styles.rolesRow}>
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            const RoleIcon = role.icon;
            
            return (
              <TouchableOpacity
                key={role.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedRole(role.id as any);
                }}
                activeOpacity={0.7}
                style={[
                  styles.roleCard,
                  isSelected
                    ? {
                        borderColor: "#14B8A6",
                        backgroundColor: "#14B8A610",
                      }
                    : {
                        borderColor: "#E2E8F0",
                        backgroundColor: "#FFFFFF",
                      }
                ]}
              >
                <View style={[
                  styles.roleIconBox,
                  { backgroundColor: isSelected ? role.color : "#F1F5F9" }
                ]}>
                  <RoleIcon 
                    size={20} 
                    color={isSelected ? "#FFFFFF" : "#64748B"} 
                  />
                </View>
                <Text style={[
                  styles.roleTitle,
                  { color: isSelected ? "#0F172A" : "#64748B" }
                ]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.formWrapper}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <User size={18} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email / Phone</Text>
          <View style={styles.inputWrapper}>
            <Mail size={18} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email or phone"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Create a secure password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignup} activeOpacity={0.85}>
          <Text style={styles.signUpText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginGray}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkBlue}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerSection: {
    marginTop: 10,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },
  roleSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  rolesRow: {
    flexDirection: "row",
    gap: 12,
  },
  roleCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 2,
  },
  roleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  roleTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  formWrapper: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
  },
  signUpButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  signUpText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  loginGray: {
    fontSize: 14,
    color: "#64748B",
  },
  linkBlue: {
    fontSize: 14,
    color: "#38BDF8",
    fontWeight: "700",
  },
});
