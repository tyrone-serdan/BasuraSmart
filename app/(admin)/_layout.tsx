import { Stack } from "expo-router";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { COLORS } from "@/lib/constants";

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (user?.userType !== "admin") {
      router.replace("/");
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.userType !== "admin") {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}