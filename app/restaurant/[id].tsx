import {
  View, Text, Image, ScrollView, TouchableOpacity,
  Modal, Alert, Dimensions, FlatList
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useRestaurant, useMenuCategories, useMenuItems } from "@/hooks/useRestaurants";
import { RatingStars } from "@/components/RatingStars";
import { MenuItemCard } from "@/components/MenuItemCard";
import { QuantitySelector } from "@/components/QuantitySelector";
import { MenuItemSkeleton } from "@/components/LoadingSkeleton";
import { useCartStore } from "@/stores/cartStore";
import { MenuItem } from "@/types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const COVER_PLACEHOLDERS: Record<string, string> = {
  Poutine: "https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?w=600",
  Sushi: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600",
  Burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
  Pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
  Mexicain: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600",
  Déjeuner: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600",
  Végétarien: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
  Poulet: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600",
};

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: restaurant } = useRestaurant(id);
  const { data: categories } = useMenuCategories(id);
  const { data: allItems, isLoading } = useMenuItems(id);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);

  const { addItem, confirmAddFromDifferentRestaurant, restaurantName: cartRestaurantName, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  const coverUrl = restaurant?.cover_image_url
    ?? COVER_PLACEHOLDERS[restaurant?.category?.[0] ?? ""]
    ?? "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600";

  const displayedItems = useMemo(() => {
    if (!allItems) return [];
    if (!selectedCategory) return allItems;
    const cat = categories?.find((c) => c.name === selectedCategory);
    return allItems.filter((i) => i.category_id === cat?.id);
  }, [allItems, selectedCategory, categories]);

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
    const result = addItem(item, restaurant.id, restaurant.name);
    if (result === "different_restaurant") {
      Alert.alert(
        "Nouveau panier",
        `Votre panier contient des items de ${cartRestaurantName}. Voulez-vous vider le panier et commander de ${restaurant.name} ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Vider et ajouter",
            style: "destructive",
            onPress: () => {
              confirmAddFromDifferentRestaurant(item, restaurant.id, restaurant.name);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const openItemSheet = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQuantity(1);
  };

  const addFromSheet = () => {
    if (!selectedItem || !restaurant) return;
    for (let i = 0; i < itemQuantity; i++) {
      if (i === 0) {
        const result = addItem(selectedItem, restaurant.id, restaurant.name);
        if (result === "different_restaurant") {
          Alert.alert("Nouveau panier", `Voulez-vous vider le panier et commander de ${restaurant.name} ?`, [
            { text: "Annuler", style: "cancel" },
            {
              text: "Vider et ajouter",
              style: "destructive",
              onPress: () => {
                confirmAddFromDifferentRestaurant(selectedItem, restaurant.id, restaurant.name);
                setSelectedItem(null);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              },
            },
          ]);
          return;
        }
      } else {
        addItem(selectedItem, restaurant.id, restaurant.name);
      }
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedItem(null);
  };

  if (!restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <Text className="text-text-secondary">Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
        {/* Cover */}
        <View className="relative">
          <Image source={{ uri: coverUrl }} style={{ width: "100%", height: 220 }} resizeMode="cover" />
          <SafeAreaView className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 pt-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow"
            >
              <Ionicons name="arrow-back" size={20} color="#1A202C" />
            </TouchableOpacity>
            <View className="flex-row gap-2">
              <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow">
                <Ionicons name="heart-outline" size={20} color="#1A202C" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          <View className={`absolute bottom-3 left-4 rounded-full px-3 py-1 ${restaurant.is_open ? "bg-success" : "bg-red-500"}`}>
            <Text className="text-white text-xs font-bold">{restaurant.is_open ? "Ouvert" : "Fermé"}</Text>
          </View>
        </View>

        {/* Info */}
        <View className="bg-white px-4 py-4">
          <Text className="text-text-primary font-bold text-2xl">{restaurant.name}</Text>
          <Text className="text-text-secondary text-sm mt-1">{restaurant.category?.join(" · ")}</Text>
          <View className="flex-row items-center gap-4 mt-3">
            <RatingStars rating={restaurant.rating} reviewCount={restaurant.review_count} />
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={14} color="#718096" />
              <Text className="text-text-secondary text-sm">{restaurant.prep_time_min} min</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="location-outline" size={14} color="#718096" />
              <Text className="text-text-secondary text-sm">{restaurant.city}</Text>
            </View>
          </View>
          {restaurant.description && (
            <Text className="text-text-secondary text-sm mt-3 leading-relaxed">{restaurant.description}</Text>
          )}
        </View>

        {/* Category tabs */}
        {categories && categories.length > 0 && (
          <View className="bg-white border-t border-gray-50">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                className={`px-4 py-1.5 rounded-full ${!selectedCategory ? "bg-primary" : "bg-gray-100"}`}
              >
                <Text className={`text-sm font-semibold ${!selectedCategory ? "text-white" : "text-text-secondary"}`}>
                  Tout
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-1.5 rounded-full ${selectedCategory === cat.name ? "bg-primary" : "bg-gray-100"}`}
                >
                  <Text className={`text-sm font-semibold ${selectedCategory === cat.name ? "text-white" : "text-text-secondary"}`}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Menu items */}
        <View className="bg-white mt-2">
          {isLoading
            ? [1, 2, 3, 4].map((i) => <MenuItemSkeleton key={i} />)
            : displayedItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onPress={openItemSheet}
                  onAdd={handleAddToCart}
                />
              ))
          }
          <View className="h-24" />
        </View>
      </ScrollView>

      {/* Cart button */}
      {totalItems > 0 && (
        <View className="absolute bottom-6 left-4 right-4">
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            className="bg-primary rounded-2xl py-4 flex-row items-center justify-between px-5 shadow-lg"
          >
            <View className="bg-white/20 rounded-lg w-7 h-7 items-center justify-center">
              <Text className="text-white font-bold">{totalItems}</Text>
            </View>
            <Text className="text-white font-bold text-base">Voir le panier</Text>
            <Text className="text-white font-bold">{useCartStore.getState().getTotal().toFixed(2)} $</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Item bottom sheet */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setSelectedItem(null)}
        />
        {selectedItem && (
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: SCREEN_HEIGHT * 0.75 }}>
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mt-3 mb-2" />
            <ScrollView>
              {selectedItem.image_url ? (
                <Image source={{ uri: selectedItem.image_url }} style={{ width: "100%", height: 200 }} resizeMode="cover" />
              ) : (
                <View className="w-full h-48 bg-gray-100 items-center justify-center">
                  <Ionicons name="restaurant-outline" size={48} color="#CBD5E0" />
                </View>
              )}
              <View className="px-4 py-4">
                <View className="flex-row gap-1.5 mb-2">
                  {selectedItem.is_popular && (
                    <View className="bg-orange-100 rounded px-2 py-0.5">
                      <Text className="text-primary text-xs font-semibold">Populaire</Text>
                    </View>
                  )}
                  {selectedItem.is_vegetarian && (
                    <View className="bg-green-100 rounded px-2 py-0.5">
                      <Text className="text-success text-xs font-semibold">Végé</Text>
                    </View>
                  )}
                </View>
                <Text className="text-text-primary font-bold text-xl">{selectedItem.name}</Text>
                {selectedItem.description && (
                  <Text className="text-text-secondary text-base mt-2 leading-relaxed">{selectedItem.description}</Text>
                )}
                <Text className="text-primary font-bold text-xl mt-3">{selectedItem.price.toFixed(2)} $</Text>
              </View>
            </ScrollView>
            <View className="flex-row items-center justify-between px-4 py-4 border-t border-gray-100">
              <QuantitySelector
                quantity={itemQuantity}
                onIncrease={() => setItemQuantity((q) => q + 1)}
                onDecrease={() => setItemQuantity((q) => Math.max(1, q - 1))}
                minQuantity={1}
              />
              <TouchableOpacity
                onPress={addFromSheet}
                className="bg-primary rounded-2xl py-3 px-6 flex-1 ml-4 items-center"
              >
                <Text className="text-white font-bold text-base">
                  Ajouter — {(selectedItem.price * itemQuantity).toFixed(2)} $
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}
