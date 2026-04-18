import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { Mail, Smartphone, ArrowRight, Lock, Command } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, { 
  FadeInDown, 
  FadeOutUp, 
  LinearTransition,
  FadeIn,
  FadeOut
} from "react-native-reanimated";

interface OTPLoginFormProps {
  onLogin: (email: string, otp: string) => void;
}

export default function OTPLoginForm({ onLogin }: OTPLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", otp: "" });
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setErrors((e) => ({ ...e, email: "Email or phone is required." }));
      return false;
    }
    return true;
  };

  const handleSendOTP = () => {
    if (validateEmail()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setOtpSent(true);
        setTimer(60);
        setErrors((e) => ({ ...e, email: "" }));
      }, 1500);
    }
  };

  const handleSignIn = () => {
    if (!otp.trim() || otp.length < 4) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrors((e) => ({ ...e, otp: "Please enter a valid OTP." }));
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLogin(email, otp);
  };

  return (
    <View style={styles.container}>
      <Animated.View layout={LinearTransition} style={styles.formWrapper}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Secure Login</Text>
          <Text style={styles.subtitle}>
            {otpSent 
              ? "Enter the verification code sent to your device" 
              : "Verify your identity using a one-time password"}
          </Text>
        </View>

        {/* Email / Phone Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email / Phone</Text>
          <View style={styles.inputWrapper}>
            <Smartphone size={18} color="#94A3B8" style={styles.inputIcon} />
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
              editable={!otpSent}
            />
            {otpSent && (
              <TouchableOpacity 
                style={styles.changeButton} 
                onPress={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
              >
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            )}
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        {!otpSent ? (
          <Animated.View 
            entering={FadeInDown.duration(400)} 
            exiting={FadeOutUp.duration(300)}
            layout={LinearTransition}
          >
            <TouchableOpacity 
              style={styles.sendOtpButton} 
              onPress={handleSendOTP} 
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.sendOtpText}>Send Verification Code</Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View 
            entering={FadeInDown.springify()} 
            exiting={FadeOutUp}
            layout={LinearTransition}
            style={styles.fieldGroup}
          >
            <View style={styles.labelRow}>
              <Text style={styles.label}>Verification Code</Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleSendOTP}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputWrapper}>
              <Command size={18} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                placeholder="4-digit code"
                value={otp}
                onChangeText={(text) => {
                  setOtp(text.replace(/[^0-9]/g, ""));
                  if (errors.otp) setErrors((e) => ({ ...e, otp: "" }));
                }}
                style={[styles.input, styles.otpInput, errors.otp ? styles.inputError : null]}
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={4}
                autoFocus={true}
              />
            </View>
            {errors.otp ? (
              <Animated.Text entering={FadeIn} exiting={FadeOut} style={styles.errorText}>
                {errors.otp}
              </Animated.Text>
            ) : null}
          </Animated.View>
        )}

        <View style={styles.optionsRow}>
          <TouchableOpacity 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Text style={styles.linkBlue}>Back to Password Login</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.buttonSection}>
        <TouchableOpacity 
          style={[styles.signInButton, (!otpSent || otp.length < 4) && styles.disabledButton]} 
          onPress={handleSignIn} 
          disabled={!otpSent || otp.length < 4}
          activeOpacity={0.85}
        >
          <Text style={styles.signInText}>Confirm & Sign In</Text>
        </TouchableOpacity>

        <View style={styles.signUpRow}>
          <Text style={styles.signUpGray}>Need help? </Text>
          <TouchableOpacity>
            <Text style={styles.linkBlue}>Contact Supervisor</Text>
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
  headerSection: {
    marginBottom: 32,
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
  formWrapper: {
    marginTop: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
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
  otpInput: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 4,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#EF4444",
    paddingLeft: 4,
  },
  changeButton: {
    paddingHorizontal: 12,
  },
  changeText: {
    fontSize: 13,
    color: "#38BDF8",
    fontWeight: "700",
  },
  sendOtpButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    backgroundColor: "#14B8A6",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    shadowColor: "#14B8A6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  sendOtpText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  timerText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  resendText: {
    fontSize: 12,
    color: "#14B8A6",
    fontWeight: "700",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  linkBlue: {
    fontSize: 14,
    color: "#38BDF8",
    fontWeight: "700",
  },
  buttonSection: {
    marginTop: 40,
  },
  signInButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },
  signInText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signUpGray: {
    fontSize: 14,
    color: "#64748B",
  },
});
