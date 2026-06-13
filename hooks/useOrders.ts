import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types";
import { useAuthStore } from "@/stores/authStore";

export function useOrders() {
  const user = useAuthStore((s) => s.user);
  return useQuery<Order[]>({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*, restaurant:restaurants(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (orderData: {
      restaurant_id: string;
      items: object;
      subtotal: number;
      tps: number;
      tvq: number;
      total: number;
      notes?: string;
    }) => {
      const orderNumber = `#${Math.floor(100000 + Math.random() * 900000)}`;
      const { data, error } = await supabase
        .from("orders")
        .insert({
          ...orderData,
          user_id: user?.id ?? null,
          order_number: orderNumber,
          status: "received",
          pickup_time: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order["status"] }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
