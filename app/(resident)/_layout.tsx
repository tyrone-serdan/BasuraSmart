import { Stack } from "expo-router";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { COLORS } from "@/lib/constants";

export default function ResidentLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (user?.userType === "collector") {
      router.replace("/(collector)/route");
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.userType !== "resident") {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="report" />
    </Stack>
  );
}