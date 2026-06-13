import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { useCartStore } from "@/stores/cartStore";

function CartTabIcon({ color, size }: { color: string | number; size: number }) {
  const totalItems = useCartStore((s) => s.getTotalItems());
  return (
    <View>
      <Ionicons name="bag-outline" size={size} color={color as string} />
      {totalItems > 0 && (
        <View
          style={{
            position: "absolute", top: -4, right: -8,
            backgroundColor: "#FF6B35", borderRadius: 8,
            minWidth: 16, height: 16, alignItems: "center", justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>{totalItems}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "#A0AEC0",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F0F0F0",
          height: 64,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explorer",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Recherche",
          tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Commandes",
          tabBarIcon: ({ color, size }) => <CartTabIcon color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
