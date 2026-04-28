import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { HousesScene } from "@/components/illustrations";
import { commonStyles, COLORS } from "@/lib/styles";

export default function StartScreen(): JSX.Element {
  const router = useRouter();

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <HousesScene width={280} height={180} />
        </View>

        <Text style={styles.title}>Let's Get Started!</Text>

        <Text style={styles.subtitle}>
          Join BasuraSmart and help keep our community clean through proper waste management
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={styles.primaryButton}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.registerLink}>Register here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary[600],
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.primary[950],
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 48,
    opacity: 0.7,
  },
  primaryButton: {
    backgroundColor: COLORS.primary[500],
    width: "100%",
    maxWidth: 300,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 24,
  },
  registerText: {
    color: COLORS.primary[950],
    opacity: 0.7,
  },
  registerLink: {
    color: COLORS.primary[600],
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});