import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export function RatingStars({ rating, reviewCount, size = 14 }: Props) {
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="star" size={size} color="#F59E0B" />
      <Text className="text-text-primary font-semibold text-sm">{rating.toFixed(1)}</Text>
      {reviewCount !== undefined && (
        <Text className="text-text-secondary text-sm">({reviewCount})</Text>
      )}
    </View>
  );
}
