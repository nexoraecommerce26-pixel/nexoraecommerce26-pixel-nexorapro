// src/lib/types.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Shop {
  id: string;
  seller_id: string;
  shop_name: string;
  category: string | null;       // legacy free-text field
  category_id: string | null;    // new FK to categories
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  city: string | null;
  plan: string | null;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  total_reviews: number;
  delivery_inside_city: number;
  delivery_outside_city: number;
  theme_id: string | null;
  created_at: string;
}

export interface ShopWithFeaturedFlag extends Shop {
  auto_qualifies: boolean;
}

export interface Seller {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Buyer {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  city: string | null;
  created_at: string;
  last_active: string;
}

export interface BuyerOrderStats extends Buyer {
  buyer_id: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
}

export interface BuyerInterest {
  buyer_id: string;
  event_type: "category_click" | "shop_visit" | "product_view" | "search_query";
  event_value: string;
  hits: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  shop_id: string;
  buyer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  total_amount: number;
  delivery_charge: number;
  status: string;
  payment_method: string | null;
  payment_status: string | null;
  created_at: string;
}