import { createClient } from "@supabase/supabase-js";

// ─── Initialize Real Supabase Client ─────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function createMockSupabase(): any {
  const dummyBuilder: any = {
    select: () => dummyBuilder,
    insert: () => dummyBuilder,
    update: () => dummyBuilder,
    delete: () => dummyBuilder,
    eq: () => dummyBuilder,
    neq: () => dummyBuilder,
    order: () => dummyBuilder,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null }),
  };
  return {
    from: () => dummyBuilder,
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: { user: null }, error: new Error("Supabase is not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel Environment Variables.") }),
      signUp: async () => ({ data: { user: null }, error: new Error("Supabase is not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel Environment Variables.") }),
      signOut: async () => ({ error: null }),
      signInWithOAuth: async () => ({ data: null, error: new Error("Supabase is not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel Environment Variables.") }),
    }
  };
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : createMockSupabase();

// ─── Default Data for Seeding ────────────────────────────────────────────────
export const DEFAULT_SHOPS = [
  { id: "shop-1", seller_id: "seller-1", shop_name: "Rima's Bakery", slug: "rimas-bakery", category: "Food & Cake", city: "Dhaka", rating: 4.9, total_reviews: 352, plan: "premium", delivery_inside_city: 0, delivery_outside_city: 120, banner_url: "https://images.unsplash.com/photo-1530648672449-81f6c723e2f1?w=400&q=80", logo_url: "🍰", is_active: true, created_at: "2026-05-01" },
  { id: "shop-2", seller_id: "seller-2", shop_name: "Dhaka Fashion Hub", slug: "dhaka-fashion-hub", category: "Clothing", city: "Dhaka", rating: 4.7, total_reviews: 168, plan: "standard", delivery_inside_city: 60, delivery_outside_city: 120, banner_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80", logo_url: "✂️", is_active: true, created_at: "2026-04-12" },
  { id: "shop-3", seller_id: "seller-3", shop_name: "TechZone BD", slug: "techzone-bd", category: "Electronics", city: "Chittagong", rating: 4.8, total_reviews: 248, plan: "premium", delivery_inside_city: 0, delivery_outside_city: 120, banner_url: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80", logo_url: "⚡", is_active: true, created_at: "2026-03-20" },
  { id: "shop-4", seller_id: "seller-4", shop_name: "Glow Beauty", slug: "glow-beauty", category: "Beauty", city: "Sylhet", rating: 4.6, total_reviews: 92, plan: "standard", delivery_inside_city: 0, delivery_outside_city: 120, banner_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80", logo_url: "💄", is_active: true, created_at: "2026-06-02" },
  { id: "shop-5", seller_id: "seller-5", shop_name: "Home Nest BD", slug: "home-nest-bd", category: "Home & Living", city: "Dhaka", rating: 4.4, total_reviews: 62, plan: "basic", delivery_inside_city: 80, delivery_outside_city: 150, banner_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", logo_url: "🏠", is_active: true, created_at: "2026-06-15" },
  { id: "shop-6", seller_id: "seller-6", shop_name: "Pages & Co.", slug: "pages-and-co", category: "Books", city: "Khulna", rating: 4.3, total_reviews: 36, plan: "basic", delivery_inside_city: 50, delivery_outside_city: 100, banner_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80", logo_url: "📚", is_active: true, created_at: "2026-02-28" },
  { id: "shop-7", seller_id: "seller-7", shop_name: "Spice & Slice", slug: "spice-and-slice", category: "Food & Cake", city: "Chittagong", rating: 4.7, total_reviews: 138, plan: "standard", delivery_inside_city: 0, delivery_outside_city: 120, banner_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80", logo_url: "🍕", is_active: true, created_at: "2026-05-22" },
  { id: "shop-8", seller_id: "seller-8", shop_name: "Urban Threads", slug: "urban-threads", category: "Clothing", city: "Rajshahi", rating: 4.5, total_reviews: 86, plan: "basic", delivery_inside_city: 60, delivery_outside_city: 120, banner_url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80", logo_url: "👕", is_active: true, created_at: "2026-04-30" },
  { id: "shop-9", seller_id: "seller-9", shop_name: "GadgetVerse", slug: "gadgetverse", category: "Electronics", city: "Dhaka", rating: 4.9, total_reviews: 410, plan: "premium", delivery_inside_city: 0, delivery_outside_city: 120, banner_url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80", logo_url: "📱", is_active: true, created_at: "2026-01-15" },
  { id: "shop-10", seller_id: "seller-10", shop_name: "Skin Story", slug: "skin-story", category: "Beauty", city: "Rangpur", rating: 4.2, total_reviews: 44, plan: "basic", delivery_inside_city: 60, delivery_outside_city: 120, banner_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80", logo_url: "🧴", is_active: true, created_at: "2026-06-20" },
  { id: "shop-11", seller_id: "seller-11", shop_name: "Cake Theory", slug: "cake-theory", category: "Food & Cake", city: "Sylhet", rating: 4.8, total_reviews: 180, plan: "premium", delivery_inside_city: 0, delivery_outside_city: 120, banner_url: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&q=80", logo_url: "🎂", is_active: true, created_at: "2026-05-10" },
  { id: "shop-12", seller_id: "seller-12", shop_name: "Cozy Corner", slug: "cozy-corner", category: "Home & Living", city: "Dhaka", rating: 4.6, total_reviews: 78, plan: "standard", delivery_inside_city: 0, delivery_outside_city: 120, banner_url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80", logo_url: "🛋️", is_active: true, created_at: "2026-03-08" }
];

export const DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "Food & Cake", slug: "food-and-cake", image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&q=80" },
  { id: "cat-2", name: "Clothing", slug: "clothing", image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&q=80" },
  { id: "cat-3", name: "Electronics", slug: "electronics", image_url: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=100&q=80" },
  { id: "cat-4", name: "Beauty", slug: "beauty", image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=100&q=80" },
  { id: "cat-5", name: "Home & Living", slug: "home-and-living", image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80" },
  { id: "cat-6", name: "Books", slug: "books", image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=100&q=80" }
];

export const DEFAULT_PRODUCTS = [
  { id: "prod-1", shop_id: "shop-1", name: "Chocolate Truffle Cake", description: "Rich Belgian chocolate cake layers filled with chocolate ganache.", price: 1200, selling_price: 1200, cost_price: 700, stock: 15, category: "Food & Cake", is_available: true, image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80", created_at: "2026-07-01T00:00:00.000Z" },
  { id: "prod-2", shop_id: "shop-1", name: "Red Velvet Cupcake", description: "Fluffy cupcakes topped with velvety cream cheese frosting.", price: 150, selling_price: 150, cost_price: 60, stock: 40, category: "Food & Cake", is_available: true, image_url: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=300&q=80", created_at: "2026-07-02T00:00:00.000Z" },
  { id: "prod-3", shop_id: "shop-1", name: "Vanilla Slice (6pcs)", description: "Decadent slices of rich cream vanilla sponge cake.", price: 600, selling_price: 600, cost_price: 320, stock: 10, category: "Food & Cake", is_available: true, image_url: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300&q=80", created_at: "2026-07-03T00:00:00.000Z" },
  { id: "prod-4", shop_id: "shop-2", name: "Premium Panjabi Blue", description: "Stylish men's traditional premium embroidered Panjabi.", price: 2450, selling_price: 2450, cost_price: 1300, stock: 25, category: "Clothing", is_available: true, image_url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80", created_at: "2026-07-04T00:00:00.000Z" },
  { id: "prod-5", shop_id: "shop-11", name: "Black Forest Special Cake", description: "Traditional German chocolate cherry gateau cake.", price: 1350, selling_price: 1350, cost_price: 800, stock: 8, category: "Food & Cake", is_available: true, image_url: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=300&q=80", created_at: "2026-07-05T00:00:00.000Z" }
];

export const DEFAULT_ORDERS = [
  { id: "ord-1", shop_id: "shop-1", buyer_id: "buyer-1", customer_name: "Rahim Ali", customer_phone: "01711000001", customer_address: "House 12, Road 5, Dhanmondi", total_amount: 1350, delivery_charge: 120, status: "delivered", payment_method: "bkash", payment_status: "paid", created_at: "2026-07-05T10:30:00.000Z" },
  { id: "ord-2", shop_id: "shop-1", buyer_id: "buyer-2", customer_name: "Sadia Rahman", customer_phone: "01811000002", customer_address: "Block C, Bashundhara R/A", total_amount: 600, delivery_charge: 120, status: "pending", payment_method: "cod", payment_status: "unpaid", created_at: "2026-07-14T14:15:00.000Z" },
  { id: "ord-3", shop_id: "shop-2", buyer_id: "buyer-3", customer_name: "Kamal Hossain", customer_phone: "01911000003", customer_address: "Sector 4, Uttara", total_amount: 2570, delivery_charge: 120, status: "shipped", payment_method: "nagad", payment_status: "paid", created_at: "2026-07-12T09:45:00.000Z" },
  { id: "ord-4", shop_id: "shop-11", buyer_id: "buyer-4", customer_name: "Farhana Islam", customer_phone: "01722000004", customer_address: "Zindabazar, Sylhet", total_amount: 1470, delivery_charge: 120, status: "processing", payment_method: "bkash", payment_status: "paid", created_at: "2026-07-13T16:20:00.000Z" }
];

export const DEFAULT_BUYERS = [
  { id: "buyer-1", name: "Rahim Ali", phone: "01711000001", email: "rahim@example.com", city: "Dhaka", created_at: "2026-01-10" },
  { id: "buyer-2", name: "Sadia Rahman", phone: "01811000002", email: "sadia@example.com", city: "Dhaka", created_at: "2026-02-15" },
  { id: "buyer-3", name: "Kamal Hossain", phone: "01911000003", email: "kamal@example.com", city: "Dhaka", created_at: "2026-03-20" },
  { id: "buyer-4", name: "Farhana Islam", phone: "01722000004", email: "farhana@example.com", city: "Sylhet", created_at: "2026-04-25" }
];

export const DEFAULT_SELLERS = [
  { id: "seller-1", full_name: "Rima Akter", phone: "01733000001", email: "rima@bakery.com", created_at: "2026-05-01" },
  { id: "seller-2", full_name: "Tariqul Islam", phone: "01733000002", email: "tariqul@fashion.com", created_at: "2026-04-12" },
  { id: "seller-3", full_name: "Zahir Ahmed", phone: "01733000003", email: "zahir@techzone.com", created_at: "2026-03-20" },
  { id: "seller-11", full_name: "Nadia Zaman", phone: "01733000011", email: "nadia@caketheory.com", created_at: "2026-05-10" }
];

export const DEFAULT_SUBSCRIPTIONS = [
  { id: "sub-1", shop_id: "shop-1", package: "premium", amount_paid: 2000, payment_method: "bkash", expiry_date: "2026-08-01", status: "active", created_at: "2026-07-01" },
  { id: "sub-2", shop_id: "shop-2", package: "standard", amount_paid: 1000, payment_method: "nagad", expiry_date: "2026-08-12", status: "active", created_at: "2026-07-12" },
  { id: "sub-3", shop_id: "shop-3", package: "premium", amount_paid: 2000, payment_method: "bkash", expiry_date: "2026-08-20", status: "active", created_at: "2026-07-20" },
  { id: "sub-4", shop_id: "shop-11", package: "premium", amount_paid: 2000, payment_method: "bank", expiry_date: "2026-08-10", status: "active", created_at: "2026-07-10" }
];

export const DEFAULT_USER_ROLES = [
  { id: "seller-1", role: "seller" },
  { id: "seller-2", role: "seller" },
  { id: "seller-3", role: "seller" },
  { id: "seller-11", role: "seller" },
  { id: "buyer-1", role: "buyer" },
  { id: "admin-1", role: "admin" }
];

export const DEFAULT_PENDING_CONFIRMATIONS = [
  { id: "pend-1", shop_name: "Fresh Fruits BD", owner_name: "Abdul Karim", phone: "01799000001", email: "karim@fresh.com", package: "basic", transaction_id: "TRX998877", payment_method: "bkash", amount_paid: 500, seller_user_id: "seller-temp-1", is_approved: false, created_at: "2026-07-15T08:00:00.000Z" }
];

export const DEFAULT_PLATFORM_SETTINGS = [
  { id: "set-1", key: "price_basic", value: "500", label: "Basic Plan Price" },
  { id: "set-2", key: "price_standard", value: "1000", label: "Standard Plan Price" },
  { id: "set-3", key: "price_premium", value: "2000", label: "Premium Plan Price" },
  { id: "set-4", key: "commission_basic", value: "10", label: "Basic Plan Commission (%)" },
  { id: "set-5", key: "commission_standard", value: "5", label: "Standard Plan Commission (%)" },
  { id: "set-6", key: "commission_premium", value: "0", label: "Premium Plan Commission (%)" },
  { id: "set-7", key: "bkash_number", value: "01700000000", label: "bKash Payment Number" },
  { id: "set-8", key: "nagad_number", value: "01900000000", label: "Nagad Payment Number" },
  { id: "set-9", key: "site_name", value: "Nexora", label: "Platform Name" },
  { id: "set-10", key: "support_phone", value: "+880 1800 123 456", label: "Support Contact" }
];
