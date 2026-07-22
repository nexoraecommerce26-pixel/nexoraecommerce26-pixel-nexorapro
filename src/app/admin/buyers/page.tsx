// src/app/admin/buyers/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import type { BuyerOrderStats } from "@/app/lib/types";

type SortKey = "orders" | "spent" | "recent" | "name";

export default function BuyersAdminPage() {
  const [buyers, setBuyers] = useState<BuyerOrderStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("orders");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("buyer_order_stats").select("*");
    if (error) setError(error.message);
    else setBuyers(data as BuyerOrderStats[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const cities = useMemo(() => {
    const set = new Set(buyers.map((b) => b.city).filter(Boolean) as string[]);
    return ["all", ...Array.from(set)];
  }, [buyers]);

  const filtered = useMemo(() => {
    let rows = buyers.filter((b) => {
      const matchesSearch =
        !search ||
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.phone?.includes(search) ||
        b.email?.toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === "all" || b.city === cityFilter;
      return matchesSearch && matchesCity;
    });

    rows = [...rows].sort((a, b) => {
      switch (sortKey) {
        case "orders":
          return b.total_orders - a.total_orders;
        case "spent":
          return b.total_spent - a.total_spent;
        case "recent":
          return (
            new Date(b.last_order_at ?? b.created_at).getTime() -
            new Date(a.last_order_at ?? a.created_at).getTime()
          );
        case "name":
          return (a.name ?? "").localeCompare(b.name ?? "");
      }
    });

    return rows;
  }, [buyers, search, cityFilter, sortKey]);

  function exportCSV() {
    const header = ["#", "Name", "Phone", "Email", "City", "Total Orders", "Total Spent", "Last Order"];
    const rows = filtered.map((b, i) => [
      i + 1,
      b.name ?? "",
      b.phone,
      b.email ?? "",
      b.city ?? "",
      b.total_orders,
      b.total_spent,
      b.last_order_at ?? "",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexora-customers.csv";
    a.click();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Customers</h1>
          <p className="text-slate-500 text-sm mt-1">
            Every buyer who has signed up or placed an order, with order history.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="text-sm font-bold text-teal-700 border border-teal-500/30 px-4 py-2.5 rounded-full hover:bg-teal-50 transition-colors"
        >
          Export to CSV
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Search name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm flex-1 max-w-xs focus:outline-none focus:border-teal-500"
        />
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All cities" : c}
            </option>
          ))}
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
        >
          <option value="orders">Sort: Most orders</option>
          <option value="spent">Sort: Highest spend</option>
          <option value="recent">Sort: Most recent order</option>
          <option value="name">Sort: Name (A–Z)</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Loading customers...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">#</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Phone</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">City</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Orders</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total spent</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.buyer_id} className="border-t border-slate-200 hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 text-slate-500">{i + 1}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">{b.name || "—"}</td>
                  <td className="px-5 py-3.5">{b.phone}</td>
                  <td className="px-5 py-3.5 text-slate-500">{b.email || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-500">{b.city || "—"}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">{b.total_orders}</td>
                  <td className="px-5 py-3.5 font-bold text-teal-700">৳{b.total_spent.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/buyers/${b.buyer_id}`}
                      className="text-teal-700 text-xs font-bold no-underline hover:underline"
                    >
                      View profile →
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500 text-sm">
                    No customers found.
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