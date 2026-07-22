// src/app/example/[pkg]/store/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { PACKAGE_CONFIG, MOCK_PRODUCTS, PackageId } from "../../mockData";

const CATEGORIES = ["All", "Phones", "Laptops", "Audio", "Accessories", "Wearables", "Cameras"];

function NexoraLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nGStore" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C5A" /><stop offset="50%" stopColor="#FF5C1A" /><stop offset="100%" stopColor="#C43A08" />
        </linearGradient>
      </defs>
      <rect x="28" y="35" width="52" height="148" rx="14" fill="url(#nGStore)" />
      <rect x="120" y="35" width="52" height="148" rx="14" fill="url(#nGStore)" />
      <polygon points="80,35 120,120 120,35" fill="url(#nGStore)" />
      <polygon points="80,35 120,183 80,183" fill="#C43A08" opacity="0.35" />
      <path d="M55 22 Q100 2 145 22" fill="none" stroke="#1A1A1A" strokeWidth="13" strokeLinecap="round" />
      <circle cx="55" cy="22" r="8" fill="#1A1A1A" /><circle cx="145" cy="22" r="8" fill="#1A1A1A" />
    </svg>
  );
}

export default function StoreDemoPage() {
  const params = useParams();
  const pkg = (params.pkg as PackageId) ?? "starter";
  const config = PACKAGE_CONFIG[pkg] ?? PACKAGE_CONFIG.starter;

  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Demo banner */}
      <div
        className="text-white text-center py-2 sticky top-0 z-50 text-[11px] font-bold tracking-wide"
        style={{ background: config.accent }}
      >
        🎭 DEMO MODE · {config.emoji} {config.label} Plan Store ·{" "}
        <Link href="/example" className="underline text-white/80">Change plan</Link>
        {" · "}
        <Link href={`/example/${pkg}/dashboard`} className="underline text-white/80">See Dashboard →</Link>
      </div>

      {/* Store Navbar */}
      <nav className="h-14 border-b border-ngray-light flex items-center justify-between px-8 sticky top-8 bg-white z-40">
        <div className="flex items-center gap-2.5">
          <NexoraLogo size={26} />
          <div>
            <div className="text-sm font-extrabold text-dark leading-none">John Electronics</div>
            <div className="text-[10px] text-ngray">nexora.com/john-electronics</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search — growth/pro */}
          {config.hasAdvancedThemes ? (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search products..."
              className="border border-ngray-light rounded-full px-4 py-1.5 text-xs w-52 focus:outline-none"
              style={{ outlineColor: config.accent }}
            />
          ) : (
            <div className="text-[10px] text-gray-400 border border-dashed border-ngray-light px-3 py-1.5 rounded-full">
              🔒 Search (Growth+)
            </div>
          )}

          {/* Wishlist */}
          <span className="text-xs text-ngray">♡ {wishlist.length}</span>
          <span className="text-xs text-ngray">🛒 {cart.length}</span>

          <Link
            href={`/example/${pkg}/dashboard`}
            className="text-xs font-bold text-white px-4 py-2 rounded-full no-underline"
            style={{ background: config.accent }}
          >
            Seller Dashboard →
          </Link>
        </div>
      </nav>

      {/* Banner */}
      <div className="relative h-52 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&q=80" alt="banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-5 left-8 text-white">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold">John Electronics</h1>
            {config.hasFeaturedBadge && (
              <span
                className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                style={{ background: config.accent }}
              >
                ✓ PREMIUM VERIFIED
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-white/80">
            <span>⚡ Electronics</span>
            <span>⭐ 4.8 (214 reviews)</span>
            <span>📍 Dhaka</span>
            {config.hasAdvancedThemes && <span className="bg-white/20 px-2 py-0.5 rounded-full">✓ Free delivery inside Dhaka</span>}
          </div>
        </div>
      </div>

      {/* Flash sale banner — growth/pro */}
      {config.hasFlashSale && (
        <div className="mx-8 mt-4 px-5 py-3 rounded-xl flex items-center justify-between"
          style={{ background: config.accentLight }}>
          <div>
            <span className="text-xs font-extrabold text-dark">⚡ Flash Sale — Ends in </span>
            <span className="font-extrabold text-sm" style={{ color: config.accent }}>02:14:33</span>
          </div>
          <span
            className="text-[11px] font-bold text-white px-3 py-1.5 rounded-full"
            style={{ background: config.accent }}
          >
            Up to 30% off
          </span>
        </div>
      )}

      {/* Coupon banner — growth/pro */}
      {config.hasCoupons && (
        <div className="mx-8 mt-2 px-5 py-2.5 rounded-xl flex items-center justify-between bg-cream border border-ngray-light">
          <span className="text-xs font-bold text-dark">
            🎟 Use code <span style={{ color: config.accent }}>DEMO20</span> for 20% off
          </span>
          <button className="text-[11px] font-bold text-white px-3 py-1 rounded-full" style={{ background: config.accent }}>
            Apply
          </button>
        </div>
      )}

      {/* Category filter */}
      <div className="px-8 py-3 border-b border-ngray-light flex gap-2 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors"
            style={activeCategory === cat
              ? { background: config.accent, color: "#fff" }
              : { background: "#F7F4F0", color: "#6B6B6B" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-ngray">{filtered.length} products found</span>
          {config.hasAdvancedAnalytics && (
            <select className="text-xs border border-ngray-light rounded-full px-3 py-1.5 focus:outline-none">
              <option>Sort: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Best Selling</option>
            </select>
          )}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((prod) => (
            <div key={prod.id} className="border border-ngray-light rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-white">
              <div className="relative h-40 bg-cream">
                <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
                {prod.badge && config.hasAdvancedThemes && (
                  <span className="absolute top-2 left-2 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                    style={{ background: config.accent }}>
                    {prod.badge}
                  </span>
                )}
                {config.hasAdvancedThemes && (
                  <button
                    onClick={() => setWishlist((w) => w.includes(prod.id) ? w.filter(i => i !== prod.id) : [...w, prod.id])}
                    className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-sm"
                  >
                    {wishlist.includes(prod.id) ? "❤️" : "🤍"}
                  </button>
                )}
                {config.hasAdvancedAnalytics && (
                  <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-white/90 text-dark px-1.5 py-0.5 rounded-full">
                    {prod.stock} left
                  </span>
                )}
              </div>
              <div className="p-3.5">
                <div className="text-[10px] text-ngray mb-0.5">{prod.category}</div>
                <div className="text-sm font-bold text-dark mb-2 leading-tight">{prod.name}</div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm" style={{ color: config.accent }}>{prod.price}</span>
                  <button
                    onClick={() => setCart((c) => [...c, prod.id])}
                    className="text-[11px] font-bold text-white px-3 py-1.5 rounded-full"
                    style={{ background: config.accent }}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade prompt — starter */}
      {!config.hasAdvancedThemes && (
        <div className="mx-8 mb-6 border-2 border-dashed border-ngray-light rounded-2xl p-6 text-center">
          <div className="text-2xl mb-2">🚀</div>
          <div className="text-sm font-bold text-dark mb-1">Unlock more with Growth plan</div>
          <div className="text-xs text-ngray mb-3">
            Wishlist, search, offer badges, flash sales, free delivery zones, and much more.
          </div>
          <Link href="/signup" className="text-xs font-bold text-white px-5 py-2 rounded-full no-underline inline-block"
            style={{ background: config.accent }}>
            Upgrade to Growth →
          </Link>
        </div>
      )}

      {/* Powered by */}
      <div className="border-t border-ngray-light px-8 py-4 flex items-center justify-between bg-cream">
        <div className="flex items-center gap-1.5 text-xs text-ngray">
          <NexoraLogo size={16} />
          <span>Powered by <strong className="text-dark">nexora</strong></span>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/example" className="text-xs text-ngray no-underline hover:text-dark">← All plans</Link>
          <Link
            href={`/example/${pkg}/dashboard`}
            className="text-xs font-bold text-white px-4 py-2 rounded-full no-underline"
            style={{ background: config.accent }}
          >
            See your dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}