import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface SignupFormProps {
  onSignup: () => void;
}

export default function SignupForm({ onSignup }: SignupFormProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join us to start managing your school commute</Text>

        {/* Mock fields for illustration */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.input, { justifyContent: 'center' }]}>
            <Text style={{ color: '#94A3B8' }}>Enter your name</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email / Phone</Text>
          <View style={[styles.input, { justifyContent: 'center' }]}>
            <Text style={{ color: '#94A3B8' }}>Enter your email or phone</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.input, { justifyContent: 'center' }]}>
            <Text style={{ color: '#94A3B8' }}>********</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signUpButton} onPress={onSignup} activeOpacity={0.85}>
          <Text style={styles.signUpText}>Sign Up</Text>
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
  },
  formWrapper: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 32,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 6,
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  signUpButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  signUpText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  loginGray: {
    fontSize: 13,
    color: "#64748B",
  },
  linkBlue: {
    fontSize: 13,
    color: "#38BDF8",
    fontWeight: "600",
  },
});
