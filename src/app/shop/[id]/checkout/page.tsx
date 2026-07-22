"use client";

import { useState, useEffect, useRef } from "react";

// ─── Logo ────────────────────────────────────────────────────────────────────
function NexoraLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nGradCheckout" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C5A" />
          <stop offset="50%" stopColor="#FF5C1A" />
          <stop offset="100%" stopColor="#C43A08" />
        </linearGradient>
      </defs>
      <rect x="28" y="35" width="52" height="148" rx="14" fill="url(#nGradCheckout)" />
      <rect x="120" y="35" width="52" height="148" rx="14" fill="url(#nGradCheckout)" />
      <polygon points="80,35 120,120 120,35" fill="url(#nGradCheckout)" />
      <polygon points="80,35 120,183 80,183" fill="#C43A08" opacity="0.35" />
      <path d="M55 22 Q100 2 145 22" fill="none" stroke="#1A1A1A" strokeWidth="13" strokeLinecap="round" />
      <circle cx="55" cy="22" r="8" fill="#1A1A1A" />
      <circle cx="145" cy="22" r="8" fill="#1A1A1A" />
    </svg>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type Product = { id: number; name: string; price: number; category: string; inStock: boolean; img: string };
type CartItem = { product: Product; qty: number };
type Shop = { name: string; city: string; bkash: string; nagad: string; logo: string };

// ─── Country / City data ────────────────────────────────────────────────────────
const countries = [
  { code: "BD", name: "Bangladesh" },
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
];

const bdCities = [
  "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Barisal", "Rangpur",
  "Mymensingh", "Comilla", "Narayanganj", "Gazipur", "Bogra", "Jessore",
  "Dinajpur", "Tangail", "Cox's Bazar", "Pabna", "Noakhali", "Faridpur", "Feni",
];

// ─── Searchable city select ─────────────────────────────────────────────────────
function CitySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (city: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = bdCities.filter((c) => c.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative" ref={wrapRef}>
      <input
        type="text"
        placeholder="Type or select your city"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full border border-ngray-light rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-colors"
      />
      {open && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-white border border-ngray-light rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-3 text-sm text-ngray">No matching city — you can still type a custom one.</div>
          )}
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onChange(c);
                setQuery(c);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-cream transition-colors
                ${c === value ? "bg-orange-tint text-orange-deep font-semibold" : "text-gray-700"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);

  // Customer fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("BD");
  const [city, setCity] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [placed, setPlaced] = useState(false);

  // Load cart + shop from sessionStorage (set by the shop page before navigating here)
  useEffect(() => {
    try {
      const cartData = sessionStorage.getItem("nexora_cart");
      const shopData = sessionStorage.getItem("nexora_shop");
      if (cartData) setCart(JSON.parse(cartData));
      if (shopData) setShop(JSON.parse(shopData));
    } catch {
      // ignore parse errors — cart will just be empty
    }
  }, []);

  // Auto-detect delivery zone: same city as shop → inside, otherwise → outside.
  // Only applies when country is Bangladesh and shop data is available.
  const isInsideCity =
    country === "BD" && shop && city.trim().toLowerCase() === shop.city.trim().toLowerCase();
  const zoneKnown = country === "BD" && city.trim().length > 0;
  const deliveryCost = !zoneKnown ? null : isInsideCity ? 60 : 120;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const total = subtotal + (deliveryCost ?? 0);

  const isValid = name.trim() && phone.trim() && city.trim() && fullAddress.trim() && cart.length > 0;

  const placeOrder = () => {
    sessionStorage.removeItem("nexora_cart");
    setPlaced(true);
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-dark mb-2">Order #NX-3022 placed!</h1>
          <p className="text-ngray text-sm mb-7">
            {shop?.name ?? "The shop"} will confirm your order shortly. We&apos;ll text you updates on{" "}
            <span className="font-semibold text-dark">{phone}</span>.
          </p>
          <a
            href="/"
            className="inline-block bg-orange text-white font-bold px-8 py-3.5 rounded-full no-underline hover:bg-orange-light transition-colors"
          >
            Back to Nexora →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-ngray-light px-8 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 no-underline">
          <NexoraLogo size={30} />
          <span className="text-sm font-extrabold text-dark">
            ne<span className="text-orange">x</span>ora
          </span>
        </a>
        <span className="text-xs text-ngray">Secure checkout</span>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-[1fr_360px] gap-8">
        {/* Left — form */}
        <div>
          <h1 className="text-2xl font-bold text-dark mb-1">Delivery details</h1>
          <p className="text-ngray text-sm mb-7">
            Ordering from <span className="font-semibold text-dark">{shop?.name ?? "shop"}</span>
          </p>

          <div className="bg-white rounded-2xl border border-ngray-light p-6 flex flex-col gap-5">
            {/* Name + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Full Name *</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-ngray-light rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-ngray-light rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-colors"
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Country</label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity("");
                }}
                className="w-full border border-ngray-light rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-colors bg-white"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <p className="text-[11px] text-ngray mt-1.5">Defaults to Bangladesh — change if ordering from elsewhere.</p>
            </div>

            {/* City — only show smart picker for BD, plain input otherwise */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">City *</label>
              {country === "BD" ? (
                <CitySelect value={city} onChange={setCity} />
              ) : (
                <input
                  type="text"
                  placeholder="Your city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-ngray-light rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-colors"
                />
              )}
            </div>

            {/* Delivery zone indicator */}
            {zoneKnown && (
              <div
                className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold
                  ${isInsideCity ? "bg-success/10 text-success" : "bg-info/10 text-info"}`}
              >
                <span>{isInsideCity ? "🏠" : "🚚"}</span>
                {isInsideCity
                  ? `Inside city delivery applied — same city as ${shop?.name ?? "the shop"} (৳60)`
                  : `Outside city delivery applied — ৳120`}
              </div>
            )}

            {/* Full address */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Full Address *</label>
              <textarea
                placeholder="House/Road/Area, landmark, etc."
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                rows={3}
                className="w-full border border-ngray-light rounded-xl px-4 py-3 text-sm outline-none focus:border-orange transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right — order summary */}
        <div>
          <div className="bg-white rounded-2xl border border-ngray-light p-6 sticky top-6">
            <h3 className="font-bold text-dark text-sm mb-4">Order Summary</h3>

            <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-sm text-ngray">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 items-center">
                    <img src={item.product.img} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-dark leading-tight">{item.product.name}</div>
                      <div className="text-[11px] text-ngray">Qty {item.qty}</div>
                    </div>
                    <span className="text-xs font-bold text-orange">৳{item.product.price * item.qty}</span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-ngray-light pt-4 flex flex-col gap-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-ngray">Subtotal</span>
                <span className="font-semibold text-dark">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ngray">Delivery</span>
                <span className="font-semibold text-dark">{deliveryCost !== null ? `৳${deliveryCost}` : "—"}</span>
              </div>
              <div className="border-t border-ngray-light my-1" />
              <div className="flex justify-between">
                <span className="font-bold text-dark">Total</span>
                <span className="font-extrabold text-orange text-lg">৳{total}</span>
              </div>
            </div>

            {shop && (
              <div className="bg-cream rounded-xl p-3.5 text-xs text-gray-600 mb-5">
                Pay via <span className="font-bold text-dark">bKash: {shop.bkash}</span> or{" "}
                <span className="font-bold text-dark">Nagad: {shop.nagad}</span> after confirming.
              </div>
            )}

            <button
              disabled={!isValid}
              onClick={placeOrder}
              className={`w-full font-bold py-3.5 rounded-full transition-colors
                ${isValid ? "bg-orange text-white hover:bg-orange-light cursor-pointer" : "bg-ngray-light text-ngray cursor-not-allowed"}`}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}