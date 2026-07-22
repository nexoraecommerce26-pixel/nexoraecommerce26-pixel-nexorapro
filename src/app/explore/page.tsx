"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/app/lib/supabase";

// ─── Logo ────────────────────────────────────────────────────────────────────
function NexoraLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nGradExplore" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C5A" />
          <stop offset="50%" stopColor="#FF5C1A" />
          <stop offset="100%" stopColor="#C43A08" />
        </linearGradient>
      </defs>
      <rect x="28" y="35" width="52" height="148" rx="14" fill="url(#nGradExplore)" />
      <rect x="120" y="35" width="52" height="148" rx="14" fill="url(#nGradExplore)" />
      <polygon points="80,35 120,120 120,35" fill="url(#nGradExplore)" />
      <polygon points="80,35 120,183 80,183" fill="#C43A08" opacity="0.35" />
      <path d="M55 22 Q100 2 145 22" fill="none" stroke="#1A1A1A" strokeWidth="13" strokeLinecap="round" />
      <circle cx="55" cy="22" r="8" fill="#1A1A1A" />
      <circle cx="145" cy="22" r="8" fill="#1A1A1A" />
    </svg>
  );
}

// ─── Navbar (same as landing page) ────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="bg-white border-b border-ngray-light h-16 flex items-center justify-between px-12 sticky top-0 z-50">
      <a href="/" className="flex items-center gap-2.5 no-underline">
        <NexoraLogo size={36} />
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-dark tracking-tight leading-none">
            ne<span className="text-orange">x</span>ora
          </span>
          <span className="text-[8px] tracking-[3.5px] text-ngray font-medium">DIGITAL MALL</span>
        </div>
      </a>
      <ul className="hidden md:flex gap-7 list-none m-0 p-0">
        {[
          { label: "Home", href: "/" },
          { label: "Explore", href: "/explore" },
          { label: "Shops", href: "/explore" },
          { label: "Offers", href: "/explore?filter=offers" },
        ].map((item) => (
          <li key={item.label}>
            <a href={item.href} className="text-sm font-medium text-gray-500 no-underline hover:text-orange transition-colors">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="hidden md:flex items-center gap-3">
        <a href="/login" className="text-sm font-semibold text-dark border border-ngray-light px-5 py-2.5 rounded-full no-underline hover:border-gray-400 transition-colors">
          Log in
        </a>
        <a href="/signup" className="text-sm font-bold text-white bg-orange px-5 py-2.5 rounded-full no-underline hover:bg-orange-light transition-colors">
          Become a Seller
        </a>
      </div>
    </nav>
  );
}

// ─── Category data ───────────────────────────────────────────────────────────
const categoryPills = [
  { name: "All", slug: "all", img: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=200&q=80" },
  { name: "Food & Cake", slug: "food-cake", img: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=200&q=80" },
  { name: "Clothing", slug: "clothing", img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&q=80" },
  { name: "Electronics", slug: "electronics", img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&q=80" },
  { name: "Beauty", slug: "beauty", img: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&q=80" },
  { name: "Home & Living", slug: "home-living", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80" },
  { name: "Books", slug: "books", img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=80" },
];

const cities = ["All Cities", "Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi", "Rangpur"];

type Pkg = "Basic" | "Standard" | "Premium";

type Shop = {
  name: string;
  slug: string;
  category: string;
  city: string;
  rating: number;
  orders: number;
  pkg: Pkg;
  freeDelivery: boolean;
  premium: boolean;
  banner: string;
  icon: string;
  joined: string; // ISO-ish for "newest" sort demo
};

const allShops: Shop[] = [
  { name: "Rima's Bakery", slug: "rimas-bakery", category: "Food & Cake", city: "Dhaka", rating: 4.9, orders: 1840, pkg: "Premium", freeDelivery: true, premium: true, banner: "https://images.unsplash.com/photo-1530648672449-81f6c723e2f1?w=400&q=80", icon: "🍰", joined: "2026-05-01" },
  { name: "Dhaka Fashion Hub", slug: "dhaka-fashion-hub", category: "Clothing", city: "Dhaka", rating: 4.7, orders: 920, pkg: "Standard", freeDelivery: false, premium: false, banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80", icon: "✂️", joined: "2026-04-12" },
  { name: "TechZone BD", slug: "techzone-bd", category: "Electronics", city: "Chittagong", rating: 4.8, orders: 1320, pkg: "Premium", freeDelivery: true, premium: true, banner: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80", icon: "⚡", joined: "2026-03-20" },
  { name: "Glow Beauty", slug: "glow-beauty", category: "Beauty", city: "Sylhet", rating: 4.6, orders: 540, pkg: "Standard", freeDelivery: true, premium: false, banner: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80", icon: "💄", joined: "2026-06-02" },
  { name: "Home Nest BD", slug: "home-nest-bd", category: "Home & Living", city: "Dhaka", rating: 4.4, orders: 310, pkg: "Basic", freeDelivery: false, premium: false, banner: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", icon: "🏠", joined: "2026-06-15" },
  { name: "Pages & Co.", slug: "pages-and-co", category: "Books", city: "Khulna", rating: 4.3, orders: 180, pkg: "Basic", freeDelivery: false, premium: false, banner: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80", icon: "📚", joined: "2026-02-28" },
  { name: "Spice & Slice", slug: "spice-and-slice", category: "Food & Cake", city: "Chittagong", rating: 4.7, orders: 760, pkg: "Standard", freeDelivery: true, premium: false, banner: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80", icon: "🍕", joined: "2026-05-22" },
  { name: "Urban Threads", slug: "urban-threads", category: "Clothing", city: "Rajshahi", rating: 4.5, orders: 430, pkg: "Basic", freeDelivery: false, premium: false, banner: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80", icon: "👕", joined: "2026-04-30" },
  { name: "GadgetVerse", slug: "gadgetverse", category: "Electronics", city: "Dhaka", rating: 4.9, orders: 2100, pkg: "Premium", freeDelivery: true, premium: true, banner: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80", icon: "📱", joined: "2026-01-15" },
  { name: "Skin Story", slug: "skin-story", category: "Beauty", city: "Rangpur", rating: 4.2, orders: 220, pkg: "Basic", freeDelivery: false, premium: false, banner: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80", icon: "🧴", joined: "2026-06-20" },
  { name: "Cake Theory", slug: "cake-theory", category: "Food & Cake", city: "Sylhet", rating: 4.8, orders: 980, pkg: "Premium", freeDelivery: true, premium: true, banner: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&q=80", icon: "🎂", joined: "2026-05-10" },
  { name: "Cozy Corner", slug: "cozy-corner", category: "Home & Living", city: "Dhaka", rating: 4.6, orders: 410, pkg: "Standard", freeDelivery: true, premium: false, banner: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80", icon: "🛋️", joined: "2026-03-08" },
];

type SortOption = "top-rated" | "newest" | "most-orders";

// ─── Shop Card ───────────────────────────────────────────────────────────────
function ShopCard({ shop }: { shop: Shop }) {
  return (
    <a
      href={`/shop/${shop.slug}`}
      className="bg-white rounded-2xl overflow-hidden border border-ngray-light hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)] transition-all duration-200 no-underline block"
    >
      <div className="h-28 relative overflow-hidden">
        <img src={shop.banner} alt={shop.name} className="w-full h-full object-cover" />
        {shop.premium && (
          <span className="absolute top-2 right-2 bg-orange text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full tracking-wide">
            PREMIUM
          </span>
        )}
        {shop.freeDelivery && (
          <span className="absolute top-2 left-2 bg-success text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full tracking-wide">
            FREE DELIVERY
          </span>
        )}
      </div>
      <div className="px-3.5 pb-3.5">
        <div className="w-[38px] h-[38px] rounded-full bg-orange-tint border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.1)] flex items-center justify-center -mt-[19px] mb-2 text-base">
          {shop.icon}
        </div>
        <div className="text-[13px] font-bold text-dark mb-1.5 truncate">{shop.name}</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="bg-orange-tint text-orange-deep text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            {shop.category}
          </span>
          <span className="text-[11px] text-ngray">
            <span className="text-warning">★</span> {shop.rating}
          </span>
          <span className="text-[11px] text-ngray">📍 {shop.city}</span>
        </div>
      </div>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [city, setCity] = useState("All Cities");
  const [pkgFilter, setPkgFilter] = useState<Pkg | "All">("All");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("top-rated");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const perPage = 8;

  // Real database shops list
  const [shops, setShops] = useState<Shop[]>(allShops);

  useEffect(() => {
    const loadShops = async () => {
      try {
        const { data, error } = await supabase
          .from("shops")
          .select("*")
          .eq("is_active", true);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Shop[] = data.map((s: any) => {
            const planCap = (s.plan ? s.plan.charAt(0).toUpperCase() + s.plan.slice(1) : "Basic") as Pkg;
            return {
              name: s.shop_name,
              slug: s.slug,
              category: s.category || "Food & Cake",
              city: s.city || "Dhaka",
              rating: s.rating || 4.8,
              orders: s.total_reviews ? s.total_reviews * 5 + 80 : 120,
              pkg: planCap,
              freeDelivery: s.delivery_inside_city === 0,
              premium: s.plan === "premium",
              banner: s.banner_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
              icon: s.logo_url || "🍰",
              joined: s.created_at || "2026-06-01",
            };
          });

          // Merge and prevent slug duplicates
          const existingSlugs = new Set(mapped.map((m) => m.slug));
          const uniqueMocks = allShops.filter((mock) => !existingSlugs.has(mock.slug));
          setShops([...mapped, ...uniqueMocks]);
        }
      } catch (err) {
        console.error("Error loading shops from database:", err);
      }
    };
    loadShops();
  }, []);

  const filtered = useMemo(() => {
    let result = [...shops];

    if (activeCategory !== "all") {
      const catName = categoryPills.find((c) => c.slug === activeCategory)?.name;
      result = result.filter((s) => s.category === catName);
    }
    if (city !== "All Cities") {
      result = result.filter((s) => s.city === city);
    }
    if (pkgFilter !== "All") {
      result = result.filter((s) => s.pkg === pkgFilter);
    }
    if (ratingFilter) {
      result = result.filter((s) => s.rating >= ratingFilter);
    }
    if (freeDeliveryOnly) {
      result = result.filter((s) => s.freeDelivery);
    }

    if (sort === "top-rated") result.sort((a, b) => b.rating - a.rating);
    if (sort === "most-orders") result.sort((a, b) => b.orders - a.orders);
    if (sort === "newest") result.sort((a, b) => (a.joined < b.joined ? 1 : -1));

    return result;
  }, [shops, activeCategory, city, pkgFilter, ratingFilter, freeDeliveryOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const activeFilterCount =
    (city !== "All Cities" ? 1 : 0) +
    (pkgFilter !== "All" ? 1 : 0) +
    (ratingFilter ? 1 : 0) +
    (freeDeliveryOnly ? 1 : 0);

  const resetFilters = () => {
    setCity("All Cities");
    setPkgFilter("All");
    setRatingFilter(null);
    setFreeDeliveryOnly(false);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Category — real photo cards inside the page */}
        <div className="mb-9">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark">Browse by category</h2>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {categoryPills.map((cat) => {
              const isActive = activeCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => {
                    setActiveCategory(cat.slug);
                    setPage(1);
                  }}
                  className={`rounded-2xl overflow-hidden border-2 transition-all text-left
                    ${isActive ? "border-orange shadow-[0_8px_20px_rgba(255,92,26,0.15)]" : "border-transparent hover:border-orange-light"}`}
                >
                  <div className="h-16 relative">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                    {isActive && <div className="absolute inset-0 bg-orange/15" />}
                  </div>
                  <div className={`px-2 py-1.5 text-center ${isActive ? "bg-orange-tint" : "bg-cream"}`}>
                    <span className={`text-[10px] font-bold leading-tight block ${isActive ? "text-orange-deep" : "text-dark"}`}>
                      {cat.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort + filter trigger + count bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-ngray">
            <span className="font-bold text-dark">{filtered.length}</span> shops found
          </p>
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="border border-ngray-light rounded-full px-4 py-2 text-xs font-semibold text-dark outline-none focus:border-orange transition-colors bg-white"
            >
              <option value="top-rated">Sort: Top Rated</option>
              <option value="newest">Sort: Newest</option>
              <option value="most-orders">Sort: Most Orders</option>
            </select>
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 border border-ngray-light rounded-full px-4 py-2 text-xs font-bold text-dark hover:border-orange transition-colors relative"
            >
              <span>⚙️</span> Filters
              {activeFilterCount > 0 && (
                <span className="bg-orange text-white w-4 h-4 rounded-full text-[10px] font-extrabold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Results grid */}
        {paginated.length > 0 ? (
          <div className="grid grid-cols-4 gap-[18px]">
            {paginated.map((shop) => <ShopCard key={shop.slug} shop={shop} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-ngray text-sm">No shops match your filters.</p>
            <button onClick={resetFilters} className="text-orange text-sm font-bold mt-2">Clear filters</button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="w-9 h-9 rounded-full border border-ngray-light text-sm font-bold text-dark disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange transition-colors"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-full text-sm font-bold transition-colors
                  ${page === p ? "bg-orange text-white" : "border border-ngray-light text-dark hover:border-orange"}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="w-9 h-9 rounded-full border border-ngray-light text-sm font-bold text-dark disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange transition-colors"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Slide-in filter panel */}
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        city={city}
        setCity={(v) => { setCity(v); setPage(1); }}
        pkgFilter={pkgFilter}
        setPkgFilter={(v) => { setPkgFilter(v); setPage(1); }}
        ratingFilter={ratingFilter}
        setRatingFilter={(v) => { setRatingFilter(v); setPage(1); }}
        freeDeliveryOnly={freeDeliveryOnly}
        setFreeDeliveryOnly={(v) => { setFreeDeliveryOnly(v); setPage(1); }}
        onReset={resetFilters}
        resultCount={filtered.length}
      />
    </div>
  );
}

// ─── Slide-in Filter Panel ──────────────────────────────────────────────────────
function FilterPanel({
  open,
  onClose,
  city,
  setCity,
  pkgFilter,
  setPkgFilter,
  ratingFilter,
  setRatingFilter,
  freeDeliveryOnly,
  setFreeDeliveryOnly,
  onReset,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  city: string;
  setCity: (v: string) => void;
  pkgFilter: Pkg | "All";
  setPkgFilter: (v: Pkg | "All") => void;
  ratingFilter: number | null;
  setRatingFilter: (v: number | null) => void;
  freeDeliveryOnly: boolean;
  setFreeDeliveryOnly: (v: boolean) => void;
  onReset: () => void;
  resultCount: number;
}) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[340px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="px-6 py-5 border-b border-ngray-light flex items-center justify-between">
          <h3 className="font-bold text-dark text-lg">Filters</h3>
          <button onClick={onClose} className="text-ngray text-xl hover:text-dark">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-7">
          {/* City */}
          <div>
            <label className="block text-xs font-bold text-ngray tracking-wide mb-2">CITY</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-ngray-light rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange transition-colors bg-white"
            >
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Package */}
          <div>
            <label className="block text-xs font-bold text-ngray tracking-wide mb-2">PACKAGE</label>
            <div className="flex flex-col gap-2.5">
              {(["All", "Basic", "Standard", "Premium"] as const).map((p) => (
                <label key={p} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="pkg"
                    checked={pkgFilter === p}
                    onChange={() => setPkgFilter(p)}
                    className="w-4 h-4 accent-orange"
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-bold text-ngray tracking-wide mb-2">RATING</label>
            <div className="flex flex-col gap-2.5">
              {[4, 3].map((r) => (
                <label key={r} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={ratingFilter === r}
                    onChange={() => setRatingFilter(r)}
                    className="w-4 h-4 accent-orange"
                  />
                  <span className="text-warning">{"★".repeat(r)}</span>
                  <span className="text-ngray">{r}+ stars</span>
                </label>
              ))}
              <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={ratingFilter === null}
                  onChange={() => setRatingFilter(null)}
                  className="w-4 h-4 accent-orange"
                />
                Any rating
              </label>
            </div>
          </div>

          {/* Free delivery */}
          <div className="flex items-center justify-between bg-cream rounded-xl px-3.5 py-3">
            <span className="text-sm font-semibold text-dark">Free Delivery</span>
            <button
              onClick={() => setFreeDeliveryOnly(!freeDeliveryOnly)}
              className={`w-10 h-6 rounded-full relative transition-colors ${freeDeliveryOnly ? "bg-orange" : "bg-ngray-light"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${freeDeliveryOnly ? "left-[18px]" : "left-0.5"}`}
              />
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-ngray-light px-6 py-5 flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 py-3 rounded-full font-bold text-sm border border-ngray-light text-dark hover:border-gray-400 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full font-bold text-sm bg-orange text-white hover:bg-orange-light transition-colors"
          >
            Show {resultCount} shops
          </button>
        </div>
      </div>
    </>
  );
}