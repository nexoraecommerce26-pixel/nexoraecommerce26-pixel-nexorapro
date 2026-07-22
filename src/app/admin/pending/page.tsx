// src/app/admin/pending/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

interface PendingRow {
  id: string;
  shop_name: string;
  owner_name: string;
  phone: string;
  email: string | null;
  package: string;
  transaction_id: string | null;
  payment_method: string | null;
  amount_paid: number;
  note: string | null;
  status: "pending" | "confirmed" | "rejected";
  seller_user_id: string | null;
  submitted_at: string;
}

export default function PendingConfirmationsPage() {
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("pending_confirmations")
      .select("*")
      .order("submitted_at", { ascending: true });
    if (error) setError(error.message);
    else setRows(data as PendingRow[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleConfirm(row: PendingRow) {
    setActionLoading(true);
    try {
      // 1. Mark confirmation as confirmed
      const { error: confError } = await supabase
        .from("pending_confirmations")
        .update({ status: "confirmed", reviewed_at: new Date().toISOString() })
        .eq("id", row.id);
      if (confError) throw confError;

      // 2. Create the shop for this seller
      if (row.seller_user_id) {
        const slug = row.shop_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const shopId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `shop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const { error: shopError } = await supabase.from("shops").insert({
          id: shopId,
          seller_id: row.seller_user_id,
          shop_name: row.shop_name,
          slug,
          plan: row.package,
          is_active: true,
        });
        if (shopError) throw shopError;

        // 3. Create subscription record
        const joinDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const { data: shopData } = await supabase
          .from("shops")
          .select("id")
          .eq("seller_id", row.seller_user_id)
          .single();

        if (shopData) {
          const subId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          await supabase.from("subscriptions").insert({
            id: subId,
            shop_id: shopData.id,
            package: row.package,
            amount_paid: row.amount_paid,
            payment_method: row.payment_method,
            transaction_id: row.transaction_id,
            join_date: joinDate.toISOString().split("T")[0],
            expiry_date: expiryDate.toISOString().split("T")[0],
            status: "active",
          });
        }
      }

      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) {
      setError("Please enter a reason for rejection.");
      return;
    }
    setActionLoading(true);
    try {
      await supabase
        .from("pending_confirmations")
        .update({
          status: "rejected",
          rejected_reason: rejectReason,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);
      setRejectingId(null);
      setRejectReason("");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  const pending = rows.filter((r) => r.status === "pending");
  const reviewed = rows.filter((r) => r.status !== "pending");

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 0) return `${h}h ${m}m ago`;
    return `${m}m ago`;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Pending Confirmations</h1>
        <p className="text-slate-500 text-sm mt-1">
          New seller signups waiting for your review. Oldest first.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : pending.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm">
          No pending confirmations 🎉
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {pending.map((row) => (
            <div key={row.id} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="font-extrabold text-slate-800 text-base">{row.shop_name}</span>
                    <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                      {row.package}
                    </span>
                    <span className="text-[11px] text-slate-400">{timeAgo(row.submitted_at)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-500 mt-2">
                    <span>👤 {row.owner_name}</span>
                    <span>📞 {row.phone}</span>
                    {row.email && <span>✉️ {row.email}</span>}
                    <span>💳 {row.payment_method ?? "—"}: <strong className="text-slate-700">৳{row.amount_paid}</strong></span>
                    <span>🔑 TxID: <strong className="text-slate-700">{row.transaction_id ?? "—"}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                {rejectingId === row.id ? (
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <textarea
                      placeholder="Reason for rejection..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none h-16 focus:outline-none focus:border-rose-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(row.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-rose-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
                      >
                        Confirm reject
                      </button>
                      <button
                        onClick={() => setRejectingId(null)}
                        className="flex-1 border border-slate-200 text-slate-500 text-xs font-bold py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirm(row)}
                      disabled={actionLoading}
                      className="bg-teal-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-teal-500 transition-colors disabled:opacity-50"
                    >
                      ✓ Confirm & Activate
                    </button>
                    <button
                      onClick={() => setRejectingId(row.id)}
                      className="border border-rose-200 text-rose-500 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviewed history */}
      {reviewed.length > 0 && (
        <>
          <h2 className="text-base font-bold text-slate-600 mb-3">Recently reviewed</h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Shop</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Owner</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Package</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-bold text-slate-800">{row.shop_name}</td>
                    <td className="px-5 py-3 text-slate-500">{row.owner_name}</td>
                    <td className="px-5 py-3">
                      <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                        {row.package}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-700">৳{row.amount_paid}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        row.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-600"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}