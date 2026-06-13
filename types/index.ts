export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string[];
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  rating: number;
  review_count: number;
  prep_time_min: number;
  price_range: number;
  is_open: boolean;
  opening_hours: Record<string, { open: string; close: string }> | null;
  is_active: boolean;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_popular: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_available: boolean;
  sort_order: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  restaurant_id: string | null;
  status: "received" | "preparing" | "ready" | "picked_up" | "cancelled";
  items: CartItem[];
  subtotal: number;
  tps: number;
  tvq: number;
  total: number;
  pickup_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
}

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}
