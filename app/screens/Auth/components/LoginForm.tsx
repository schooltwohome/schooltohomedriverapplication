import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Eye, EyeOff, Shield, HardHat } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { UserRole } from "../../../context/AuthContext";

const roles = [
  { id: "driver", label: "Driver", icon: Shield },
  { id: "helper", label: "Helper", icon: HardHat },
] as const;

interface LoginFormProps {
  onLogin: (role: UserRole) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"driver" | "helper">("driver");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validate = (): boolean => {
    // Validation bypassed for UI testing
    return true;
  };

  const handleSubmit = () => {
    if (validate()) {
      onLogin(selectedRole);
    }
  };

  return (
    <View style={styles.container}>
      {/* Push form down a bit from the header */}
      {/* Role Selection Section */}
      <View style={styles.roleSection}>
        <Text style={styles.sectionLabel}>Select Your Role</Text>
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
                    ? role.id === "driver"
                      ? {
                          borderColor: "#38BDF8",
                          backgroundColor: "rgba(56, 189, 248, 0.12)",
                        }
                      : {
                          borderColor: "#F59E0B",
                          backgroundColor: "rgba(245, 158, 11, 0.12)",
                        }
                    : {
                        borderColor: "#E2E8F0",
                        backgroundColor: "#FFFFFF",
                      },
                ]}
              >
                <View
                  style={[
                    styles.roleIconBox,
                    isSelected
                      ? {
                          backgroundColor:
                            role.id === "driver" ? "#38BDF8" : "#F59E0B",
                        }
                      : { backgroundColor: "#F1F5F9" },
                  ]}
                >
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

        {/* Email / Phone Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email / Phone</Text>
          <TextInput
            placeholder="Enter your email or phone"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((e) => ({ ...e, email: "" }));
            }}
            style={[styles.input, errors.email ? styles.inputError : null]}
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            textContentType="emailAddress"
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        {/* Password Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((e) => ({ ...e, password: "" }));
              }}
              secureTextEntry={!showPassword}
              style={[
                styles.input,
                styles.passwordInput,
                errors.password ? styles.inputError : null,
              ]}
              placeholderTextColor="#94A3B8"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              textContentType="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {showPassword ? (
                <EyeOff size={20} color="#64748B" />
              ) : (
                <Eye size={20} color="#64748B" />
              )}
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
        </View>

        {/* Forgot / OTP Row */}
        <View style={styles.optionsRow}>
          <TouchableOpacity 
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/screens/Auth/ForgotPasswordScreen");
            }}
          >
            <Text style={styles.linkBlue}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/screens/Auth/OTPLoginScreen");
            }}
          >
            <Text style={styles.linkTeal}>Login with OTP</Text>
          </TouchableOpacity>


        </View>
      </View>

      {/* Sign In Button */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.signInButton} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.signUpRow}>
          <Text style={styles.signUpGray}>Don&apos;t have an account? </Text>
          <TouchableOpacity 
            onPress={() => router.push("/screens/Auth/SignupScreen" as any)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.linkBlue}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  formWrapper: {
    marginTop: 24, // << spacing after role selector
    gap: 0,
  },
  roleSection: {
    marginTop: 32,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  rolesRow: {
    flexDirection: "row",
    gap: 12,
  },
  roleCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
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
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    color: "#0F172A",
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 48,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#EF4444",
    paddingLeft: 4,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  linkBlue: {
    fontSize: 13,
    color: "#38BDF8",
    fontWeight: "600",
  },
  linkTeal: {
    fontSize: 13,
    color: "#14B8A6",
    fontWeight: "600",
  },
  buttonSection: {
    marginTop: 36,
  },
  signInButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  signInText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  signUpGray: {
    fontSize: 13,
    color: "#64748B",
  },
});
