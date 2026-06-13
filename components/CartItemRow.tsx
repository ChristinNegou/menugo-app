import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CartItem } from "@/types";
import { QuantitySelector } from "./QuantitySelector";

interface Props {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export function CartItemRow({ item, onIncrease, onDecrease, onRemove }: Props) {
  return (
    <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-50">
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} className="w-16 h-16 rounded-xl" resizeMode="cover" />
      ) : (
        <View className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center">
          <Ionicons name="restaurant-outline" size={22} color="#CBD5E0" />
        </View>
      )}
      <View className="flex-1 px-3">
        <Text className="text-text-primary font-semibold text-base" numberOfLines={1}>{item.name}</Text>
        <Text className="text-primary font-bold text-base mt-0.5">{item.price.toFixed(2)} $</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <QuantitySelector quantity={item.quantity} onIncrease={onIncrease} onDecrease={onDecrease} minQuantity={0} />
        <TouchableOpacity onPress={onRemove} className="ml-1">
          <Ionicons name="trash-outline" size={20} color="#E53E3E" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
