import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button, Input } from "@/components/ui";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { COLORS, commonStyles } from "@/lib/styles";

export default function RegisterScreen(): JSX.Element {
  const router = useRouter();
  const { setLoading, isLoading } = useAuthStore();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await api.registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });
      
      if (response.success) {
        Alert.alert(
          "Registration Successful!", 
          "Please check your email to confirm your account. After confirming, you can log in.",
          [
            { text: "Go to Login", onPress: () => router.replace("/(auth)/login") }
          ]
        );
      } else {
        Alert.alert("Registration Failed", response.error || "Please try again");
      }
    } catch (error) {
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

        <Text style={styles.title}>Create an account</Text>

        <View style={styles.form}>
          <Input label="Name" placeholder="Enter your full name" value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" />
          <Input label="Email" placeholder="Enter your email" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
          <Input label="Phone Number" placeholder="e.g., 09123456789" value={phone} onChangeText={setPhone} error={errors.phone} keyboardType="phone-pad" />
          <Input label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry />
          <Input label="Confirm Password" placeholder="Confirm your password" value={confirmPassword} onChangeText={setConfirmPassword} error={errors.confirmPassword} secureTextEntry />
        </View>

        <Button title="Register" onPress={handleRegister} loading={isLoading} style={styles.button} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  backText: { color: COLORS.primary[600], fontSize: 28 },
  title: { fontSize: 28, fontWeight: "bold", color: COLORS.primary[600], marginBottom: 32 },
  form: { marginBottom: 24 },
  button: { marginBottom: 32 },
});