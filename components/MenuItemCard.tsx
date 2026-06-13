import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MenuItem } from "@/types";

interface Props {
  item: MenuItem;
  onPress: (item: MenuItem) => void;
  onAdd: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onPress, onAdd }: Props) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 bg-white border-b border-gray-50"
      onPress={() => onPress(item)}
      activeOpacity={0.85}
    >
      <View className="flex-1 pr-3">
        <View className="flex-row items-center gap-1.5 mb-0.5">
          {item.is_popular && (
            <View className="bg-orange-100 rounded px-1.5 py-0.5">
              <Text className="text-primary text-xs font-semibold">Populaire</Text>
            </View>
          )}
          {item.is_vegetarian && (
            <View className="bg-green-100 rounded px-1.5 py-0.5">
              <Text className="text-success text-xs font-semibold">Végé</Text>
            </View>
          )}
          {item.is_gluten_free && (
            <View className="bg-blue-100 rounded px-1.5 py-0.5">
              <Text className="text-blue-600 text-xs font-semibold">Sans gluten</Text>
            </View>
          )}
        </View>
        <Text className="text-text-primary font-semibold text-base" numberOfLines={1}>
          {item.name}
        </Text>
        {item.description && (
          <Text className="text-text-secondary text-sm mt-0.5" numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text className="text-primary font-bold text-base mt-1">
          {item.price.toFixed(2)} $
        </Text>
      </View>

      <View className="relative">
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} className="w-20 h-20 rounded-xl" resizeMode="cover" />
        ) : (
          <View className="w-20 h-20 rounded-xl bg-gray-100 items-center justify-center">
            <Ionicons name="restaurant-outline" size={28} color="#CBD5E0" />
          </View>
        )}
        <TouchableOpacity
          onPress={() => onAdd(item)}
          className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full items-center justify-center shadow-sm"
        >
          <Ionicons name="add" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
