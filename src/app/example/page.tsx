// src/app/example/page.tsx
"use client";

import Link from "next/link";
import { PACKAGE_CONFIG, PackageId } from "./mockData";

function NexoraLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nGLanding" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C5A" />
          <stop offset="50%" stopColor="#FF5C1A" />
          <stop offset="100%" stopColor="#C43A08" />
        </linearGradient>
      </defs>
      <rect x="28" y="35" width="52" height="148" rx="14" fill="url(#nGLanding)" />
      <rect x="120" y="35" width="52" height="148" rx="14" fill="url(#nGLanding)" />
      <polygon points="80,35 120,120 120,35" fill="url(#nGLanding)" />
      <polygon points="80,35 120,183 80,183" fill="#C43A08" opacity="0.35" />
      <path d="M55 22 Q100 2 145 22" fill="none" stroke="#1A1A1A" strokeWidth="13" strokeLinecap="round" />
      <circle cx="55" cy="22" r="8" fill="#1A1A1A" />
      <circle cx="145" cy="22" r="8" fill="#1A1A1A" />
    </svg>
  );
}

const packages = Object.values(PACKAGE_CONFIG);

const comparisonRows = [
  { label: "Commission", starter: "2.5%", growth: "2.0%", pro: "1.0%" },
  { label: "Products", starter: "100", growth: "1,000", pro: "Unlimited" },
  { label: "Themes", starter: "3", growth: "8 premium", pro: "All + luxury" },
  { label: "Analytics", starter: "Basic", growth: "Advanced", pro: "Business Intelligence" },
  { label: "Coupons & Flash Sale", starter: "❌", growth: "✅", pro: "✅" },
  { label: "SEO Tools", starter: "❌", growth: "✅", pro: "✅" },
  { label: "Facebook Pixel", starter: "❌", growth: "✅", pro: "✅" },
  { label: "AI Tools", starter: "❌", growth: "❌", pro: "✅" },
  { label: "Staff Accounts", starter: "❌", growth: "❌", pro: "✅" },
  { label: "Loyalty Points", starter: "❌", growth: "❌", pro: "✅" },
  { label: "Email Campaigns", starter: "❌", growth: "❌", pro: "✅" },
  { label: "Premium Badge", starter: "❌", growth: "❌", pro: "✅" },
  { label: "Priority Support", starter: "❌", growth: "✅", pro: "✅" },
];

export default function ExampleLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Demo badge */}
      <div className="bg-orange-tint border-b border-orange/20 text-center py-2.5 sticky top-0 z-50">
        <span className="text-orange-deep text-[11px] font-bold tracking-wide">
          🎭 DEMO MODE — Everything here is sample data. No real orders or payments.
        </span>
      </div>

      {/* Navbar — matches landing page */}
      <nav className="bg-white border-b border-ngray-light h-16 flex items-center justify-between px-12 sticky top-[38px] z-40">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <NexoraLogo size={36} />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-extrabold text-dark tracking-tight">
              ne<span className="text-orange">x</span>ora
            </span>
            <span className="text-[8px] tracking-[3.5px] text-gray-400 font-medium">DIGITAL MALL</span>
          </div>
        </Link>
        <Link
          href="/signup"
          className="text-sm font-bold text-white bg-orange px-5 py-2.5 rounded-full no-underline hover:bg-orange-light transition-colors"
        >
          Start selling today →
        </Link>
      </nav>

      {/* Hero */}
      <section className="bg-dark px-12 py-20 text-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange/10 text-orange text-[11px] font-bold tracking-wide px-4 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-orange rounded-full animate-blink inline-block" />
            Interactive Demo — Nexora Demo Store
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            See exactly what<br />
            <span className="text-orange">you're getting</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto mb-3">
            Pick a plan and explore a live demo of your store and seller dashboard — before you commit to anything.
          </p>
          <p className="text-gray-600 text-sm">
            💡 Try <span className="text-orange font-bold">Growth</span> — chosen by 70% of our sellers
          </p>
        </div>
      </section>

      {/* Package cards */}
      <section className="px-12 py-16 bg-cream">
        <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl overflow-hidden flex flex-col relative"
              style={{
                border: `2px solid ${pkg.isMostPopular ? pkg.cardBorder : "#E5E5E5"}`,
                boxShadow: pkg.isMostPopular ? `0 8px 32px ${pkg.accent}22` : "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {/* Most popular ribbon */}
              {pkg.isMostPopular && (
                <div
                  className="text-white text-[10px] font-extrabold tracking-widest text-center py-1.5"
                  style={{ background: pkg.accent }}
                >
                  ★ MOST POPULAR
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{pkg.emoji}</span>
                    <span
                      className="text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                      style={{ background: pkg.tagBg, color: pkg.tagText }}
                    >
                      {pkg.badge}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-dark mb-1">{pkg.label}</h2>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold" style={{ color: pkg.accent }}>{pkg.price}</span>
                    <span className="text-ngray text-sm mb-1">{pkg.period}</span>
                  </div>
                  <div
                    className="text-[11px] font-bold mt-1.5 px-2 py-0.5 rounded-full inline-flex"
                    style={{ background: pkg.tagBg, color: pkg.tagText }}
                  >
                    Commission: {pkg.commission} per order
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 flex-1 mb-5">
                  {pkg.features.slice(0, 8).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-ngray">
                      <span className="font-extrabold mt-0.5" style={{ color: pkg.accent }}>✓</span>
                      {f}
                    </li>
                  ))}
                  {pkg.features.length > 8 && (
                    <li className="text-xs font-bold" style={{ color: pkg.accent }}>
                      +{pkg.features.length - 8} more features
                    </li>
                  )}
                </ul>

                {/* Locked */}
                {pkg.locked.length > 0 && (
                  <div className="border-t border-ngray-light pt-4 mb-5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Not included
                    </div>
                    <ul className="space-y-1.5">
                      {pkg.locked.slice(0, 4).map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                          <span>🔒</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/example/${pkg.id}/store`}
                    className="w-full text-center py-3 rounded-xl text-sm font-bold no-underline transition-all"
                    style={{ background: pkg.accent, color: "#fff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = pkg.accentHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = pkg.accent)}
                  >
                    View Store Demo →
                  </Link>
                  <Link
                    href={`/example/${pkg.id}/dashboard`}
                    className="w-full text-center py-3 rounded-xl text-sm font-bold no-underline border-2 text-ngray hover:text-dark transition-colors"
                    style={{ borderColor: "#E5E5E5" }}
                  >
                    View Dashboard Demo
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Annual discount note */}
        <div className="text-center mt-8">
          <span className="bg-orange-tint text-orange-deep text-xs font-bold px-5 py-2.5 rounded-full inline-block">
            💡 Save 15–20% with annual billing — ask us about annual plans
          </span>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-12 py-16 bg-white">
        <h2 className="text-3xl font-extrabold text-dark text-center mb-2">Compare plans</h2>
        <p className="text-ngray text-center text-sm mb-10">See exactly what each plan includes</p>

        <div className="max-w-3xl mx-auto bg-white border border-ngray-light rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-4 bg-dark text-white">
            <div className="px-5 py-4 text-xs font-bold text-gray-400">Feature</div>
            {packages.map((pkg) => (
              <div key={pkg.id} className="px-5 py-4 text-center">
                <div className="text-sm font-extrabold">{pkg.emoji} {pkg.label}</div>
                <div className="text-xs font-bold mt-0.5" style={{ color: pkg.accent }}>{pkg.price}/mo</div>
              </div>
            ))}
          </div>

          {/* Rows */}
          {comparisonRows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-4 border-t border-ngray-light ${i % 2 === 0 ? "bg-white" : "bg-cream"}`}
            >
              <div className="px-5 py-3 text-xs font-semibold text-dark">{row.label}</div>
              {[row.starter, row.growth, row.pro].map((val, j) => (
                <div key={j} className="px-5 py-3 text-center text-xs font-bold text-ngray">
                  {val === "✅" ? (
                    <span className="text-success text-base">✓</span>
                  ) : val === "❌" ? (
                    <span className="text-gray-300 text-base">—</span>
                  ) : (
                    val
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-12 py-16 bg-dark text-center">
        <h2 className="text-3xl font-extrabold text-white mb-3">
          Ready to open your shop?
        </h2>
        <p className="text-gray-400 text-base mb-7 max-w-md mx-auto">
          Join thousands of local businesses selling on Nexora. Setup takes less than 10 minutes.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-orange text-white font-bold px-9 py-4 rounded-full text-base no-underline hover:bg-orange-light transition-colors"
        >
          Start selling today →
        </Link>
        <p className="text-gray-600 text-xs mt-5">
          No commitment · Cancel anytime · bKash & Nagad accepted
        </p>
      </section>
    </div>
  );
}