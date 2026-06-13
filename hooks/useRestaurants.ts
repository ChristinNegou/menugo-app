import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Restaurant, MenuCategory, MenuItem } from "@/types";

export function useRestaurants(category?: string) {
  return useQuery<Restaurant[]>({
    queryKey: ["restaurants", category],
    queryFn: async () => {
      let query = supabase
        .from("restaurants")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });

      if (category && category !== "Tout") {
        query = query.contains("category", [category]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRestaurantSearch(term: string) {
  return useQuery<Restaurant[]>({
    queryKey: ["restaurants", "search", term],
    queryFn: async () => {
      if (!term.trim()) return [];
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("is_active", true)
        .or(`name.ilike.%${term}%,description.ilike.%${term}%`);
      if (error) throw error;
      return data ?? [];
    },
    enabled: term.length > 1,
  });
}

export function useRestaurant(id: string) {
  return useQuery<Restaurant>({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useMenuCategories(restaurantId: string) {
  return useQuery<MenuCategory[]>({
    queryKey: ["menu_categories", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!restaurantId,
  });
}

export function useMenuItems(restaurantId: string) {
  return useQuery<MenuItem[]>({
    queryKey: ["menu_items", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("is_available", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!restaurantId,
  });
}
