import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Eye, EyeOff, Shield, HardHat, KeyRound, MessageSquare } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import type { UserRole } from "../../../types/roles";

const roles = [
  { id: "driver" as const, label: "Driver", icon: Shield },
  { id: "helper" as const, label: "Helper", icon: HardHat },
];

export type SignInMethod = "password" | "otp";

interface LoginFormProps {
  onSendOtp: (identifier: string) => Promise<void>;
  onLogin: (
    identifier: string,
    passwordOrOtp: string,
    expectedRole: UserRole
  ) => Promise<void>;
  loading: boolean;
  otpSending: boolean;
}

export default function LoginForm({
  onSendOtp,
  onLogin,
  loading,
  otpSending,
}: LoginFormProps) {
  const router = useRouter();
  const [signInMethod, setSignInMethod] = useState<SignInMethod>("password");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("driver");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({
    identifier: "",
    secret: "",
  });

  const validateIdentifier = (): boolean => {
    if (!identifier.trim()) {
      setErrors((e) => ({ ...e, identifier: "Email or phone is required." }));
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateIdentifier()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await onSendOtp(identifier);
    setErrors((e) => ({ ...e, identifier: "" }));
  };

  const handleSubmit = async () => {
    if (!validateIdentifier()) return;
    const secret =
      signInMethod === "password" ? password.trim() : otp.trim();
    if (!secret) {
      setErrors((e) => ({
        ...e,
        secret:
          signInMethod === "password"
            ? "Enter your password."
            : "Enter the OTP you received.",
      }));
      return;
    }
    if (signInMethod === "otp" && secret.length < 4) {
      setErrors((e) => ({
        ...e,
        secret: "OTP is usually 4 digits or more.",
      }));
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await onLogin(identifier, secret, selectedRole);
  };

  const otpHint =
    identifier.trim().includes("@") ? "Check your email inbox" : "Check SMS";

  return (
    <View style={styles.container}>
      <View style={styles.roleSection}>
        <Text style={styles.sectionLabel}>Select your role</Text>
        <View style={styles.rolesRow}>
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            const RoleIcon = role.icon;

            return (
              <TouchableOpacity
                key={role.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedRole(role.id);
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
                          backgroundColor: role.id === "driver" ? "#38BDF8" : "#F59E0B",
                        }
                      : { backgroundColor: "#F1F5F9" },
                  ]}
                >
                  <RoleIcon size={20} color={isSelected ? "#FFFFFF" : "#64748B"} />
                </View>
                <Text
                  style={[
                    styles.roleTitle,
                    { color: isSelected ? "#0F172A" : "#64748B" },
                  ]}
                >
                  {role.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.methodSection}>
        <Text style={styles.sectionLabel}>Sign in with</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[
              styles.methodChip,
              signInMethod === "password" && styles.methodChipActive,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setSignInMethod("password");
              setErrors({ identifier: "", secret: "" });
            }}
            activeOpacity={0.85}
          >
            <KeyRound
              size={18}
              color={signInMethod === "password" ? "#0F172A" : "#64748B"}
            />
            <Text
              style={[
                styles.methodChipText,
                signInMethod === "password" && styles.methodChipTextActive,
              ]}
            >
              Password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.methodChip,
              signInMethod === "otp" && styles.methodChipActiveOtp,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setSignInMethod("otp");
              setErrors({ identifier: "", secret: "" });
            }}
            activeOpacity={0.85}
          >
            <MessageSquare
              size={18}
              color={signInMethod === "otp" ? "#0F172A" : "#64748B"}
            />
            <Text
              style={[
                styles.methodChipText,
                signInMethod === "otp" && styles.methodChipTextActive,
              ]}
            >
              Email / SMS OTP
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.methodHint}>
          {signInMethod === "password"
            ? "Use the password your school set on your account."
            : `Request a code — ${otpHint.toLowerCase()}. (No password on file? Use OTP.)`}
        </Text>
      </View>

      <View style={styles.formWrapper}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email or phone</Text>
          <TextInput
            placeholder="Registered email or mobile"
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              if (errors.identifier) setErrors((e) => ({ ...e, identifier: "" }));
            }}
            style={[styles.input, errors.identifier ? styles.inputError : null]}
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            textContentType="username"
            editable={!loading}
          />
          {errors.identifier ? (
            <Text style={styles.errorText}>{errors.identifier}</Text>
          ) : null}
        </View>

        {signInMethod === "otp" ? (
          <>
            <TouchableOpacity
              style={styles.sendOtpBtn}
              onPress={handleSendOtp}
              disabled={otpSending || loading}
              activeOpacity={0.85}
            >
              {otpSending ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.sendOtpText}>Send OTP</Text>
              )}
            </TouchableOpacity>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>One-time password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  placeholder="Enter OTP"
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text);
                    if (errors.secret) setErrors((e) => ({ ...e, secret: "" }));
                  }}
                  secureTextEntry={!otpVisible}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    errors.secret ? styles.inputError : null,
                  ]}
                  placeholderTextColor="#94A3B8"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  textContentType="oneTimeCode"
                  keyboardType="number-pad"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setOtpVisible(!otpVisible)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {otpVisible ? (
                    <EyeOff size={20} color="#64748B" />
                  ) : (
                    <Eye size={20} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.secret ? (
                <Text style={styles.errorText}>{errors.secret}</Text>
              ) : null}
            </View>
          </>
        ) : (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                placeholder="Your account password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.secret) setErrors((e) => ({ ...e, secret: "" }));
                }}
                secureTextEntry={!passwordVisible}
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.secret ? styles.inputError : null,
                ]}
                placeholderTextColor="#94A3B8"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                textContentType="password"
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.eyeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {passwordVisible ? (
                  <EyeOff size={20} color="#64748B" />
                ) : (
                  <Eye size={20} color="#64748B" />
                )}
              </TouchableOpacity>
            </View>
            {errors.secret ? (
              <Text style={styles.errorText}>{errors.secret}</Text>
            ) : null}
          </View>
        )}

        <View style={styles.optionsRow}>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/screens/Auth/ForgotPasswordScreen");
            }}
          >
            <Text style={styles.linkBlue}>Help</Text>
          </TouchableOpacity>

          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/screens/Auth/OTPLoginScreen");
            }}
          >
            <Text style={styles.linkTeal}>Shortcuts</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.signInButton, loading && styles.signInButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signInText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signUpRow}>
          <Text style={styles.signUpGray}>Need access? Ask your school admin.</Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/screens/Auth/SignupScreen");
            }}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
            accessibilityRole="link"
            accessibilityLabel="Sign up"
          >
            <Text style={styles.signUpLink}> Sign up</Text>
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
  methodSection: {
    marginTop: 20,
    marginBottom: 4,
  },
  methodRow: {
    flexDirection: "row",
    gap: 10,
  },
  methodChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  methodChipActive: {
    borderColor: "#38BDF8",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
  },
  methodChipActiveOtp: {
    borderColor: "#14B8A6",
    backgroundColor: "rgba(20, 184, 166, 0.1)",
  },
  methodChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  methodChipTextActive: {
    color: "#0F172A",
  },
  methodHint: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    fontWeight: "500",
  },
  formWrapper: {
    marginTop: 16,
    gap: 0,
  },
  sendOtpBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  sendOtpText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
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
  signInButtonDisabled: {
    opacity: 0.7,
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
    flexWrap: "wrap",
    marginTop: 16,
    paddingHorizontal: 8,
  },
  signUpGray: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
  signUpLink: {
    fontSize: 13,
    fontWeight: "800",
    color: "#38BDF8",
  },
});
