// src/app/admin/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/admin", icon: "🏠" },
  { label: "Sellers & Subscriptions", href: "/admin/sellers", icon: "🏪" },
  { label: "Categories", href: "/admin/categories", icon: "🗂️" },
  { label: "Featured Shops", href: "/admin/featured", icon: "⭐" },
  { label: "Revenue & Commission", href: "/admin/revenue", icon: "💰" },
  { label: "Buyers / Customers", href: "/admin/buyers", icon: "👥" },
  { label: "Pending Confirmations", href: "/admin/pending", icon: "⏳" },
  { label: "Add Subscription", href: "/admin/subscriptions", icon: "➕" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

function AdminLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nGradAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="50%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
      </defs>
      <rect x="28" y="35" width="52" height="148" rx="14" fill="url(#nGradAdmin)" />
      <rect x="120" y="35" width="52" height="148" rx="14" fill="url(#nGradAdmin)" />
      <polygon points="80,35 120,120 120,35" fill="url(#nGradAdmin)" />
      <polygon points="80,35 120,183 80,183" fill="#0F766E" opacity="0.35" />
      <path d="M55 22 Q100 2 145 22" fill="none" stroke="#E2E8F0" strokeWidth="13" strokeLinecap="round" />
      <circle cx="55" cy="22" r="8" fill="#E2E8F0" />
      <circle cx="145" cy="22" r="8" fill="#E2E8F0" />
    </svg>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#0F2A2E] flex flex-col fixed h-screen">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
          <AdminLogo />
          <div className="flex flex-col leading-none">
            <span className="text-white text-sm font-extrabold">
              ne<span className="text-teal-300">x</span>ora
            </span>
            <span className="text-[8px] tracking-[2px] text-slate-400 font-medium">ADMIN</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2.5 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold no-underline transition-colors ${
                  active
                    ? "bg-teal-600 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-2.5 pb-5">
          <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
            <span className="text-base">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-[220px] p-8">{children}</main>
    </div>
  );
}