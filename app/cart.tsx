import { View, Text, FlatList, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useCartStore } from "@/stores/cartStore";
import { CartItemRow } from "@/components/CartItemRow";
import { EmptyState } from "@/components/EmptyState";

export default function CartScreen() {
  const router = useRouter();
  const { items, restaurantName, removeItem, updateQuantity, getSubtotal, getTPS, getTVQ, getTotal } = useCartStore();
  const [note, setNote] = useState("");

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-row items-center px-4 pt-4 pb-2 gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={26} color="#1A202C" />
          </TouchableOpacity>
          <Text className="text-text-primary font-bold text-xl">Mon panier</Text>
        </View>
        <EmptyState
          icon="bag-outline"
          title="Votre panier est vide"
          subtitle="Ajoutez des plats depuis un restaurant pour commencer"
        >
          <TouchableOpacity
            className="bg-primary rounded-2xl px-8 py-3.5"
            onPress={() => router.push("/(tabs)")}
          >
            <Text className="text-white font-bold text-base">Explorer les restaurants</Text>
          </TouchableOpacity>
        </EmptyState>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center px-4 pt-4 pb-2 gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={26} color="#1A202C" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-text-primary font-bold text-xl">Mon panier</Text>
          <Text className="text-text-secondary text-sm">{restaurantName}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
            onRemove={() => removeItem(item.id)}
          />
        )}
        ListFooterComponent={
          <View className="px-4 mt-4 gap-3">
            <View className="bg-white rounded-2xl px-4 py-3">
              <Text className="text-text-secondary text-sm font-semibold mb-2">Note pour le restaurant</Text>
              <TextInput
                className="text-text-primary text-base min-h-16"
                placeholder="Allergies, instructions spéciales..."
                placeholderTextColor="#A0AEC0"
                multiline
                value={note}
                onChangeText={setNote}
              />
            </View>

            <View className="bg-white rounded-2xl px-4 py-4 gap-2">
              <Text className="text-text-primary font-bold text-base mb-1">Résumé</Text>
              <View className="flex-row justify-between">
                <Text className="text-text-secondary text-base">Sous-total</Text>
                <Text className="text-text-primary font-semibold text-base">{getSubtotal().toFixed(2)} $</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-text-secondary text-base">TPS (5%)</Text>
                <Text className="text-text-primary font-semibold text-base">{getTPS().toFixed(2)} $</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-text-secondary text-base">TVQ (9.975%)</Text>
                <Text className="text-text-primary font-semibold text-base">{getTVQ().toFixed(2)} $</Text>
              </View>
              <View className="h-px bg-gray-100 my-1" />
              <View className="flex-row justify-between">
                <Text className="text-text-primary font-bold text-lg">Total</Text>
                <Text className="text-primary font-bold text-lg">{getTotal().toFixed(2)} $</Text>
              </View>
            </View>

            <View className="h-24" />
          </View>
        }
      />

      <View className="absolute bottom-6 left-4 right-4">
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/checkout", params: { note } })}
          className="bg-primary rounded-2xl py-4 flex-row items-center justify-between px-5 shadow-lg"
        >
          <Text className="text-white font-bold text-base">Passer la commande</Text>
          <Text className="text-white font-bold text-base">{getTotal().toFixed(2)} $</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
