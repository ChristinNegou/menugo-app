import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/stores/authStore";
import { EmptyState } from "@/components/EmptyState";
import { Order } from "@/types";

const STATUS_LABELS: Record<Order["status"], string> = {
  received: "Reçue",
  preparing: "En préparation",
  ready: "Prête à récupérer",
  picked_up: "Terminée",
  cancelled: "Annulée",
};

const STATUS_COLORS: Record<Order["status"], string> = {
  received: "#F59E0B",
  preparing: "#FF6B35",
  ready: "#38A169",
  picked_up: "#718096",
  cancelled: "#E53E3E",
};

const ACTIVE_STATUSES: Order["status"][] = ["received", "preparing", "ready"];

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const isActive = ACTIVE_STATUSES.includes(order.status);
  const statusColor = STATUS_COLORS[order.status];

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      activeOpacity={0.85}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-text-primary font-bold text-base" numberOfLines={1}>
            {order.restaurant?.name ?? "Restaurant"}
          </Text>
          <Text className="text-text-secondary text-sm mt-0.5">
            {new Date(order.created_at).toLocaleDateString("fr-CA", {
              day: "numeric", month: "long", year: "numeric",
            })}
            {" · "}{order.items.length} article{order.items.length > 1 ? "s" : ""}
          </Text>
        </View>
        <Text className="text-text-primary font-bold text-base">{order.total.toFixed(2)} $</Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor }} />
          <Text style={{ color: statusColor }} className="text-sm font-semibold">
            {STATUS_LABELS[order.status]}
          </Text>
        </View>
        {isActive ? (
          <Text className="text-primary text-sm font-semibold">Suivre →</Text>
        ) : order.status === "picked_up" ? (
          <Text className="text-primary text-sm font-semibold">Recommander</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const { user, isGuest } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const { data: orders, isLoading, refetch } = useOrders();

  if (!user && !isGuest) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="px-4 pt-6 pb-4">
          <Text className="text-text-primary font-bold text-2xl">Mes commandes</Text>
        </View>
        <EmptyState
          icon="bag-outline"
          title="Suivez vos commandes"
          subtitle="Connectez-vous pour accéder à l'historique de vos commandes"
        >
          <TouchableOpacity
            className="bg-primary rounded-2xl px-8 py-3.5"
            onPress={() => router.push("/(auth)/login")}
          >
            <Text className="text-white font-bold text-base">Se connecter</Text>
          </TouchableOpacity>
        </EmptyState>
      </SafeAreaView>
    );
  }

  const active = orders?.filter((o) => ACTIVE_STATUSES.includes(o.status)) ?? [];
  const history = orders?.filter((o) => !ACTIVE_STATUSES.includes(o.status)) ?? [];
  const displayed = activeTab === "active" ? active : history;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="px-4 pt-6 pb-4">
        <Text className="text-text-primary font-bold text-2xl">Mes commandes</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-4 bg-gray-100 rounded-xl p-1 mb-4">
        {([["active", "En cours"], ["history", "Historique"]] as const).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === key ? "bg-white shadow-sm" : ""}`}
            onPress={() => setActiveTab(key)}
          >
            <Text className={`font-semibold text-sm ${activeTab === key ? "text-text-primary" : "text-text-secondary"}`}>
              {label}
              {key === "active" && active.length > 0 ? ` (${active.length})` : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => router.push(`/order-confirmation?orderId=${item.id}`)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={activeTab === "active" ? "time-outline" : "receipt-outline"}
              title={activeTab === "active" ? "Aucune commande en cours" : "Aucun historique"}
              subtitle={activeTab === "active" ? "Vos commandes actives apparaîtront ici" : "Vos commandes passées apparaîtront ici"}
            >
              <TouchableOpacity
                className="bg-primary rounded-2xl px-8 py-3.5"
                onPress={() => router.push("/(tabs)")}
              >
                <Text className="text-white font-bold text-base">Explorer les restaurants</Text>
              </TouchableOpacity>
            </EmptyState>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
