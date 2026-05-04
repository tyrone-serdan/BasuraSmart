import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS } from "@/lib/constants";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/otp" />
        <Stack.Screen name="(auth)/details" />
        <Stack.Screen name="(resident)" />
        <Stack.Screen name="(collector)/route" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </SafeAreaProvider>
  );
}