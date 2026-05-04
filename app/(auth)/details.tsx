import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { GarbageTruck } from "@/components/illustrations";
import { Button, Dropdown } from "@/components/ui";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { PUROK_LIST, USER_TYPES } from "@/lib/constants";
import { COLORS, commonStyles } from "@/lib/styles";
import type { UserType } from "@/lib/types";

export default function DetailsScreen(): JSX.Element {
  const router = useRouter();
  const { login, setLoading, isLoading } = useAuthStore();
  
  const [purok, setPurok] = useState("");
  const [userType, setUserType] = useState<UserType | "">("");
  const [errors, setErrors] = useState<{ purok?: string; userType?: string }>({});

  const purokOptions = PUROK_LIST.map((p) => ({ value: p, label: p }));
  const userTypeOptions = USER_TYPES.map((t) => ({ value: t.value, label: t.label }));

  const validate = () => {
    const newErrors: { purok?: string; userType?: string } = {};
    if (!purok) newErrors.purok = "Please select your Purok";
    if (!userType) newErrors.userType = "Please select your user type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await api.saveUserDetails("new-user-id", { purok, userType: userType as UserType });
      if (response.success && response.data) {
        login(response.data);
        if (userType === "collector") router.replace("/(collector)/route");
        else router.replace("/(resident)/home");
      } else {
        Alert.alert("Error", response.error || "Failed to save details");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    login({
      id: "demo-user",
      name: "Demo User",
      email: "demo@basurasmart.com",
      phone: "09*********",
      purok: purok || "Purok 1 - Centro",
      userType: (userType as UserType) || "resident",
      points: 0,
    });
    if (userType === "collector" || userType === "") router.replace("/(collector)/route");
    else router.replace("/(resident)/home");
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.illustrationContainer}>
          <GarbageTruck width={160} height={100} />
        </View>

        <Text style={styles.title}>One last step!</Text>

        <View style={styles.form}>
          <Dropdown label="Purok" placeholder="Select your Purok" value={purok} options={purokOptions} onSelect={setPurok} error={errors.purok} />
          <Dropdown label="User Type" placeholder="Are you a resident or collector?" value={userType} options={userTypeOptions} onSelect={(val) => setUserType(val as UserType)} error={errors.userType} />
        </View>

        <Button title="Confirm" onPress={handleConfirm} loading={isLoading} style={styles.button} />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip for demo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  backText: { color: COLORS.primary[600], fontSize: 28 },
  illustrationContainer: { alignItems: "center", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "bold", color: COLORS.primary[600], textAlign: "center", marginBottom: 32 },
  form: { marginBottom: 24 },
  button: { marginBottom: 16 },
  skipButton: { paddingVertical: 12 },
  skipText: { color: COLORS.primary[600], textAlign: "center" },
});