import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { HousesScene } from "@/components/illustrations";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { COLORS, commonStyles } from "@/lib/styles";

export default function LoginScreen(): JSX.Element {
  const router = useRouter();
  const { login, setLoading, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    console.log('[Login] handleLogin: Starting login...');
    if (!validate()) return;

    setLoading(true);

    try {
      const response = await api.loginUser({
        identifier: email.trim().toLowerCase(),
        password,
      });

      console.log('[Login] handleLogin: API response:', response.success ? 'Success' : 'Failed');

      if (response.success && response.data) {
        console.log('[Login] handleLogin: User data:', response.data);
        login(response.data);
        console.log('[Login] handleLogin: User logged in, navigating...');
        
        if (response.data.userType === "admin") {
          console.log('[Login] handleLogin: Redirecting to admin dashboard');
          router.replace("/(admin)/dashboard");
        } else if (response.data.userType === "collector") {
          console.log('[Login] handleLogin: Redirecting to collector route');
          router.replace("/(collector)/route");
        } else {
          console.log('[Login] handleLogin: Redirecting to resident home');
          router.replace("/(resident)/home");
        }
      } else {
        console.log('[Login] handleLogin: Login failed:', response.error);
        Alert.alert("Login Failed", response.error || "Invalid email or password");
      }
    } catch (error) {
      console.log('[Login] handleLogin: Error:', error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.illustrationContainer}>
          <HousesScene width={240} height={160} />
        </View>

        <Text style={styles.title}>Welcome Back!</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
          />
        </View>

        <Button title="Log In" onPress={handleLogin} loading={isLoading} style={styles.button} />

        <View style={styles.demoHint}>
          <Text style={styles.demoText}>
            Demo: juan@email.com / demo123 (resident){"\n"}
            pedro@basurasmart.com / demo123 (collector){"\n"}
            admin@basurasmart.com / admin123 (admin)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  backText: { color: COLORS.primary[600], fontSize: 28 },
  illustrationContainer: { alignItems: "center", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "bold", color: COLORS.primary[600], textAlign: "center", marginBottom: 32 },
  form: { marginBottom: 24 },
  button: { marginTop: 16 },
  demoHint: { backgroundColor: COLORS.primary[100], borderRadius: 12, padding: 16, marginTop: 24 },
  demoText: { color: COLORS.primary[800], fontSize: 14, textAlign: "center" },
});