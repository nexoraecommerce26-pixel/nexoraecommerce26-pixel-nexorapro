// src/app/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

const packages = [
  { id: "basic", label: "Basic", price: "৳600/mo", features: ["3 themes", "Basic dashboard", "2% commission"] },
  { id: "standard", label: "Standard", price: "৳1,300/mo", features: ["3 themes", "Revenue charts", "2% commission"] },
  { id: "premium", label: "Premium", price: "৳2,700/mo", features: ["3 premium themes", "Full analytics", "2.5% commission"] },
];

export default function SellerSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    function handleSuccess(role: string) {
      if (!active) return;
      if (role === "seller") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    }

    // 1. Listen via postMessage
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "SUPABASE_AUTH_SUCCESS") {
        handleSuccess(event.data?.role);
      }
    }
    window.addEventListener("message", handleMessage);

    // 2. Listen via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("supabase_auth");
      channel.onmessage = (event) => {
        if (event.data?.type === "SUPABASE_AUTH_SUCCESS") {
          handleSuccess(event.data?.role);
        }
      };
    } catch (e) {
      console.error("BroadcastChannel setup error:", e);
    }

    // 3. Listen via StorageEvent (cross-window storage changes)
    function handleStorage(event: StorageEvent) {
      if (event.key === "supabase_auth_success" && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed?.role) {
            localStorage.removeItem("supabase_auth_success");
            handleSuccess(parsed.role);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    window.addEventListener("storage", handleStorage);

    // 4. Poller fallback in case events are throttled/blocked
    const poller = setInterval(() => {
      const stored = localStorage.getItem("supabase_auth_success");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.role) {
            localStorage.removeItem("supabase_auth_success");
            handleSuccess(parsed.role);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }, 1000);

    return () => {
      active = false;
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
      clearInterval(poller);
      if (channel) {
        channel.close();
      }
    };
  }, [router]);

  // Step 1 — account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 — shop info
  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  // Step 3 — package
  const [selectedPackage, setSelectedPackage] = useState("basic");

  // Step 4 — payment
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [transactionId, setTransactionId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  // Step 5 — done
  const [done, setDone] = useState(false);

  async function handleStep1() {
    if (!email || !password || !fullName || !phone) {
      setError("All fields are required.");
      return;
    }
    setError(null);
    setStep(2);
  }

  async function handleStep2() {
    if (!shopName || !category || !city) {
      setError("Shop name, category, and city are required.");
      return;
    }
    setError(null);
    setStep(3);
  }

  async function handleStep3() {
    setError(null);
    setStep(4);
  }

  async function handleSubmit() {
    if (!transactionId) {
      setError("Transaction ID is required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone, role: "seller" } },
      });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error("Signup failed — no user ID returned.");

      // 2. Insert into sellers table
      const { error: sellerError } = await supabase.from("sellers").insert({
        id: userId,
        full_name: fullName,
        phone,
        email,
      });
      if (sellerError) throw sellerError;

      // 3. Insert user role
      const { error: roleError } = await supabase.from("user_roles").insert({
        id: userId,
        role: "seller",
      });
      if (roleError) throw roleError;

      // 4. Submit pending confirmation for admin review
      const { error: pendingError } = await supabase.from("pending_confirmations").insert({
        shop_name: shopName,
        owner_name: fullName,
        phone,
        email,
        package: selectedPackage,
        transaction_id: transactionId,
        payment_method: paymentMethod,
        amount_paid: parseFloat(amountPaid) || 0,
        seller_user_id: userId,
      });
      if (pendingError) throw pendingError;

      setDone(true);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const selectedPkg = packages.find((p) => p.id === selectedPackage)!;

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full border border-slate-200">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Application submitted!</h1>
          <p className="text-slate-500 text-sm mb-6">
            Our team will review your payment and call you within 24 hours to activate your shop.
          </p>
          <div className="bg-teal-50 rounded-xl p-4 text-left text-sm text-teal-700 font-medium space-y-1.5 mb-6">
            <div>✓ Shop: <span className="font-bold">{shopName}</span></div>
            <div>✓ Package: <span className="font-bold capitalize">{selectedPackage}</span></div>
            <div>✓ Transaction ID: <span className="font-bold">{transactionId}</span></div>
          </div>
          <Link href="/login" className="text-teal-600 text-sm font-bold no-underline hover:underline">
            Go to login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-extrabold text-slate-800">Become a seller</h1>
          <p className="text-slate-500 text-sm mt-1">Step {step} of 4</p>
          {/* Progress bar */}
          <div className="flex gap-1.5 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-teal-500" : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        {/* Step 1 — Account */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-700 mb-1">Your account</h2>
            {[
              { label: "Full name", value: fullName, set: setFullName, type: "text", placeholder: "Your name" },
              { label: "Phone", value: phone, set: setPhone, type: "tel", placeholder: "01XXXXXXXXX" },
              { label: "Email", value: email, set: setEmail, type: "email", placeholder: "you@example.com" },
              { label: "Password", value: password, set: setPassword, type: "password", placeholder: "Min 6 characters" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            ))}
            <button
              onClick={handleStep1}
              className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-teal-500 transition-colors mt-2"
            >
              Next →
            </button>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400 font-bold uppercase tracking-wide">Or signup with</span>
              </div>
            </div>

            <button
              onClick={async () => {
                try {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("oauth_role_intent", "seller");
                  }
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login/callback` : undefined,
                      skipBrowserRedirect: true,
                    }
                  });
                  if (error) {
                    if (error.message?.includes("provider") || error.message?.includes("disabled") || error.message?.includes("not enabled")) {
                      throw new Error("Google Sign-In is not enabled in your Supabase Dashboard. Please enable Google Provider in Supabase > Authentication > Providers.");
                    }
                    throw error;
                  }
                  if (data?.url) {
                    const width = 600;
                    const height = 700;
                    const left = window.screenX + (window.outerWidth - width) / 2;
                    const top = window.screenY + (window.outerHeight - height) / 2;
                    const popup = window.open(
                      data.url,
                      "Google Sign-In",
                      `width=${width},height=${height},left=${left},top=${top}`
                    );
                    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                      // Popup blocked by browser, redirect current window
                      window.location.href = data.url;
                    }
                  } else {
                    throw new Error("Could not retrieve Google authorize URL.");
                  }
                } catch (err: any) {
                  setError(err.message || "Failed to initiate Google sign-in.");
                }
              }}
              className="w-full bg-white text-slate-700 font-bold py-3 rounded-xl text-sm border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            <p className="text-center text-xs text-slate-400 mt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-600 font-bold no-underline">Log in</Link>
            </p>
          </div>
        )}

        {/* Step 2 — Shop info */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-700 mb-1">Your shop</h2>
            {[
              { label: "Shop name", value: shopName, set: setShopName, placeholder: "e.g. Rima's Bakery" },
              { label: "Category", value: category, set: setCategory, placeholder: "e.g. Food & Cake" },
              { label: "City", value: city, set: setCity, placeholder: "e.g. Dhaka" },
              { label: "Address", value: address, set: setAddress, placeholder: "Full address (optional)" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">{f.label}</label>
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            ))}
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm hover:border-slate-400 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleStep2}
                className="flex-1 bg-teal-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-teal-500 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Package */}
        {step === 3 && (
          <div>
            <h2 className="text-base font-bold text-slate-700 mb-4">Choose your package</h2>
            <div className="space-y-3 mb-5">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedPackage === pkg.id
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 capitalize">{pkg.label}</span>
                    <span className="font-extrabold text-teal-600">{pkg.price}</span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {pkg.features.map((f) => (
                      <span key={f} className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm hover:border-slate-400 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleStep3}
                className="flex-1 bg-teal-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-teal-500 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Payment */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-700 mb-1">Payment</h2>
            <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800 font-medium">
              Send <span className="font-extrabold">{selectedPkg.price}</span> to:
              <div className="mt-1.5 font-bold">bKash / Nagad: 01XXXXXXXXX</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Payment method</label>
              <div className="flex gap-2.5">
                {["bkash", "nagad"].map((m) => (
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
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Transaction ID</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="bKash/Nagad transaction ID"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => setStep(3)}
                className="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-sm hover:border-slate-400 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-teal-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-teal-500 transition-colors disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit & Wait for Confirmation"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}