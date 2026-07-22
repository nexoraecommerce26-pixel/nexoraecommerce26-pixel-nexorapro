// src/app/admin/revenue/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

interface PackageDist {
  package: string;
  shop_count: number;
  total_revenue: number;
}

const packageColors: Record<string, string> = {
  basic: "bg-slate-100 text-slate-600",
  standard: "bg-sky-50 text-sky-700",
  premium: "bg-teal-50 text-teal-700",
};

export default function RevenuePage() {
  const [dist, setDist] = useState<PackageDist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from("package_distribution").select("*");
      if (error) setError(error.message);
      else setDist(data as PackageDist[]);
      setLoading(false);
    }
    load();
  }, []);

  const totalShops = dist.reduce((sum, d) => sum + d.shop_count, 0);
  const totalRevenue = dist.reduce((sum, d) => sum + d.total_revenue, 0);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Revenue &amp; Commission</h1>
        <p className="text-slate-500 text-sm mt-1">
          Subscription revenue broken down by package, with seller distribution.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 text-sm">Loading revenue data...</p>
      ) : dist.length === 0 ? (
        <p className="text-slate-500 text-sm">No subscriptions recorded yet.</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-7">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="text-[11px] font-bold text-teal-700 bg-teal-50 inline-flex px-2.5 py-1 rounded-full mb-3">
                Total Revenue
              </div>
              <div className="text-2xl font-extrabold text-slate-800">৳{totalRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="text-[11px] font-bold text-sky-700 bg-sky-50 inline-flex px-2.5 py-1 rounded-full mb-3">
                Total Paying Shops
              </div>
              <div className="text-2xl font-extrabold text-slate-800">{totalShops}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 inline-flex px-2.5 py-1 rounded-full mb-3">
                Avg. Revenue / Shop
              </div>
              <div className="text-2xl font-extrabold text-slate-800">
                ৳{totalShops ? Math.round(totalRevenue / totalShops).toLocaleString() : 0}
              </div>
            </div>
          </div>

          {/* Per-package breakdown */}
          <div className="grid grid-cols-3 gap-4">
            {dist.map((d) => {
              const pct = totalShops ? Math.round((d.shop_count / totalShops) * 100) : 0;
              return (
                <div key={d.package} className="bg-white border border-slate-200 rounded-2xl p-5">
                  <div
                    className={`inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full mb-3 capitalize ${
                      packageColors[d.package] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {d.package}
                  </div>
                  <div className="text-2xl font-extrabold text-slate-800 mb-1">{d.shop_count} sellers</div>
                  <div className="text-sm text-slate-500 mb-3">{pct}% of paying shops</div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-teal-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-sm font-bold text-teal-700">
                    ৳{d.total_revenue.toLocaleString()} revenue
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}