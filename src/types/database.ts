// Custom types for the Luminate Creators app

export type AppRole = "admin" | "staff" | "user";
export type ProductTier = "basic" | "premium" | "diamond";
export type ContentType = "youtube" | "tiktok" | "podcast" | "live_streaming" | "photography" | "general";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type ConsultationStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type ConsultationType = "equipment_selection" | "setup_support" | "content_strategy" | "complete_package";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface DeliveryAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  total_naira: number;
  total_coins: number;
  payment_method: "paystack";
  coins_used: number;
  naira_paid: number;
  paystack_reference: string | null;
  delivery_address_id: string | null;
  tracking_id: string | null;
  tracking_history: { date: string; status: string; message: string }[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price_naira: number;
  price_coins: number;
  tier: ProductTier;
  content_types: ContentType[];
  image_url: string | null;
  image_urls: string[];
  specifications: Record<string, unknown>;
  in_stock: boolean;
  is_package: boolean;
  package_items: string[];
  original_price_naira: number | null;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price_naira: number;
  price_coins: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Consultation {
  id: string;
  user_id: string;
  consultation_type: ConsultationType;
  status: ConsultationStatus;
  scheduled_date: string;
  scheduled_time: string;
  coins_paid: number;
  notes: string | null;
  pre_consultation_form: Record<string, unknown>;
  meeting_link: string | null;
  created_at: string;
  updated_at: string;
}
