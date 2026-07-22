// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

interface OverviewStats {
  total_active_shops: number;
  total_buyers: number;
  total_subscription_revenue: number;
  revenue_this_month: number;
  expiring_in_2_days: number;
  offline_shops: number;
  total_order_volume: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("admin_overview_stats")
        .select("*")
        .single();
      if (error) setError(error.message);
      else setStats(data as OverviewStats);
      setLoading(false);
    }
    load();
  }, []);

  const cards = stats
    ? [
        { label: "Total Revenue (subscriptions)", value: `৳${stats.total_subscription_revenue.toLocaleString()}`, color: "bg-teal-50 text-teal-700" },
        { label: "Revenue This Month", value: `৳${stats.revenue_this_month.toLocaleString()}`, color: "bg-teal-50 text-teal-700" },
        { label: "Total Order Volume", value: `৳${stats.total_order_volume.toLocaleString()}`, color: "bg-teal-50 text-teal-700" },
        { label: "Total Active Shops", value: stats.total_active_shops, color: "bg-emerald-50 text-emerald-700" },
        { label: "Total Buyers", value: stats.total_buyers, color: "bg-sky-50 text-sky-700" },
        { label: "Expiring in 2 Days", value: stats.expiring_in_2_days, color: "bg-rose-50 text-rose-700" },
        { label: "Offline Shops", value: stats.offline_shops, color: "bg-slate-100 text-slate-600" },
      ]
    : [];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Platform-wide snapshot of Nexora.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 text-sm">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className={`inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full mb-3 ${card.color}`}>
                {card.label}
              </div>
              <div className="text-2xl font-extrabold text-slate-800">{card.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}