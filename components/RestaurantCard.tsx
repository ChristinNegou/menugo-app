import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Restaurant } from "@/types";
import { RatingStars } from "./RatingStars";

const COVER_PLACEHOLDERS: Record<string, string> = {
  Poutine: "https://images.unsplash.com/photo-1596649299486-4cdea56fd59d?w=400",
  Sushi: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
  Burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
  Pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  Mexicain: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
  Déjeuner: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400",
  Végétarien: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
  Poulet: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400",
};

function getCoverImage(restaurant: Restaurant): string {
  if (restaurant.cover_image_url) return restaurant.cover_image_url;
  const cat = restaurant.category?.[0];
  return COVER_PLACEHOLDERS[cat] ?? "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400";
}

interface Props {
  restaurant: Restaurant;
  compact?: boolean;
}

export function RestaurantCard({ restaurant, compact = false }: Props) {
  const router = useRouter();

  if (compact) {
    return (
      <TouchableOpacity
        className="flex-row bg-white rounded-2xl overflow-hidden mb-3 shadow-sm"
        onPress={() => router.push(`/restaurant/${restaurant.id}`)}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: getCoverImage(restaurant) }}
          className="w-24 h-24"
          resizeMode="cover"
        />
        <View className="flex-1 p-3 justify-between">
          <View>
            <Text className="text-text-primary font-bold text-base" numberOfLines={1}>
              {restaurant.name}
            </Text>
            <Text className="text-text-secondary text-xs mt-0.5" numberOfLines={1}>
              {restaurant.category?.join(" · ")}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <RatingStars rating={restaurant.rating} reviewCount={restaurant.review_count} />
            <Text className="text-text-secondary text-xs">{restaurant.prep_time_min} min</Text>
          </View>
        </View>
        {!restaurant.is_open && (
          <View className="absolute top-2 left-2 bg-red-500 rounded px-2 py-0.5">
            <Text className="text-white text-xs font-semibold">Fermé</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden mr-4 w-56 shadow-sm"
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      activeOpacity={0.85}
    >
      <View className="relative">
        <Image
          source={{ uri: getCoverImage(restaurant) }}
          className="w-full h-36"
          resizeMode="cover"
        />
        <View className={`absolute top-2 left-2 rounded px-2 py-0.5 ${restaurant.is_open ? "bg-success" : "bg-red-500"}`}>
          <Text className="text-white text-xs font-semibold">{restaurant.is_open ? "Ouvert" : "Fermé"}</Text>
        </View>
      </View>
      <View className="p-3">
        <Text className="text-text-primary font-bold text-base" numberOfLines={1}>{restaurant.name}</Text>
        <Text className="text-text-secondary text-xs mt-0.5" numberOfLines={1}>
          {restaurant.category?.join(" · ")}
        </Text>
        <View className="flex-row items-center justify-between mt-2">
          <RatingStars rating={restaurant.rating} reviewCount={restaurant.review_count} />
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={12} color="#718096" />
            <Text className="text-text-secondary text-xs">{restaurant.prep_time_min} min</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
