import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { OTPInput, Button } from "@/components/ui";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { OTP_EXPIRATION_SECONDS, DEMO_OTP } from "@/lib/constants";
import { COLORS, commonStyles } from "@/lib/styles";

export default function OTPScreen(): JSX.Element {
  const router = useRouter();
  const { otpSentTo, setLoading, isLoading } = useAuthStore();
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(OTP_EXPIRATION_SECONDS);
  
  const maskedPhone = otpSentTo 
    ? otpSentTo.slice(0, 2) + "*".repeat(8) + otpSentTo.slice(-2)
    : "09*********";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) { setError("Please enter all 6 digits"); return; }
    setLoading(true);
    setError("");
    try {
      const response = await api.verifyEmailOtp(otpSentTo || "", otp);
      if (response.success) {
        router.push("/(auth)/details");
      } else {
        setError(response.error || "Invalid OTP code");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => setCountdown(OTP_EXPIRATION_SECONDS);
  const fillDemoOtp = () => setOtp(DEMO_OTP);

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Please enter the code sent to {maskedPhone}</Text>

        <OTPInput value={otp} onChange={setOtp} error={error} />

        <TouchableOpacity onPress={fillDemoOtp} style={styles.demoLink}>
          <Text style={styles.demoLinkText}>Demo: Tap here to auto-fill (123456)</Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive a code? </Text>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>Resend in {countdown}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button title="Verify" onPress={handleVerify} loading={isLoading} disabled={otp.length !== 6} style={styles.button} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  backText: { color: COLORS.primary[600], fontSize: 28 },
  title: { fontSize: 28, fontWeight: "bold", color: COLORS.primary[600], marginBottom: 16 },
  subtitle: { color: COLORS.primary[950], opacity: 0.7, marginBottom: 32 },
  demoLink: { marginBottom: 24 },
  demoLinkText: { color: COLORS.primary[600], fontSize: 14, textAlign: "center" },
  resendContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 32 },
  resendText: { color: COLORS.primary[950], opacity: 0.7 },
  countdownText: { color: COLORS.primary[600] },
  resendLink: { color: COLORS.primary[600], fontWeight: "600", textDecorationLine: "underline" },
  button: { marginBottom: 32 },
});