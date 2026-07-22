// src/app/example/[pkg]/dashboard/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { PACKAGE_CONFIG, MOCK_ORDERS, MOCK_PRODUCTS, PackageId, STATUS_STYLE } from "../../mockData";

function NexoraLogo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nGDash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C5A" /><stop offset="50%" stopColor="#FF5C1A" /><stop offset="100%" stopColor="#C43A08" />
        </linearGradient>
      </defs>
      <rect x="28" y="35" width="52" height="148" rx="14" fill="url(#nGDash)" />
      <rect x="120" y="35" width="52" height="148" rx="14" fill="url(#nGDash)" />
      <polygon points="80,35 120,120 120,35" fill="url(#nGDash)" />
      <polygon points="80,35 120,183 80,183" fill="#C43A08" opacity="0.35" />
      <path d="M55 22 Q100 2 145 22" fill="none" stroke="#fff" strokeWidth="13" strokeLinecap="round" />
      <circle cx="55" cy="22" r="8" fill="#fff" /><circle cx="145" cy="22" r="8" fill="#fff" />
    </svg>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent: string }) {
  return (
    <div className="bg-white rounded-2xl border border-ngray-light p-4">
      <div className="text-[10px] font-bold text-ngray uppercase tracking-wide mb-1.5">{label}</div>
      <div className="text-xl font-extrabold text-dark">{value}</div>
      {sub && <div className="text-[11px] mt-1" style={{ color: accent }}>{sub}</div>}
    </div>
  );
}

export default function DashboardDemoPage() {
  const params = useParams();
  const pkg = (params.pkg as PackageId) ?? "starter";
  const config = (PACKAGE_CONFIG[pkg] ?? PACKAGE_CONFIG.starter) as any;
  const [activeNav, setActiveNav] = useState("Overview");
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState("");

  const navItems = [
    { icon: "🏠", label: "Overview", available: true },
    { icon: "📦", label: "Products", available: true },
    { icon: "🛍️", label: "Orders", available: true },
    { icon: "📊", label: "Analytics", available: config.hasAdvancedAnalytics },
    { icon: "💰", label: "Revenue", available: config.hasRevenueChart },
    { icon: "👥", label: "Customers", available: config.hasCustomerDB },
    { icon: "🎟", label: "Coupons", available: config.hasCoupons },
    { icon: "📋", label: "Reports", available: config.hasReports },
    { icon: "📍", label: "Sales by City", available: config.hasCityBreakdown },
    { icon: "🤖", label: "AI Tools", available: config.hasAI },
    { icon: "🔍", label: "SEO Tools", available: config.hasSEO },
    { icon: "📣", label: "Campaigns", available: config.hasEmailCampaign },
    { icon: "🏆", label: "Loyalty Points", available: config.hasLoyalty },
    { icon: "👨‍💼", label: "Staff", available: config.hasStaff },
    { icon: "⚙️", label: "Settings", available: true },
  ];

  function simulateAI() {
    setAiResult("");
    const result = `**Product Title:** ${aiInput || "Wireless Office Mouse"}\n\n**Description:** Designed for professionals who demand precision and comfort, this wireless mouse delivers ultra-smooth tracking on any surface. Featuring whisper-quiet clicks and a 3-month battery life, it's your perfect desk companion.\n\n**Tags:** wireless mouse, office accessories, silent click, ergonomic, long battery`;
    let i = 0;
    const interval = setInterval(() => {
      setAiResult(result.slice(0, i));
      i += 4;
      if (i > result.length) clearInterval(interval);
    }, 20);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Demo banner */}
      <div className="text-white text-center py-2 sticky top-0 z-50 text-[11px] font-bold"
        style={{ background: config.accent }}>
        🎭 DEMO · {config.emoji} {config.label} Dashboard ·{" "}
        <Link href={`/example/${pkg}/store`} className="underline text-white/80">Back to store</Link>
        {" · "}
        <Link href="/example" className="underline text-white/80">All plans</Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[220px] flex-shrink-0 flex flex-col h-[calc(100vh-32px)] sticky top-8"
          style={{ background: config.dashSidebar }}>
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
            <NexoraLogo size={24} />
            <div className="flex flex-col leading-none">
              <span className="text-white text-sm font-extrabold leading-tight">John Electronics</span>
              <span className="text-[9px] text-white/40 mt-0.5">{config.emoji} {config.label} Plan</span>
            </div>
          </div>

          <nav className="flex-1 py-3 px-2.5 overflow-y-auto">
            {navItems.map((item) => item.available ? (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all mb-0.5 text-left"
                style={activeNav === item.label
                  ? { background: config.accent, color: "#fff" }
                  : { color: "rgba(255,255,255,0.45)" }}
              >
                <span className="text-sm">{item.icon}</span> {item.label}
              </button>
            ) : (
              <div key={item.label}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-white/15 cursor-not-allowed mb-0.5"
              >
                <span className="text-sm">🔒</span> {item.label}
              </div>
            ))}
          </nav>

          <div className="px-3 pb-4 pt-2 border-t border-white/10">
            <Link href="/signup"
              className="block text-center text-[12px] font-bold text-white py-2.5 rounded-xl no-underline"
              style={{ background: config.accent }}>
              Get {config.label} Plan →
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-cream p-6 overflow-auto">

          {/* OVERVIEW */}
          {activeNav === "Overview" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="text-xl font-extrabold text-dark">Good morning, John 👋</h1>
                  <p className="text-ngray text-xs mt-0.5">{config.label} plan · {config.commission} commission</p>
                </div>
                <Link href="/signup" className="text-sm font-bold text-white px-5 py-2.5 rounded-full no-underline"
                  style={{ background: config.accent }}>
                  Start selling →
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-5">
                <StatCard label="Sales today" value="৳55,000" sub="↑ 12% vs yesterday" accent={config.accent} />
                <StatCard label="This week" value="৳3,40,000" accent={config.accent} />
                <StatCard label="Total orders" value="214" sub="18 pending" accent={config.accent} />
                {config.hasAdvancedAnalytics
                  ? <StatCard label="Best product" value="iPhone 16 Pro" sub="42 sold" accent={config.accent} />
                  : <div className="bg-white rounded-2xl border-2 border-dashed border-ngray-light p-4 flex flex-col items-center justify-center text-center">
                      <div className="text-xl mb-1">🔒</div>
                      <div className="text-[10px] text-ngray font-semibold">Best product tracking</div>
                      <div className="text-[9px] text-ngray mt-0.5">Growth+</div>
                    </div>
                }
              </div>

              {/* Revenue chart */}
              {config.hasRevenueChart ? (
                <div className="bg-white rounded-2xl border border-ngray-light p-5 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-dark">Revenue — last 7 days</span>
                    <span className="text-xs text-ngray">Total: ৳3,40,000</span>
                  </div>
                  <div className="flex items-end gap-2 h-28">
                    {[55000, 80000, 65000, 95000, 70000, 110000, 88000].map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-[9px] text-ngray mb-0.5">৳{Math.round(v/1000)}k</div>
                        <div className="w-full rounded-t-lg"
                          style={{ height: `${(v / 110000) * 100}%`, background: config.accent, opacity: 0.85 }} />
                        <span className="text-[9px] text-ngray">{["M","T","W","T","F","S","S"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border-2 border-dashed border-ngray-light p-8 text-center mb-4">
                  <div className="text-3xl mb-2">📈</div>
                  <div className="text-sm font-bold text-ngray mb-1">Revenue charts locked</div>
                  <div className="text-xs text-ngray mb-3">Available on Growth & Business Pro plans</div>
                  <Link href="/signup" className="text-xs font-bold text-white px-5 py-2 rounded-full no-underline inline-block"
                    style={{ background: config.accent }}>
                    Upgrade plan →
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {config.hasCityBreakdown && (
                  <div className="bg-white rounded-2xl border border-ngray-light p-5">
                    <div className="text-sm font-bold text-dark mb-4">Sales by city</div>
                    {[{ city: "Dhaka", pct: 58, val: "৳1,97,200" }, { city: "Chittagong", pct: 24, val: "৳81,600" }, { city: "Sylhet", pct: 10, val: "৳34,000" }, { city: "Others", pct: 8, val: "৳27,200" }].map((r) => (
                      <div key={r.city} className="flex items-center gap-3 mb-2.5">
                        <span className="text-xs text-ngray w-20">{r.city}</span>
                        <div className="flex-1 h-1.5 bg-ngray-light rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: config.accent }} />
                        </div>
                        <span className="text-xs font-bold text-dark">{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {config.hasCustomerDB && (
                  <div className="bg-white rounded-2xl border border-ngray-light p-5">
                    <div className="text-sm font-bold text-dark mb-4">Customer insights</div>
                    {[{ label: "Return rate", value: "41%" }, { label: "Avg. order value", value: "৳18,500" }, { label: "New this month", value: "38 customers" }, { label: "Repeat buyers", value: "89 total" }].map((r) => (
                      <div key={r.label} className="flex justify-between py-2 border-b border-ngray-light last:border-0">
                        <span className="text-xs text-ngray">{r.label}</span>
                        <span className="text-xs font-extrabold text-dark">{r.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent orders — always */}
                <div className={`bg-white rounded-2xl border border-ngray-light p-5 ${!config.hasCityBreakdown && !config.hasCustomerDB ? "col-span-2" : config.hasCityBreakdown && config.hasCustomerDB ? "col-span-2" : ""}`}>
                  <div className="text-sm font-bold text-dark mb-4">Recent orders</div>
                  {MOCK_ORDERS.slice(0, 4).map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-ngray-light last:border-0">
                      <div>
                        <div className="text-xs font-bold text-dark">{o.customer}</div>
                        <div className="text-[10px] text-ngray">{o.items} · {o.city}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-dark">{o.amount}</div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {activeNav === "Products" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-xl font-extrabold text-dark">Products</h1>
                <div className="flex gap-2">
                  {config.hasBulkUpload && (
                    <button className="text-sm font-bold px-4 py-2 rounded-full border-2 text-ngray border-ngray-light hover:border-ngray transition-colors">
                      📊 Bulk Upload
                    </button>
                  )}
                  <button className="text-sm font-bold text-white px-4 py-2 rounded-full" style={{ background: config.accent }}>
                    + Add product
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-ngray-light overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-cream text-left">
                      <th className="px-5 py-3 text-[11px] font-bold text-ngray uppercase tracking-wide">Product</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-ngray uppercase tracking-wide">Price</th>
                      {config.hasAdvancedAnalytics && <th className="px-5 py-3 text-[11px] font-bold text-ngray uppercase tracking-wide">Sold</th>}
                      {config.hasAdvancedAnalytics && <th className="px-5 py-3 text-[11px] font-bold text-ngray uppercase tracking-wide">Stock</th>}
                      <th className="px-5 py-3 text-[11px] font-bold text-ngray uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_PRODUCTS.map((p) => (
                      <tr key={p.id} className="border-t border-ngray-light hover:bg-cream/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <img src={p.img} alt={p.name} className="w-9 h-9 rounded-lg object-cover" />
                            <div>
                              <div className="font-bold text-dark text-xs">{p.name}</div>
                              <div className="text-[10px] text-ngray">{p.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-bold text-xs" style={{ color: config.accent }}>{p.price}</td>
                        {config.hasAdvancedAnalytics && <td className="px-5 py-3 text-xs text-ngray">{p.sold}</td>}
                        {config.hasAdvancedAnalytics && <td className="px-5 py-3 text-xs text-ngray">{p.stock}</td>}
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button className="text-[11px] font-bold text-ngray hover:text-dark">Edit</button>
                            <button className="text-[11px] font-bold text-danger">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeNav === "Orders" && (
            <div>
              <h1 className="text-xl font-extrabold text-dark mb-5">Orders</h1>
              <div className="bg-white rounded-2xl border border-ngray-light overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-cream text-left">
                      {["Order ID","Customer","Phone","Items","Amount","City","Status","Date"].map(h => (
                        <th key={h} className="px-4 py-3 text-[11px] font-bold text-ngray uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ORDERS.map((o) => (
                      <tr key={o.id} className="border-t border-ngray-light">
                        <td className="px-4 py-3 font-bold text-xs text-dark">{o.id}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-dark">{o.customer}</td>
                        <td className="px-4 py-3 text-xs text-ngray">{o.phone}</td>
                        <td className="px-4 py-3 text-xs text-ngray">{o.items}</td>
                        <td className="px-4 py-3 font-bold text-xs" style={{ color: config.accent }}>{o.amount}</td>
                        <td className="px-4 py-3 text-xs text-ngray">{o.city}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-ngray">{o.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI TOOLS — pro only */}
          {activeNav === "AI Tools" && config.hasAI && (
            <div>
              <h1 className="text-xl font-extrabold text-dark mb-1">AI Tools</h1>
              <p className="text-ngray text-sm mb-6">Let AI write your product descriptions, SEO titles, and marketing captions.</p>
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-ngray-light p-5">
                  <div className="text-sm font-bold text-dark mb-1">🤖 AI Product Description</div>
                  <p className="text-xs text-ngray mb-3">Describe your product and AI will write a compelling listing.</p>
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    className="w-full border border-ngray-light rounded-xl p-3 text-xs resize-none h-20 focus:outline-none mb-3"
                    placeholder="e.g. Wireless mouse, silent clicks, ergonomic, 3-month battery..."
                  />
                  <button onClick={simulateAI} className="text-sm font-bold text-white px-5 py-2.5 rounded-full w-full"
                    style={{ background: config.accent }}>
                    ✨ Generate content
                  </button>
                  {aiResult && (
                    <div className="mt-3 p-3 bg-cream rounded-xl text-xs text-dark whitespace-pre-line font-medium">
                      {aiResult}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: "🔍", title: "AI SEO Generator", desc: "Auto-generate SEO title & meta description for Google." },
                    { icon: "📣", title: "AI Marketing Caption", desc: "Create engaging Facebook/Instagram captions instantly." },
                    { icon: "✉️", title: "AI Email Generator", desc: "Write promotional emails to send to your customers." },
                    { icon: "🏷️", title: "AI Product Tags", desc: "Suggest the best tags to improve discoverability." },
                  ].map((tool) => (
                    <div key={tool.title} className="bg-white rounded-2xl border border-ngray-light p-4 flex items-center gap-3">
                      <div className="text-2xl">{tool.icon}</div>
                      <div>
                        <div className="text-sm font-bold text-dark">{tool.title}</div>
                        <div className="text-xs text-ngray">{tool.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STAFF — pro only */}
          {activeNav === "Staff" && config.hasStaff && (
            <div>
              <h1 className="text-xl font-extrabold text-dark mb-5">Staff Accounts</h1>
              <div className="bg-white rounded-2xl border border-ngray-light p-5 max-w-lg">
                {[{ name: "Karim (Manager)", role: "Full access" }, { name: "Rafi (Order Handler)", role: "Orders only" }].map((s) => (
                  <div key={s.name} className="flex items-center justify-between py-3 border-b border-ngray-light last:border-0">
                    <div>
                      <div className="text-sm font-bold text-dark">{s.name}</div>
                      <div className="text-xs text-ngray">{s.role}</div>
                    </div>
                    <button className="text-xs font-bold text-danger">Remove</button>
                  </div>
                ))}
                <button className="mt-4 text-sm font-bold text-white px-5 py-2.5 rounded-full w-full"
                  style={{ background: config.accent }}>
                  + Add staff member
                </button>
              </div>
            </div>
          )}

          {/* SETTINGS — always */}
          {activeNav === "Settings" && (
            <div>
              <h1 className="text-xl font-extrabold text-dark mb-5">Settings</h1>
              <div className="bg-white rounded-2xl border border-ngray-light p-5 max-w-lg space-y-4">
                {[
                  { label: "Shop name", value: "John Electronics" },
                  { label: "Phone", value: "01XXXXXXXXX" },
                  { label: "City", value: "Dhaka" },
                  { label: "Delivery inside city (৳)", value: "60" },
                  { label: "Delivery outside city (৳)", value: "120" },
                  { label: "Free delivery area", value: "Mirpur, Dhanmondi, Gulshan" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-[11px] font-bold text-ngray mb-1.5">{f.label}</label>
                    <input defaultValue={f.value}
                      className="w-full border border-ngray-light rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                ))}
                <button className="text-sm font-bold text-white px-5 py-2.5 rounded-full w-full"
                  style={{ background: config.accent }}>
                  Save changes
                </button>
              </div>
            </div>
          )}

          {/* Generic locked/other tabs */}
          {!["Overview","Products","Orders","AI Tools","Staff","Settings"].includes(activeNav) && (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <div className="text-5xl mb-3">📊</div>
              <h2 className="text-xl font-extrabold text-dark mb-2">{activeNav}</h2>
              <p className="text-ngray text-sm mb-5 max-w-xs">
                Full {activeNav} functionality is available on the {config.label} plan.
              </p>
              <Link href="/signup"
                className="text-sm font-bold text-white px-6 py-3 rounded-full no-underline"
                style={{ background: config.accent }}>
                Get {config.label} plan →
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}