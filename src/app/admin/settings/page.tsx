// src/app/admin/settings/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/app/lib/supabase";

interface Setting {
  key: string;
  value: string;
  label: string;
}

interface DeploymentReport {
  databaseId: string;
  databaseResolved: "created" | "existed" | "failed" | "none";
  collectionsCreated: number;
  collectionsExisted: number;
  attributesCreated: number;
  attributesExisted: number;
  documentsSeeded: number;
  documentsSkipped: number;
  executionTimeMs: number;
  hasErrors: boolean;
  errorMessage: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  // Appwrite configuration states

  // Server key state
  const [hasServerApiKey, setHasServerApiKey] = useState(false);

  // Supabase configuration states
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [hasServerSupabaseUrl, setHasServerSupabaseUrl] = useState(false);

  // Appwrite Automated Setup states

  // Supabase Automated Setup states
  const [supabaseLogs, setSupabaseLogs] = useState<string[]>([]);
  const [isSupabaseSettingUp, setIsSupabaseSettingUp] = useState(false);
  const [supabaseSuccess, setSupabaseSuccess] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [supabaseReport, setSupabaseReport] = useState<any>(null);
  const [supabaseProgress, setSupabaseProgress] = useState(0);

  // Legacy seeder fallback states

  const supabaseConsoleEndRef = useRef<HTMLDivElement>(null);
  const supabaseProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function load() {
      // 1. Fetch platform settings from Supabase
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*");
      if (error) setError(error.message);
      else {
        setSettings(data as Setting[]);
        const v: Record<string, string> = {};
        (data as Setting[]).forEach((s) => {
          v[s.key] = s.value ?? "";
        });
        setValues(v);
      }
      setLoading(false);

      // 3. Fetch server-side Supabase configuration status and defaults
      try {
        const res = await fetch("/api/supabase/setup");
        if (res.ok) {
          const config = await res.json();
          setHasServerSupabaseUrl(config.hasDatabaseUrlConfigured);
        }
      } catch (err) {
        console.error(
          "Failed to fetch Supabase server configuration details:",
          err,
        );
      }
    }
    load();
  }, []);

  // Scroll supabase console to bottom when logs update
  useEffect(() => {
    if (supabaseConsoleEndRef.current) {
      supabaseConsoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [supabaseLogs]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (supabaseProgressIntervalRef.current)
        clearInterval(supabaseProgressIntervalRef.current);
    };
  }, []);
  async function handleSupabaseSetup() {
    if (!hasServerSupabaseUrl && !supabaseUrl.trim()) {
      setSupabaseError("A Supabase PostgreSQL Connection URL is required.");
      return;
    }

    setIsSupabaseSettingUp(true);
    setSupabaseSuccess(false);
    setSupabaseError(null);
    setSupabaseReport(null);
    setSupabaseProgress(2);
    setSupabaseLogs([
      "[System] Initiating secure automated Supabase PostgreSQL schema provisioning...",
      "[System] Connecting to Next.js setup agent and parsing database URL payload...",
    ]);

    if (supabaseProgressIntervalRef.current)
      clearInterval(supabaseProgressIntervalRef.current);

    let currentProgress = 2;
    supabaseProgressIntervalRef.current = setInterval(() => {
      if (currentProgress < 40) {
        currentProgress += Math.floor(Math.random() * 8) + 4;
      } else if (currentProgress < 85) {
        currentProgress += Math.floor(Math.random() * 4) + 1;
      } else if (currentProgress < 97) {
        currentProgress += 1;
      }
      setSupabaseProgress(Math.min(currentProgress, 97));
    }, 300);

    try {
      const res = await fetch("/api/supabase/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connectionUrl: supabaseUrl.trim() || undefined,
        }),
      });

      if (supabaseProgressIntervalRef.current) {
        clearInterval(supabaseProgressIntervalRef.current);
        supabaseProgressIntervalRef.current = null;
      }

      const data = await res.json();
      if (data.success) {
        setSupabaseProgress(100);
        setSupabaseLogs(data.logs || []);
        setSupabaseSuccess(true);
        setSupabaseReport(data.report || null);
      } else {
        setSupabaseProgress(0);
        setSupabaseError(
          data.error ||
            "An error occurred during Supabase PostgreSQL provisioning.",
        );
        if (data.logs) {
          setSupabaseLogs(data.logs);
        }
        if (data.report) {
          setSupabaseReport(data.report);
        }
      }
    } catch (e: any) {
      if (supabaseProgressIntervalRef.current) {
        clearInterval(supabaseProgressIntervalRef.current);
        supabaseProgressIntervalRef.current = null;
      }
      setSupabaseProgress(0);
      setSupabaseError(
        "Supabase setup request encountered an exception: " + e.message,
      );
    } finally {
      setIsSupabaseSettingUp(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      for (const key of Object.keys(values)) {
        const { error } = await supabase
          .from("platform_settings")
          .update({ value: values[key], updated_at: new Date().toISOString() })
          .eq("key", key);
        if (error) throw error;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const groups = [
    {
      title: "Package Pricing (BDT/month)",
      keys: ["price_basic", "price_standard", "price_premium"],
    },
    {
      title: "Commission Rates (%)",
      keys: ["commission_basic", "commission_standard", "commission_premium"],
    },
    {
      title: "Payment Numbers",
      keys: ["bkash_number", "nagad_number"],
    },
    {
      title: "Platform",
      keys: ["site_name", "support_phone"],
    },
  ];

  return (
    <div className="pb-16 max-w-7xl mx-auto px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            System Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Platform-wide management and database configuration for Nexora.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-teal-500 transition-colors disabled:opacity-50 shadow-md shadow-teal-700/10 cursor-pointer self-start sm:self-auto"
        >
          {saving
            ? "Saving..."
            : saved
              ? "✓ Config Saved!"
              : "Save all variables"}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold px-5 py-4 rounded-xl mb-6 shadow-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Dynamic 1-Click Supabase Schema & Database Provisioner */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 md:p-8 mb-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2.5">
              <span className="p-2 bg-sky-500/10 text-sky-400 rounded-xl text-sm border border-sky-500/20">
                ⚡
              </span>
              Supabase PostgreSQL Autopilot Schema & Seeder
            </h2>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">
              Compile relational schemas, map database tables, run PostgreSQL
              DDL operations, and seed static datasets on your Supabase
              instance. Highly secured, idempotent, and executed entirely
              server-side.
            </p>
          </div>
          <span className="text-xs font-semibold bg-sky-500/10 text-sky-400 px-3 py-1.5 rounded-full flex items-center gap-2 border border-sky-500/20 self-start">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            PostgreSQL Active
          </span>
        </div>

        {/* Progress Bar Container */}
        {isSupabaseSettingUp && (
          <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span className="font-bold flex items-center gap-2">
                <span className="animate-spin inline-block w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full"></span>
                Running DDL transactions & seeding tables...
              </span>
              <span className="font-mono text-sky-400 font-bold">
                {supabaseProgress}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-blue-400 h-2.5 rounded-full transition-all duration-300 shadow-md shadow-sky-500/35"
                style={{ width: `${supabaseProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 pt-6 border-t border-slate-800">
          {/* Controls Form */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Supabase PostgreSQL Connection String (URI)</span>
                {hasServerSupabaseUrl && (
                  <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1 normal-case">
                    🔒 Server Env Active
                  </span>
                )}
              </label>
              <input
                type="password"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                disabled={isSupabaseSettingUp}
                placeholder={
                  hasServerSupabaseUrl
                    ? "•••••••••••••••• (Using Server Env String)"
                    : "postgresql://postgres:password@db.supabase.co:5432/postgres"
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-sky-400 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 disabled:opacity-50"
              />
              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                {hasServerSupabaseUrl
                  ? "We detected a secure server-side SUPABASE_DATABASE_URL. You may leave this empty to use the server key."
                  : "Requires a valid Supabase database password. Ensure standard URI formatting. Brackets [] in passwords will be cleaned automatically."}
              </p>
            </div>

            <button
              onClick={handleSupabaseSetup}
              disabled={
                isSupabaseSettingUp || (!hasServerSupabaseUrl && !supabaseUrl)
              }
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 shadow-lg shadow-sky-950/40 cursor-pointer"
            >
              {isSupabaseSettingUp ? (
                <>
                  <span className="animate-spin">⌛</span> Executing PostgreSQL
                  Queries...
                </>
              ) : (
                <>⚙️ Deploy Relational Tables</>
              )}
            </button>

            {supabaseSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl leading-relaxed">
                🎉 **Supabase database successfully initialized!** Tables mapped
                and seed records published. Ready for high-volume transactions.
              </div>
            )}

            {supabaseError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-4 rounded-xl">
                ⚠️ **Deployment Error:** {supabaseError}
              </div>
            )}
          </div>

          {/* Console Output & Report Card */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[360px]">
            {/* Deployment Report Card (When Success) */}
            {supabaseReport && (
              <div className="mb-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  PostgreSQL Deployment Report
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800/60 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500">Database</span>
                    <span className="text-xs font-bold text-sky-400 mt-1 capitalize">
                      {supabaseReport.databaseResolved === "connected"
                        ? "✓ Connected"
                        : "❌ Failed"}
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/60 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500">
                      Tables Configured
                    </span>
                    <span className="text-xs font-bold text-white mt-1">
                      {supabaseReport.tablesCreated +
                        supabaseReport.tablesExisted}{" "}
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({supabaseReport.tablesCreated} new)
                      </span>
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/60 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500">
                      Records Seeded
                    </span>
                    <span className="text-xs font-bold text-emerald-400 mt-1">
                      {supabaseReport.documentsSeeded}{" "}
                      <span className="text-[10px] text-slate-500 font-normal">
                        rows
                      </span>
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/60 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500">
                      Execution Time
                    </span>
                    <span className="text-xs font-bold text-sky-300 mt-1">
                      {(supabaseReport.executionTimeMs / 1000).toFixed(2)}s
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Live Terminal Output */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 rounded-t-xl border border-slate-800 border-b-0">
                <span className="text-[11px] font-bold text-slate-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  supabase_postgres_stdout.log
                </span>
                <button
                  onClick={() => setSupabaseLogs([])}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Clear Console
                </button>
              </div>
              <div className="flex-1 min-h-[160px] bg-slate-950/90 rounded-b-xl p-4 font-mono text-[11px] text-slate-300 overflow-y-auto max-h-[250px] border border-slate-800 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                {supabaseLogs.length === 0 ? (
                  <div className="text-slate-600 italic">
                    Console is idle. Tap "Deploy Relational Tables" to execute
                    DDL transactions against your Supabase host.
                  </div>
                ) : (
                  supabaseLogs.map((log, index) => {
                    let colorClass = "text-slate-300";
                    if (log.includes("✓")) colorClass = "text-emerald-400";
                    if (
                      log.includes("❌") ||
                      log.includes("Error") ||
                      log.includes("Failed")
                    )
                      colorClass = "text-rose-400 font-bold";
                    if (log.includes("Warning") || log.includes("⚠️"))
                      colorClass = "text-amber-400";
                    if (log.includes("Seeding table"))
                      colorClass =
                        "text-sky-400 font-semibold border-t border-slate-800/40 pt-1 mt-1";
                    if (log.includes("Step "))
                      colorClass = "text-sky-400 font-bold";
                    if (log.includes("Successfully") || log.includes("Success"))
                      colorClass = "text-sky-300 font-bold";

                    return (
                      <div
                        key={index}
                        className={`${colorClass} leading-relaxed`}
                      >
                        {log}
                      </div>
                    );
                  })
                )}
                <div ref={supabaseConsoleEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform settings section */}
      {loading ? (
        <p className="text-slate-500 text-sm">
          Loading standard configurations...
        </p>
      ) : (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-lg font-extrabold text-slate-800">
              Operational Platform Constants
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Modify pricing tiers, mobile banking payment channels, and brand
              names dynamically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <div
                key={group.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-4 pb-2 border-b border-slate-50">
                    {group.title}
                  </h3>
                  <div className="space-y-4">
                    {group.keys.map((key) => {
                      const setting = settings.find((s) => s.key === key);
                      if (!setting) return null;
                      return (
                        <div key={key}>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">
                            {setting.label}
                          </label>
                          <input
                            type="text"
                            value={values[key] ?? ""}
                            onChange={(e) =>
                              setValues((v) => ({
                                ...v,
                                [key]: e.target.value,
                              }))
                            }
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 bg-slate-50/50 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
