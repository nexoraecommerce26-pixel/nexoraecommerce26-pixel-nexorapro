// src/app/admin/sellers/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";

interface SubscriptionRow {
  subscription_id: string;
  shop_id: string;
  shop_name: string;
  city: string | null;
  phone: string | null;
  owner_name: string | null;
  package: string;
  amount_paid: number;
  payment_method: string | null;
  join_date: string;
  expiry_date: string;
  status: "active" | "expired" | "cancelled";
  days_remaining: number;
}

function statusBadge(days: number, status: string) {
  if (status === "cancelled") return { label: "Cancelled", cls: "bg-slate-100 text-slate-500" };
  if (days < 0) return { label: "Expired", cls: "bg-rose-50 text-rose-600" };
  if (days <= 5) return { label: "Expiring soon", cls: "bg-amber-50 text-amber-600" };
  return { label: "Active", cls: "bg-emerald-50 text-emerald-700" };
}

export default function SellersSubscriptionsPage() {
  const [rows, setRows] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [packageFilter, setPackageFilter] = useState("all");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("shop_subscription_status")
      .select("*")
      .order("days_remaining", { ascending: true });
    if (error) setError(error.message);
    else setRows(data as SubscriptionRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        !search ||
        r.shop_name.toLowerCase().includes(search.toLowerCase()) ||
        r.phone?.includes(search) ||
        r.owner_name?.toLowerCase().includes(search.toLowerCase());
      const matchesPackage = packageFilter === "all" || r.package === packageFilter;
      return matchesSearch && matchesPackage;
    });
  }, [rows, search, packageFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Sellers &amp; Subscriptions
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Every shop&apos;s package, join date, and how many days are left before renewal is due.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Search shop, owner, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm flex-1 max-w-xs focus:outline-none focus:border-teal-500"
        />
        <select
          value={packageFilter}
          onChange={(e) => setPackageFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
        >
          <option value="all">All packages</option>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading subscriptions...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Shop</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Owner / Phone</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Package</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Amount Paid</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Join Date</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Expiry Date</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Days Remaining</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const badge = statusBadge(r.days_remaining, r.status);
                return (
                  <tr key={r.subscription_id} className="border-t border-slate-100">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-800">{r.shop_name}</div>
                      <div className="text-[11px] text-slate-400">{r.city}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-700">{r.owner_name || "—"}</div>
                      <div className="text-[11px] text-slate-400">{r.phone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                        {r.package}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">
                      ৳{r.amount_paid.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      {new Date(r.join_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      {new Date(r.expiry_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 font-bold">
                      <span className={r.days_remaining <= 5 ? "text-rose-600" : "text-slate-700"}>
                        {r.days_remaining < 0 ? `${Math.abs(r.days_remaining)} days overdue` : `${r.days_remaining} days`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400 text-sm">
                    No subscriptions found.
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