import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useRef } from "react";
import { Animated } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { OrderStatusStepper } from "@/components/OrderStatusStepper";
import { Order } from "@/types";

const STATUS_SEQUENCE: Order["status"][] = ["received", "preparing", "ready", "picked_up"];

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { orderId, orderNumber } = useLocalSearchParams<{ orderId?: string; orderNumber?: string }>();
  const { data: orders } = useOrders();
  const { mutate: updateStatus } = useUpdateOrderStatus();

  const order = orders?.find((o) => o.id === orderId);
  const [simulatedStatus, setSimulatedStatus] = useState<Order["status"]>("received");

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!orderId) return;
    const simulate = () => {
      setSimulatedStatus((prev) => {
        const currentIdx = STATUS_SEQUENCE.indexOf(prev);
        if (currentIdx < STATUS_SEQUENCE.length - 1) {
          const next = STATUS_SEQUENCE[currentIdx + 1];
          updateStatus({ id: orderId, status: next });
          return next;
        }
        return prev;
      });
    };
    const interval = setInterval(simulate, 12000);
    return () => clearInterval(interval);
  }, [orderId]);

  const displayStatus = order?.status ?? simulatedStatus;
  const displayOrderNumber = order?.order_number ?? orderNumber ?? "#------";

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 py-8">
          {/* Success animation */}
          <View className="items-center mb-8">
            <Animated.View
              style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}
              className="w-28 h-28 bg-success/10 rounded-full items-center justify-center mb-4"
            >
              <View className="w-20 h-20 bg-success rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={44} color="white" />
              </View>
            </Animated.View>
            <Animated.View style={{ opacity: opacityAnim }}>
              <Text className="text-text-primary font-bold text-2xl text-center">Commande confirmée !</Text>
              <Text className="text-text-secondary text-base text-center mt-2">
                Votre commande a été reçue avec succès
              </Text>
            </Animated.View>
          </View>

          {/* Order info */}
          <View className="bg-white rounded-2xl p-4 mb-4 gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-text-secondary text-sm">Numéro de commande</Text>
              <Text className="text-primary font-bold text-base">{displayOrderNumber}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-text-secondary text-sm">Temps estimé</Text>
              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={16} color="#38A169" />
                <Text className="text-success font-semibold text-sm">Environ 20 minutes</Text>
              </View>
            </View>
            {order?.restaurant && (
              <View className="flex-row justify-between items-center">
                <Text className="text-text-secondary text-sm">Restaurant</Text>
                <Text className="text-text-primary font-semibold text-sm" numberOfLines={1}>
                  {order.restaurant.name}
                </Text>
              </View>
            )}
          </View>

          {/* Status stepper */}
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-text-primary font-bold text-base mb-4">Suivi de commande</Text>
            <OrderStatusStepper status={displayStatus} />
          </View>

          {/* Demo notice */}
          <View className="bg-orange-50 border border-orange-200 rounded-2xl p-3 mb-6">
            <Text className="text-primary text-sm text-center">
              Mode démo — le statut avance automatiquement toutes les 12 secondes
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-8 gap-3">
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/orders")}
          className="border border-primary rounded-2xl py-3.5 items-center"
        >
          <Text className="text-primary font-bold text-base">Suivre mes commandes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          className="bg-primary rounded-2xl py-3.5 items-center"
        >
          <Text className="text-white font-bold text-base">Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
