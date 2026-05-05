import { Stack } from "expo-router";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "@/lib/constants";

export default function ResidentLayout() {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  console.log('[ResidentLayout] Rendering. isAuthenticated:', isAuthenticated, 'user:', user?.email, 'userType:', user?.userType, 'isLoading:', isLoading);

  useEffect(() => {
    console.log('[ResidentLayout] useEffect running. isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
    if (!isAuthenticated && !isLoading) {
      console.log('[ResidentLayout] Redirecting to start');
      router.replace("/");
      return;
    }

    if (user?.userType === "collector") {
      console.log('[ResidentLayout] Wrong user type, redirecting to collector');
      router.replace("/(collector)/route");
    }
    
    if (user?.userType === "admin") {
      console.log('[ResidentLayout] Wrong user type, redirecting to admin');
      router.replace("/(admin)/dashboard");
    }
  }, [isAuthenticated, user, isLoading]);

  // Show loading indicator while checking auth
  if (isLoading) {
    console.log('[ResidentLayout] Showing loading...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show error state
  if (error || !isAuthenticated) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Unable to load</Text>
        <Text style={styles.errorText}>{error || "Please log in again"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => { setError(null); router.replace("/"); }}>
          <Text style={styles.retryButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Wrong user type - show message while redirecting
  if (user?.userType !== "resident") {
    console.log('[ResidentLayout] Wrong user type, showing redirect message');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  console.log('[ResidentLayout] Rendering Stack!');
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="report" />
      <Stack.Screen name="rewards" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.primary[600],
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  errorText: {
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: '600',
  },
});