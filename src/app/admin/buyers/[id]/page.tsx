// src/app/admin/buyers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import type { BuyerOrderStats, BuyerInterest } from "@/app/lib/types";

interface OrderRow {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shop_name: string;
  items: string; // joined item names, e.g. "Cake x1, Earbuds x2"
}

export default function BuyerProfilePage() {
  const params = useParams();
  const buyerId = params.id as string;

  const [buyer, setBuyer] = useState<BuyerOrderStats | null>(null);
  const [interests, setInterests] = useState<BuyerInterest[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [
        { data: buyerData, error: buyerErr },
        { data: interestData, error: interestErr },
        { data: orderData, error: orderErr },
      ] = await Promise.all([
        supabase.from("buyer_order_stats").select("*").eq("buyer_id", buyerId).single(),
        supabase.from("buyer_interest_summary").select("*").eq("buyer_id", buyerId),
        supabase
          .from("orders")
          .select(
            "id, total_amount, status, created_at, shops(shop_name), order_items(quantity, products(name))"
          )
          .eq("buyer_id", buyerId)
          .order("created_at", { ascending: false }),
      ]);

      if (buyerErr) setError(buyerErr.message);
      else setBuyer(buyerData as BuyerOrderStats);

      if (interestErr) setError(interestErr.message);
      else setInterests(interestData as BuyerInterest[]);

      if (orderErr) {
        setError(orderErr.message);
      } else {
        const mapped: OrderRow[] = (orderData as any[]).map((o) => ({
          id: o.id,
          total_amount: o.total_amount,
          status: o.status,
          created_at: o.created_at,
          shop_name: o.shops?.shop_name ?? "—",
          items: (o.order_items ?? [])
            .map((it: any) => `${it.products?.name ?? "Item"} x${it.quantity}`)
            .join(", "),
        }));
        setOrders(mapped);
      }

      setLoading(false);
    }
    if (buyerId) load();
  }, [buyerId]);

  const categoryInterests = interests.filter((i) => i.event_type === "category_click");
  const shopInterests = interests.filter((i) => i.event_type === "shop_visit");
  const productInterests = interests.filter((i) => i.event_type === "product_view");

  if (loading) return <p className="text-slate-500 text-sm">Loading profile...</p>;
  if (error) return <p className="text-rose-600 text-sm font-semibold">{error}</p>;
  if (!buyer) return <p className="text-slate-500 text-sm">Customer not found.</p>;

  return (
    <div>
      <Link href="/admin/buyers" className="text-teal-700 text-xs font-bold no-underline hover:underline">
        ← Back to customers
      </Link>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">{buyer.name || "Unnamed customer"}</h1>
          <div className="flex gap-4 mt-2 text-sm text-slate-500">
            <span>📞 {buyer.phone}</span>
            {buyer.email && <span>✉️ {buyer.email}</span>}
            {buyer.city && <span>📍 {buyer.city}</span>}
          </div>
          <div className="text-[11px] text-gray-300 mt-2">
            Joined {new Date(buyer.created_at).toLocaleDateString()} · Last active{" "}
            {new Date(buyer.last_active).toLocaleDateString()}
          </div>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <div className="text-2xl font-extrabold text-slate-800">{buyer.total_orders}</div>
            <div className="text-[11px] text-slate-500">Total orders</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-teal-700">৳{buyer.total_spent.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500">Total spent</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-6">
        {/* Top categories */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3.5">Top categories clicked</h3>
          {categoryInterests.length === 0 ? (
            <p className="text-xs text-slate-500">No category activity yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {categoryInterests.slice(0, 5).map((c) => (
                <div key={c.event_value} className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 capitalize">
                    {c.event_value.replace(/-/g, " ")}
                  </span>
                  <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {c.hits} clicks
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top shops visited */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3.5">Shops visited most</h3>
          {shopInterests.length === 0 ? (
            <p className="text-xs text-slate-500">No shop visits yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {shopInterests.slice(0, 5).map((s) => (
                <div key={s.event_value} className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">{s.event_value}</span>
                  <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {s.hits} visits
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products viewed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3.5">Products viewed most</h3>
          {productInterests.length === 0 ? (
            <p className="text-xs text-slate-500">No product views yet.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {productInterests.slice(0, 5).map((p) => (
                <div key={p.event_value} className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">{p.event_value}</span>
                  <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {p.hits} views
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order history */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800">Order history</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Shop</th>
              <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Items</th>
              <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total</th>
              <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-slate-200">
                <td className="px-5 py-3.5 font-bold text-slate-800">{o.shop_name}</td>
                <td className="px-5 py-3.5 text-slate-500">{o.items || "—"}</td>
                <td className="px-5 py-3.5 font-bold text-teal-700">৳{o.total_amount.toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-500 text-xs">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-sm">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}