import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page introuvable" }} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1A202C" }}>
          Cette page n'existe pas.
        </Text>
        <Link href="/" style={{ marginTop: 15, paddingVertical: 15 }}>
          <Text style={{ fontSize: 14, color: "#FF6B35" }}>Retour à l'accueil</Text>
        </Link>
      </View>
    </>
  );
}
