import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, ArrowRight, CheckCircle2, Mail, Lock } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, { 
  FadeInDown, 
  FadeOutUp, 
  LinearTransition,
  FadeIn,
  FadeOut
} from "react-native-reanimated";

type Step = "EMAIL" | "OTP" | "RESET";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSendOTP = () => {
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("OTP");
      setErrors({});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const handleVerifyOTP = () => {
    if (otp.length < 4) {
      setErrors({ otp: "Please enter a valid OTP" });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("RESET");
      setErrors({});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const handleResetPassword = () => {
    const newErrors: Record<string, string> = {};
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/screens/Auth/LoginScreen");
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Animated.View layout={LinearTransition} style={styles.formWrapper}>
        
        {/* STEP 1: EMAIL */}
        {step === "EMAIL" && (
          <Animated.View 
            entering={FadeInDown.duration(400)} 
            exiting={FadeOutUp}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>Reset Password</Text>
            <Text style={styles.stepDescription}>
              Enter your email address and we&apos;ll send you an OTP to reset your password.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({});
                  }}
                  style={[styles.input, styles.inputWithIcon, errors.email ? styles.inputError : null]}
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleSendOTP} 
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Text style={styles.buttonText}>Send OTP</Text>
                  <ArrowRight size={18} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* STEP 2: OTP */}
        {step === "OTP" && (
          <Animated.View 
            entering={FadeInDown.duration(400)} 
            exiting={FadeOutUp}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>Verify OTP</Text>
            <Text style={styles.stepDescription}>
              We&apos;ve sent a verification code to {email}.
            </Text>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Verification Code</Text>
                <TouchableOpacity onPress={() => setStep("EMAIL")}>
                  <Text style={styles.changeLink}>Change Email</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder="Enter 4-digit code"
                value={otp}
                onChangeText={(text) => {
                  setOtp(text.replace(/[^0-9]/g, ""));
                  if (errors.otp) setErrors({});
                }}
                style={[styles.input, styles.otpInput, errors.otp ? styles.inputError : null]}
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
              />
              {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
            </View>

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleVerifyOTP} 
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#FFF" /> : (
                <Text style={styles.buttonText}>Verify Code</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* STEP 3: RESET */}
        {step === "RESET" && (
          <Animated.View 
            entering={FadeInDown.duration(400)} 
            exiting={FadeOutUp}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>New Password</Text>
            <Text style={styles.stepDescription}>
              Create a strong password that you haven&apos;t used before.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordWrapper}>
                <Lock size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  placeholder="At least 8 characters"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors((e) => ({ ...e, password: "" }));
                  }}
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.inputWithIcon, errors.password ? styles.inputError : null]}
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.eyeIcon}
                >
                  {showPassword ? <EyeOff size={20} color="#64748B" /> : <Eye size={20} color="#64748B" />}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordWrapper}>
                <Lock size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  placeholder="Verify password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: "" }));
                  }}
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.inputWithIcon, errors.confirmPassword ? styles.inputError : null]}
                  placeholderTextColor="#94A3B8"
                />
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleResetPassword} 
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#FFF" /> : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        <TouchableOpacity 
          style={styles.backLink} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Text style={styles.backLinkText}>Back to Login</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  formWrapper: {
    marginTop: 40,
  },
  stepContainer: {
    width: "100%",
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 32,
    lineHeight: 20,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    color: "#0F172A",
  },
  inputWithIcon: {
    paddingLeft: 46,
  },
  otpInput: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 8,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FFF5F5",
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    zIndex: 10,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: "#EF4444",
    paddingLeft: 4,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  changeLink: {
    fontSize: 12,
    color: "#38BDF8",
    fontWeight: "600",
  },
  backLink: {
    marginTop: 32,
    alignItems: "center",
  },
  backLinkText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
});
