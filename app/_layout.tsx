import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore, useAppStore } from "@/lib/store";

export default function RootLayout() {
  console.log('[Layout] Rendering...');
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const loadAnnouncements = useAppStore((state) => state.loadAnnouncements);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  console.log('[Layout] Current user:', user?.email || 'none');
  console.log('[Layout] Is loading:', isLoading);

  useEffect(() => {
    console.log('[Layout] useEffect: Running initializeAuth...');
    initializeAuth().then(() => {
      console.log('[Layout] useEffect: Auth initialized, loading announcements...');
      loadAnnouncements();
    });
  }, []);

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
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(resident)" />
        <Stack.Screen name="(collector)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </SafeAreaProvider>
  );
}