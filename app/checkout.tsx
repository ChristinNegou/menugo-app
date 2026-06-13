import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useCartStore } from "@/stores/cartStore";
import { useCreateOrder } from "@/hooks/useOrders";
import { useAuthStore } from "@/stores/authStore";

type PickupTime = "asap" | "custom";
type PaymentMethod = "cash" | "demo_card";

export default function CheckoutScreen() {
  const router = useRouter();
  const { note } = useLocalSearchParams<{ note?: string }>();
  const { user } = useAuthStore();
  const { items, restaurantId, restaurantName, getSubtotal, getTPS, getTVQ, getTotal, clearCart } = useCartStore();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();
  const [pickupTime, setPickupTime] = useState<PickupTime>("asap");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const handleConfirm = async () => {
    if (!restaurantId) return;
    try {
      const order = await createOrder({
        restaurant_id: restaurantId,
        items: items,
        subtotal: getSubtotal(),
        tps: getTPS(),
        tvq: getTVQ(),
        total: getTotal(),
        notes: note || undefined,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();
      router.replace({ pathname: "/order-confirmation", params: { orderId: order.id, orderNumber: order.order_number } });
    } catch {
      Alert.alert("Erreur", "Impossible de passer la commande. Veuillez réessayer.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center px-4 pt-4 pb-3 gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text className="text-text-primary font-bold text-xl">Confirmer la commande</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Restaurant */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-2">Restaurant</Text>
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center">
              <Ionicons name="restaurant" size={20} color="#FF6B35" />
            </View>
            <View>
              <Text className="text-text-primary font-bold text-base">{restaurantName}</Text>
              <Text className="text-text-secondary text-sm">Commande à emporter</Text>
            </View>
          </View>
        </View>

        {/* Pickup time */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-3">Heure de récupération</Text>
          {([["asap", "Dès que possible (~20 min)"], ["custom", "Choisir une heure"]] as [PickupTime, string][]).map(([val, label]) => (
            <TouchableOpacity
              key={val}
              onPress={() => setPickupTime(val)}
              className="flex-row items-center gap-3 py-2.5"
            >
              <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${pickupTime === val ? "border-primary" : "border-gray-300"}`}>
                {pickupTime === val && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </View>
              <Text className="text-text-primary text-base">{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-3">Méthode de paiement</Text>
          {([["cash", "Payer à la caisse", "cash-outline"], ["demo_card", "Carte de crédit (démo)", "card-outline"]] as [PaymentMethod, string, string][]).map(([val, label, icon]) => (
            <TouchableOpacity
              key={val}
              onPress={() => setPaymentMethod(val)}
              className="flex-row items-center gap-3 py-2.5"
            >
              <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${paymentMethod === val ? "border-primary" : "border-gray-300"}`}>
                {paymentMethod === val && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </View>
              <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color="#718096" />
              <Text className="text-text-primary text-base">{label}</Text>
            </TouchableOpacity>
          ))}
          {paymentMethod === "demo_card" && (
            <View className="bg-orange-50 rounded-xl p-3 mt-3">
              <Text className="text-primary text-sm text-center">
                Mode démo — aucun paiement réel effectué
              </Text>
            </View>
          )}
        </View>

        {/* Order summary */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-3">Récapitulatif</Text>
          {items.map((item) => (
            <View key={item.id} className="flex-row justify-between py-1.5">
              <Text className="text-text-primary text-base flex-1" numberOfLines={1}>
                {item.quantity}× {item.name}
              </Text>
              <Text className="text-text-primary font-semibold text-base">
                {(item.price * item.quantity).toFixed(2)} $
              </Text>
            </View>
          ))}
          <View className="h-px bg-gray-100 my-3" />
          <View className="flex-row justify-between">
            <Text className="text-text-primary font-bold text-lg">Total</Text>
            <Text className="text-primary font-bold text-lg">{getTotal().toFixed(2)} $</Text>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      <View className="absolute bottom-6 left-4 right-4">
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isPending}
          className={`bg-primary rounded-2xl py-4 items-center shadow-lg ${isPending ? "opacity-70" : ""}`}
        >
          <Text className="text-white font-bold text-base">
            {isPending ? "Envoi en cours..." : `Confirmer la commande — ${getTotal().toFixed(2)} $`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
