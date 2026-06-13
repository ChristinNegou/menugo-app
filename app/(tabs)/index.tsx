import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, FlatList
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useRestaurants } from "@/hooks/useRestaurants";
import { Restaurant } from "@/types";
import { RestaurantCard } from "@/components/RestaurantCard";
import { CategoryChip } from "@/components/CategoryChip";
import { RestaurantCardSkeleton } from "@/components/LoadingSkeleton";
import { useCartStore } from "@/stores/cartStore";

const CATEGORIES = ["Tout", "Burgers", "Pizza", "Sushi", "Poutine", "Mexicain", "Végétarien", "Déjeuner"];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const { data: restaurants, isLoading, refetch } = useRestaurants(selectedCategory);
  const totalItems = useCartStore((s) => s.getTotalItems());

  const popular = restaurants?.filter((r: Restaurant) => r.rating >= 4.5) ?? [];
  const newest = restaurants?.slice().sort((a: Restaurant, b: Restaurant) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 6) ?? [];
  const open = restaurants?.filter((r: Restaurant) => r.is_open) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity className="flex-row items-center gap-1">
            <Ionicons name="location" size={18} color="#FF6B35" />
            <Text className="text-text-primary font-bold text-base">Trois-Rivières</Text>
            <Ionicons name="chevron-down" size={16} color="#718096" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.push("/cart")} className="relative">
              <Ionicons name="bag-outline" size={24} color="#1A202C" />
              {totalItems > 0 && (
                <View
                  style={{
                    position: "absolute", top: -4, right: -6,
                    backgroundColor: "#FF6B35", borderRadius: 8,
                    minWidth: 16, height: 16, alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#1A202C" />
          </View>
        </View>

        <View className="px-4 pt-2 pb-4">
          <Text className="text-text-primary font-bold text-2xl">Bonjour 👋</Text>
          <Text className="text-text-secondary text-base">Quoi de bon aujourd'hui ?</Text>
        </View>

        {/* Categories */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <CategoryChip
              label={item}
              selected={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
            />
          )}
        />

        {/* Popular */}
        <View className="mt-4">
          <Text className="text-text-primary font-bold text-xl px-4 mb-3">Populaires près de vous</Text>
          {isLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16 }}>
              {[1, 2, 3].map((i) => <RestaurantCardSkeleton key={i} />)}
            </ScrollView>
          ) : (
            <FlatList
              data={popular.slice(0, 6)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 4 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <RestaurantCard restaurant={item} />}
              ListEmptyComponent={
                <Text className="text-text-secondary px-4">Aucun restaurant disponible</Text>
              }
            />
          )}
        </View>

        {/* Newest */}
        <View className="mt-6">
          <Text className="text-text-primary font-bold text-xl px-4 mb-3">Nouveaux sur MenuGo</Text>
          <FlatList
            data={newest}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 4 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RestaurantCard restaurant={item} />}
            ListEmptyComponent={
              isLoading ? null : <Text className="text-text-secondary px-4">Aucun restaurant</Text>
            }
          />
        </View>

        {/* Open now */}
        <View className="mt-6 mb-4">
          <Text className="text-text-primary font-bold text-xl px-4 mb-3">Ouvert maintenant</Text>
          <View className="px-4 gap-2">
            {isLoading
              ? [1, 2, 3].map((i) => (
                  <View key={i} className="bg-white rounded-2xl h-24" />
                ))
              : open.map((r: Restaurant) => <RestaurantCard key={r.id} restaurant={r} compact />)
            }
            {!isLoading && open.length === 0 && (
              <Text className="text-text-secondary text-center py-4">Aucun restaurant ouvert</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
