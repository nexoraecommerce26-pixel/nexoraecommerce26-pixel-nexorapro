"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function LoginCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function handleSession() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session || !session.user) {
          // If no session yet, we listen for onAuthStateChange
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, currentSession: any) => {
            if (active && currentSession?.user) {
              subscription.unsubscribe();
              await processUser(currentSession.user);
            }
          });
          
          // Set a timeout of 10 seconds to avoid hanging forever
          const timer = setTimeout(() => {
            if (active) {
              subscription.unsubscribe();
              setError("Authentication timed out or failed. Please try again.");
            }
          }, 10000);

          return () => {
            clearTimeout(timer);
            subscription.unsubscribe();
          };
        }

        await processUser(session.user);
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        setError(err.message || "Failed to process login.");
      }
    }

    async function processUser(user: any) {
      if (!active) return;
      try {
        // Fetch existing role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("id", user.id)
          .single();

        let role = roleData?.role;

        if (!role) {
          // Check role intent from localStorage
          const intent = typeof window !== "undefined" ? localStorage.getItem("oauth_role_intent") : null;
          if (intent === "seller") {
            role = "seller";
            // Create user role record
            await supabase.from("user_roles").insert({ id: user.id, role: "seller" });
            
            // Create seller profile
            await supabase.from("sellers").insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Seller",
              phone: user.user_metadata?.phone || "",
              email: user.email,
            });
          } else {
            role = "buyer";
            // Create user role record
            await supabase.from("user_roles").insert({ id: user.id, role: "buyer" });

            // Create buyer profile
            await supabase.from("buyers").insert({
              id: user.id,
              name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Buyer",
              phone: user.user_metadata?.phone || "",
              email: user.email,
              city: "",
            });
          }
        }

        // Redundant communication channels to ensure message reaches the parent window under iframe/sandbox restrictions
        if (typeof window !== "undefined") {
          // 1. Set localStorage key (monitored by parent storage listener and polling)
          localStorage.setItem("supabase_auth_success", JSON.stringify({ role, timestamp: Date.now() }));

          // 2. Broadcast via BroadcastChannel
          try {
            const channel = new BroadcastChannel("supabase_auth");
            channel.postMessage({ type: "SUPABASE_AUTH_SUCCESS", role });
            channel.close();
          } catch (bcErr) {
            console.error("BroadcastChannel postMessage error:", bcErr);
          }

          // 3. Standard window.opener postMessage
          if (window.opener) {
            try {
              window.opener.postMessage({ type: "SUPABASE_AUTH_SUCCESS", role }, "*");
            } catch (pmErr) {
              console.error("window.opener.postMessage error:", pmErr);
            }
          }

          // 4. Close popup after a short delay, with fallback redirect if close is blocked
          setTimeout(() => {
            try {
              window.close();
            } catch (closeErr) {
              console.error("window.close() error:", closeErr);
            }
            // If the window didn't close (e.g. because it wasn't opened via script or browser blocked it),
            // redirect the window itself to the appropriate home or dashboard.
            setTimeout(() => {
              window.location.href = role === "seller" ? "/dashboard" : "/";
            }, 800);
          }, 600);
        }
      } catch (err: any) {
        console.error("Error processing user profile:", err);
        setError(err.message || "Failed to complete account registration.");
      }
    }

    handleSession();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-ngray-light w-full max-w-md p-8 text-center shadow-sm">
        <div className="flex flex-col items-center">
          {!error ? (
            <>
              <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-bold text-dark">Completing Sign-In...</h2>
              <p className="text-sm text-ngray mt-2">
                We are configuring your account. This window will close automatically.
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl font-bold mb-4">
                ✕
              </div>
              <h2 className="text-xl font-bold text-red-600">Authentication Failed</h2>
              <p className="text-sm text-ngray mt-2">{error}</p>
              <button
                onClick={() => window.close()}
                className="mt-6 bg-orange text-white font-bold py-2 px-6 rounded-xl text-sm hover:bg-orange-light transition-colors"
              >
                Close Window
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
