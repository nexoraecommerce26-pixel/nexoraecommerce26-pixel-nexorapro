// src/app/admin/featured/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import type { ShopWithFeaturedFlag } from "@/app/lib/types";

export default function FeaturedShopsAdminPage() {
  const [shops, setShops] = useState<ShopWithFeaturedFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("shops_with_featured_flag")
      .select("*")
      .order("rating", { ascending: false });
    if (error) setError(error.message);
    else setShops(data as ShopWithFeaturedFlag[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleFeatured(shop: ShopWithFeaturedFlag) {
    const { error } = await supabase
      .from("shops")
      .update({ is_featured: !shop.is_featured })
      .eq("id", shop.id);
    if (error) setError(error.message);
    else await load();
  }

  const filtered = shops.filter((s) =>
    s.shop_name.toLowerCase().includes(search.toLowerCase())
  );

  const featuredCount = shops.filter((s) => s.is_featured || s.auto_qualifies).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Featured shops</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manually pin shops to the landing page, or let top-rated shops qualify automatically
          (4.7★+ with 10+ reviews).
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <input
          type="text"
          placeholder="Search shops..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm w-64 focus:outline-none focus:border-teal-500"
        />
        <div className="text-sm text-slate-500">
          <span className="font-bold text-slate-800">{featuredCount}</span> currently featured
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading shops...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Shop</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Plan</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Rating</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Auto-qualified</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Manually featured</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-slate-200">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-800">{s.shop_name}</div>
                    <div className="text-[11px] text-slate-500">{s.city}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                      {s.plan || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-amber-500">★</span> {s.rating} ({s.total_reviews})
                  </td>
                  <td className="px-5 py-3.5">
                    {s.auto_qualifies ? (
                      <span className="text-emerald-700 font-bold text-xs">Yes</span>
                    ) : (
                      <span className="text-gray-300 text-xs">No</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleFeatured(s)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        s.is_featured ? "bg-teal-600" : "bg-gray-200"
                      }`}
                      aria-label="Toggle featured"
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                          s.is_featured ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">
                    No shops found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}