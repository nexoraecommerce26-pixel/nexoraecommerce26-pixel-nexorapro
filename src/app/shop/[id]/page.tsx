"use client";

import { useState } from "react";

// ─── Mock shop data (would come from Supabase via [id] param) ─────────────────
const shop = {
  name: "Rima's Bakery",
  category: "Food & Cake",
  city: "Dhaka", // seller's shop city — used to auto-detect inside/outside delivery zone
  rating: 4.9,
  reviews: 312,
  freeDelivery: true,
  banner: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80",
  logo: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=200&q=80",
  bkash: "01712-345678",
  nagad: "01812-345678",
};

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  img: string;
};

const products: Product[] = [
  { id: 1, name: "Chocolate Truffle Cake", price: 850, category: "Cakes", inStock: true, img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80" },
  { id: 2, name: "Red Velvet Cupcakes (6pc)", price: 420, category: "Cupcakes", inStock: true, img: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=300&q=80" },
  { id: 3, name: "Birthday Cake Custom", price: 1200, category: "Cakes", inStock: true, img: "https://images.unsplash.com/photo-1530648672449-81f6c723e2f1?w=300&q=80" },
  { id: 4, name: "Vanilla Sponge Slice", price: 150, category: "Slices", inStock: false, img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&q=80" },
  { id: 5, name: "Black Forest Cake", price: 950, category: "Cakes", inStock: true, img: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=300&q=80" },
  { id: 6, name: "Cookie Box (12pc)", price: 380, category: "Cookies", inStock: true, img: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&q=80" },
  { id: 7, name: "Cheesecake Slice", price: 220, category: "Slices", inStock: true, img: "https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=300&q=80" },
  { id: 8, name: "Macaron Set (8pc)", price: 540, category: "Cookies", inStock: false, img: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=300&q=80" },
];

const categories = ["All", "Cakes", "Cupcakes", "Slices", "Cookies"];

type CartItem = { product: Product; qty: number };

// ─── Star rating ─────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-warning text-sm">
      {"★".repeat(Math.round(rating))}
      <span className="text-ngray-light">{"★".repeat(5 - Math.round(rating))}</span>
    </span>
  );
}

// ─── Shop Header ───────────────────────────────────────────────────────────────
function ShopHeader({ following, setFollowing }: { following: boolean; setFollowing: (v: boolean) => void }) {
  return (
    <header className="bg-white border-b border-ngray-light">
      {/* Banner */}
      <div className="h-52 relative overflow-hidden">
        <img src={shop.banner} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-end gap-5 -mt-12 relative">
          {/* Logo */}
          <img
            src={shop.logo}
            alt={shop.name}
            className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover bg-white"
          />

          <div className="flex-1 pb-2 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl font-extrabold text-dark">{shop.name}</h1>
                <span className="bg-orange-tint text-orange-deep text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {shop.category}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Stars rating={shop.rating} />
                  <span className="font-semibold text-dark">{shop.rating}</span>
                  <span className="text-ngray">({shop.reviews} reviews)</span>
                </span>
                <span className="text-ngray">📍 {shop.city}</span>
                {shop.freeDelivery && (
                  <span className="bg-success/15 text-success text-[11px] font-bold px-2.5 py-1 rounded-full">
                    Free Delivery
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 mb-1">
              <button
                onClick={() => setFollowing(!following)}
                className={`text-sm font-bold px-5 py-2.5 rounded-full transition-colors
                  ${following ? "bg-orange-tint text-orange-deep" : "bg-orange text-white hover:bg-orange-light"}`}
              >
                {following ? "✓ Following" : "+ Follow"}
              </button>
              <button className="text-sm font-bold px-5 py-2.5 rounded-full border border-ngray-light text-dark hover:border-gray-400 transition-colors">
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Powered by Nexora — subtle footer link per spec */}
        <div className="py-3 text-right">
          <span className="text-[11px] text-ngray">
            Powered by <span className="font-semibold text-orange">nexora.com</span>
          </span>
        </div>
      </div>
    </header>
  );
}

// ─── Product Card ───────────────────────────────────────────────────────────────
function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  return (
    <div
      className={`bg-white border border-ngray-light rounded-2xl overflow-hidden transition-all
        ${product.inStock ? "hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]" : "opacity-60"}`}
    >
      <div className="h-36 relative overflow-hidden">
        <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-dark text-xs font-bold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-3.5">
        <div className="text-[13px] font-bold text-dark mb-1 leading-snug">{product.name}</div>
        <div className="text-base font-extrabold text-orange mb-3">৳{product.price}</div>
        <button
          disabled={!product.inStock}
          onClick={() => onAdd(product)}
          className={`w-full text-xs font-bold py-2.5 rounded-full transition-colors
            ${product.inStock ? "bg-orange text-white hover:bg-orange-light cursor-pointer" : "bg-ngray-light text-ngray cursor-not-allowed"}`}
        >
          {product.inStock ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}

// ─── Product Grid + Filters ──────────────────────────────────────────────────────
function ProductSection({ onAdd }: { onAdd: (p: Product) => void }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [inStockOnly, setInStockOnly] = useState(false);

  const filtered = products.filter((p) => {
    if (activeCategory !== "All" && p.category !== activeCategory) return false;
    if (inStockOnly && !p.inStock) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Filter bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-colors
                ${activeCategory === c ? "bg-orange text-white" : "bg-cream text-ngray hover:bg-orange-tint"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 accent-orange"
          />
          In Stock Only
        </label>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={onAdd} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-ngray text-sm">No products match this filter.</div>
      )}
    </div>
  );
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────────
function CartSidebar({
  open,
  onClose,
  cart,
  updateQty,
}: {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQty: (id: number, qty: number) => void;
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  if (!open) return null;

  const goToCheckout = () => {
    // Persist cart for the checkout page to read.
    // In production this would be global state (Zustand/Context) or a DB cart tied to session.
    sessionStorage.setItem("nexora_cart", JSON.stringify(cart));
    sessionStorage.setItem("nexora_shop", JSON.stringify(shop));
    window.location.href = "/shop/rimas-bakery/checkout";
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-[400px] bg-white z-50 shadow-2xl flex flex-col">
        <div className="px-6 py-5 border-b border-ngray-light flex items-center justify-between">
          <h3 className="font-bold text-dark text-lg">Your Cart</h3>
          <button onClick={onClose} className="text-ngray text-xl hover:text-dark">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-ngray text-sm">Your cart is empty.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-center">
                  <img src={item.product.img} alt={item.product.name} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-dark">{item.product.name}</div>
                    <div className="text-sm font-bold text-orange">৳{item.product.price}</div>
                  </div>
                  <div className="flex items-center gap-2 border border-ngray-light rounded-full px-2 py-1">
                    <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="text-orange font-bold w-5">−</button>
                    <span className="text-sm font-semibold w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="text-orange font-bold w-5">+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-ngray-light px-6 py-5">
            <div className="flex justify-between text-sm mb-4">
              <span className="text-ngray">Subtotal</span>
              <span className="font-bold text-dark">৳{subtotal}</span>
            </div>
            <button
              onClick={goToCheckout}
              className="w-full bg-orange text-white font-bold py-3.5 rounded-full hover:bg-orange-light transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Floating Cart Button ─────────────────────────────────────────────────────────
function CartButton({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-orange text-white font-bold px-6 py-4 rounded-full shadow-xl hover:bg-orange-light transition-colors flex items-center gap-2 z-30"
    >
      🛒 View Cart
      <span className="bg-white text-orange text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
        {count}
      </span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────────
export default function ShopPublicPage() {
  const [following, setFollowing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id: number, qty: number) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((i) => i.product.id !== id) : prev.map((i) => (i.product.id === id ? { ...i, qty } : i))
    );
  };

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="min-h-screen bg-cream">
      <ShopHeader following={following} setFollowing={setFollowing} />
      <ProductSection onAdd={addToCart} />
      <CartButton count={totalItems} onClick={() => setCartOpen(true)} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} updateQty={updateQty} />
    </div>
  );
}