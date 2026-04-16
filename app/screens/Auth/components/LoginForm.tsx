import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";



interface LoginFormProps {
  onLogin: () => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validate = (): boolean => {
    // Validation bypassed for UI testing
    return true;
  };

  const handleSubmit = () => {
    if (validate()) {
      onLogin();
    }
  };

  return (
    <View style={styles.container}>
      {/* Push form down a bit from the header */}
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
    marginTop: 56, // << pushes the fields down from the header
    gap: 0,
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
