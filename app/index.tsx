import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/stores/authStore";
import { View, ActivityIndicator } from "react-native";

export default function EntryPoint() {
  const router = useRouter();
  const { isLoading, user, isGuest } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.getItem("onboarding_done").then((done) => {
      if (!done) {
        router.replace("/onboarding");
      } else if (user || isGuest) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    });
  }, [isLoading, user, isGuest]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F8FA" }}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );
}
