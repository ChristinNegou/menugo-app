import { create } from "zustand";
import { CartItem, MenuItem } from "@/types";

const TPS_RATE = 0.05;
const TVQ_RATE = 0.09975;

interface CartStore {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  addItem: (item: MenuItem, restaurantId: string, restaurantName: string) => "added" | "different_restaurant";
  confirmAddFromDifferentRestaurant: (item: MenuItem, restaurantId: string, restaurantName: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTPS: () => number;
  getTVQ: () => number;
  getTotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  restaurantId: null,
  restaurantName: null,
  items: [],

  addItem: (item, restaurantId, restaurantName) => {
    const { restaurantId: currentRestaurantId } = get();
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      return "different_restaurant";
    }
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
          restaurantId,
          restaurantName,
        };
      }
      return {
        items: [...state.items, { id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url }],
        restaurantId,
        restaurantName,
      };
    });
    return "added";
  },

  confirmAddFromDifferentRestaurant: (item, restaurantId, restaurantName) => {
    set({
      items: [{ id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url }],
      restaurantId,
      restaurantName,
    });
  },

  removeItem: (itemId) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),

  updateQuantity: (itemId, quantity) =>
    set((state) => ({
      items: quantity <= 0
        ? state.items.filter((i) => i.id !== itemId)
        : state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    })),

  clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

  getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  getTPS: () => get().getSubtotal() * TPS_RATE,
  getTVQ: () => get().getSubtotal() * TVQ_RATE,
  getTotal: () => get().getSubtotal() * (1 + TPS_RATE + TVQ_RATE),
  getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
