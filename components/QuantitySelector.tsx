import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  minQuantity?: number;
}

export function QuantitySelector({ quantity, onIncrease, onDecrease, minQuantity = 0 }: Props) {
  return (
    <View className="flex-row items-center gap-3">
      <TouchableOpacity
        onPress={onDecrease}
        disabled={quantity <= minQuantity}
        className={`w-9 h-9 rounded-full items-center justify-center ${quantity <= minQuantity ? "bg-gray-100" : "bg-primary"}`}
      >
        <Ionicons name="remove" size={18} color={quantity <= minQuantity ? "#718096" : "white"} />
      </TouchableOpacity>
      <Text className="text-text-primary font-bold text-lg w-6 text-center">{quantity}</Text>
      <TouchableOpacity
        onPress={onIncrease}
        className="w-9 h-9 rounded-full bg-primary items-center justify-center"
      >
        <Ionicons name="add" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );
}
