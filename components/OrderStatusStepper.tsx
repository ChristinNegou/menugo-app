import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@/types";

const STEPS: { key: Order["status"]; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "received", label: "Reçue", icon: "checkmark-circle-outline" },
  { key: "preparing", label: "En préparation", icon: "flame-outline" },
  { key: "ready", label: "Prête", icon: "bag-check-outline" },
  { key: "picked_up", label: "Récupérée", icon: "walk-outline" },
];

const STATUS_ORDER: Record<Order["status"], number> = {
  received: 0, preparing: 1, ready: 2, picked_up: 3, cancelled: -1,
};

interface Props {
  status: Order["status"];
}

export function OrderStatusStepper({ status }: Props) {
  const currentIndex = STATUS_ORDER[status];

  return (
    <View className="flex-row items-center justify-between px-2">
      {STEPS.map((step, index) => {
        const isDone = currentIndex >= index;
        const isCurrent = currentIndex === index;

        return (
          <View key={step.key} className="flex-1 items-center">
            <View className="flex-row items-center w-full">
              {index > 0 && (
                <View className={`flex-1 h-1 ${isDone ? "bg-primary" : "bg-gray-200"}`} />
              )}
              <View className={`w-10 h-10 rounded-full items-center justify-center ${isDone ? "bg-primary" : "bg-gray-200"} ${isCurrent ? "ring-2 ring-primary" : ""}`}>
                <Ionicons name={step.icon} size={20} color={isDone ? "white" : "#A0AEC0"} />
              </View>
              {index < STEPS.length - 1 && (
                <View className={`flex-1 h-1 ${currentIndex > index ? "bg-primary" : "bg-gray-200"}`} />
              )}
            </View>
            <Text className={`text-xs mt-1 text-center ${isDone ? "text-primary font-semibold" : "text-text-secondary"}`}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
