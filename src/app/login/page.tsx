// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  async function handleLogin() {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      const userId = data.user?.id;
      if (!userId) throw new Error("Login failed.");

      // Check role and redirect
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", userId)
        .single();

      const role = roleData?.role;
      if (role === "seller") {
        router.push("/dashboard");
      } else if (role === "buyer") {
        router.push("/");
      } else {
        // Fallback — no role found
        router.push("/");
      }
    } catch (e: any) {
      setError(e.message ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-ngray-light w-full max-w-md p-8">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-extrabold text-dark">Welcome back</h1>
          <p className="text-ngray text-sm mt-1">Log in to your Nexora account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ngray mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-ngray mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-orange text-white font-bold py-3 rounded-xl text-sm hover:bg-orange-light transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ngray-light"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-ngray font-bold uppercase tracking-wide">Or continue with</span>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                if (typeof window !== "undefined") {
                  localStorage.setItem("oauth_role_intent", "buyer");
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
            disabled={loading}
            className="w-full bg-white text-dark font-bold py-3 rounded-xl text-sm border border-ngray-light hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <div className="flex justify-between text-xs text-ngray pt-1">
            <p>
              New seller?{" "}
              <Link href="/signup" className="text-orange font-bold no-underline">Register shop</Link>
            </p>
            <p>
              New customer?{" "}
              <Link href="/buyer/signup" className="text-orange font-bold no-underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}