// src/app/admin/subscriptions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

interface ShopOption {
  id: string;
  shop_name: string;
  plan: string | null;
}

export default function SubscriptionFormPage() {
  const [shops, setShops] = useState<ShopOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shopId, setShopId] = useState("");
  const [pkg, setPkg] = useState("basic");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [transactionId, setTransactionId] = useState("");
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });

  useEffect(() => {
    async function loadShops() {
      const { data } = await supabase.from("shops").select("id, shop_name, plan").order("shop_name");
      setShops(data as ShopOption[]);
      setLoading(false);
    }
    loadShops();
  }, []);

  // Auto-fill expiry = join + 30 days when join date changes
  function handleJoinDateChange(val: string) {
    setJoinDate(val);
    const d = new Date(val);
    d.setDate(d.getDate() + 30);
    setExpiryDate(d.toISOString().split("T")[0]);
  }

  async function handleSave() {
    if (!shopId || !amountPaid) {
      setError("Shop and amount paid are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Insert subscription
      const { error: subError } = await supabase.from("subscriptions").insert({
        shop_id: shopId,
        package: pkg,
        amount_paid: parseFloat(amountPaid),
        payment_method: paymentMethod,
        transaction_id: transactionId || null,
        join_date: joinDate,
        expiry_date: expiryDate,
        status: "active",
      });
      if (subError) throw subError;

      // Update shop plan to match
      await supabase.from("shops").update({ plan: pkg, is_active: true }).eq("id", shopId);

      setSaved(true);
      setAmountPaid("");
      setTransactionId("");
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const packagePrices: Record<string, string> = {
    basic: "600",
    standard: "1300",
    premium: "2700",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Add Subscription</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manually record a package purchase for a shop after confirming payment.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
          ✓ Subscription added and shop activated!
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg">
        {loading ? (
          <p className="text-slate-500 text-sm">Loading shops...</p>
        ) : (
          <div className="space-y-4">
            {/* Shop select */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Shop</label>
              <select
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="">— Select a shop —</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shop_name} {s.plan ? `(${s.plan})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Package */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Package</label>
              <div className="flex gap-2">
                {["basic", "standard", "premium"].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPkg(p);
                      setAmountPaid(packagePrices[p]);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 capitalize transition-all ${
                      pkg === p
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount paid */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Amount paid (BDT)</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="e.g. 600"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Payment method</label>
              <div className="flex gap-2">
                {["bkash", "nagad", "cash"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 capitalize transition-all ${
                      paymentMethod === m
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-slate-200 text-slate-500"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Transaction ID (optional)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="bKash/Nagad transaction ID"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Join date</label>
                <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => handleJoinDateChange(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Expiry date (auto: +30 days)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-teal-500 transition-colors disabled:opacity-50 mt-2"
            >
              {saving ? "Saving..." : "Add subscription & activate shop"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}