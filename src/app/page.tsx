"use client";

import { useState } from "react";

// ─── Logo SVG ────────────────────────────────────────────────────────────────
function NexoraLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C5A" />
          <stop offset="50%" stopColor="#FF5C1A" />
          <stop offset="100%" stopColor="#C43A08" />
        </linearGradient>
      </defs>
      <rect x="28" y="35" width="52" height="148" rx="14" fill="url(#nGrad)" />
      <rect x="120" y="35" width="52" height="148" rx="14" fill="url(#nGrad)" />
      <polygon points="80,35 120,120 120,35" fill="url(#nGrad)" />
      <polygon points="80,35 120,183 80,183" fill="#C43A08" opacity="0.35" />
      <path
        d="M55 22 Q100 2 145 22"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <circle cx="55" cy="22" r="8" fill="#1A1A1A" />
      <circle cx="145" cy="22" r="8" fill="#1A1A1A" />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-ngray-light h-16 flex items-center justify-between px-12 sticky top-0 z-50">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2.5 no-underline">
        <NexoraLogo size={40} />
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-dark tracking-tight leading-none">
            ne<span className="text-orange">x</span>ora
          </span>
          <span className="text-[8px] tracking-[3.5px] text-gray-400 font-medium">
            DIGITAL MALL
          </span>
        </div>
      </a>

      {/* Nav links — hidden on mobile */}
      <ul className="hidden md:flex gap-7 list-none m-0 p-0">
        {[
          { label: "Home", href: "/" },
          { label: "Explore", href: "/explore" },
          { label: "Shops", href: "/explore" },
          { label: "Offers", href: "/explore?filter=offers" },
        ].map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              className="text-sm font-medium text-gray-500 no-underline hover:text-orange transition-colors"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="hidden md:flex items-center gap-3">
        <a
          href="/login"
          className="text-sm font-semibold text-dark border border-ngray-light px-5 py-2.5 rounded-full no-underline hover:border-gray-400 transition-colors"
        >
          Log in
        </a>
        <a
          href="/signup"
          className="text-sm font-bold text-white bg-orange px-5 py-2.5 rounded-full no-underline hover:bg-orange-light transition-colors"
        >
          Become a Seller
        </a>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-dark text-2xl"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-ngray-light px-6 py-4 flex flex-col gap-4 md:hidden shadow-sm">
          {["Home", "Explore", "Shops", "Offers"].map((item) => (
            <a
              key={item}
              href={`/${item === "Home" ? "" : item.toLowerCase()}`}
              className="text-sm font-medium text-gray-600 no-underline"
            >
              {item}
            </a>
          ))}
          <a
            href="/signup"
            className="text-sm font-bold text-white bg-orange px-5 py-2.5 rounded-full no-underline text-center"
          >
            Become a Seller
          </a>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const cards = [
    {
      src: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
      name: "Rima's Bakery",
      rating: "4.9",
      tall: true,
    },
    {
      src: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80",
      name: "Dhaka Fashion",
      rating: "4.7",
      tall: false,
    },
    {
      src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80",
      name: "Glow Beauty",
      rating: "4.8",
      tall: false,
    },
  ];

  return (
    <section className="bg-white px-12 pt-20 flex items-center gap-10 overflow-hidden relative">
      {/* Cream blob background */}
      <div className="absolute top-0 right-0 w-[55%] h-[110%] bg-cream rounded-l-[60px] z-0" />

      {/* Left */}
      <div className="relative z-10 flex-1 max-w-[50%]">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-orange-tint text-orange-deep text-[11px] font-bold tracking-wide px-4 py-1.5 rounded-full mb-5">
          <span className="w-2 h-2 bg-orange rounded-full animate-blink inline-block" />
          Bangladesh&apos;s Digital Mall
        </div>

        <h1 className="text-5xl font-extrabold leading-[1.1] tracking-[-1.5px] text-dark mb-5">
          Shop local.
          <br />
          <span className="text-orange">Delivered fresh.</span>
        </h1>

        <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
          Thousands of local businesses — cakes, clothing, electronics and more
          — all in one place. Discover your city&apos;s best shops.
        </p>

        <div className="flex gap-3 mb-11">
          <a
            href="/explore"
            className="text-white bg-orange font-bold px-7 py-3.5 rounded-full no-underline text-base hover:bg-orange-light transition-colors"
          >
            Explore the mall →
          </a>
          <a
            href="/signup"
            className="text-dark border border-ngray-light font-semibold px-6 py-3.5 rounded-full no-underline text-base hover:border-gray-400 transition-colors"
          >
            Open your shop
          </a>
        </div>

        {/* Stats */}
        <div className="flex gap-9">
          {[
            { num: "2,400", suffix: "+", label: "Active shops" },
            { num: "48K", suffix: "+", label: "Products" },
            { num: "64", suffix: "", label: "Cities covered" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold text-dark">
                {s.num}
                <span className="text-orange">{s.suffix}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — shop photo grid */}
      <div className="relative z-10 flex-1 grid grid-cols-2 gap-3 pb-0" style={{ gridTemplateRows: "220px 160px" }}>
        {cards.map((card, i) => (
          <div
            key={i}
            className={`rounded-2xl overflow-hidden relative ${card.tall ? "row-span-2" : ""}`}
          >
            <img
              src={card.src}
              alt={card.name}
              className="w-full h-full object-cover block"
            />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/85 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-bold text-dark">{card.name}</span>
              <span className="text-xs font-bold text-orange">★ {card.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────
const categories = [
  { name: "Food & Cake", count: "320 shops", slug: "food-cake", img: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=200&q=80" },
  { name: "Clothing", count: "580 shops", slug: "clothing", img: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&q=80" },
  { name: "Electronics", count: "210 shops", slug: "electronics", img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&q=80" },
  { name: "Beauty", count: "195 shops", slug: "beauty", img: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=200&q=80" },
  { name: "Home & Living", count: "148 shops", slug: "home-living", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80" },
  { name: "Books", count: "92 shops", slug: "books", img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=80" },
];

function Categories() {
  return (
    <section className="px-12 py-20 bg-white">
      <div className="text-center mb-11">
        <h2 className="text-3xl font-extrabold text-dark tracking-tight mb-2">
          Shop by category
        </h2>
        <p className="text-ngray text-[15px]">
          From fresh-baked cakes to the latest fashion — find everything local
        </p>
      </div>

      <div className="grid grid-cols-6 gap-3.5">
        {categories.map((cat) => (
          <a
            key={cat.slug}
            href={`/explore?category=${cat.slug}`}
            className="rounded-2xl overflow-hidden border-2 border-transparent hover:border-orange hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(255,92,26,0.12)] transition-all duration-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] no-underline block"
          >
            <img
              src={cat.img}
              alt={cat.name}
              className="w-full h-[90px] object-cover block"
            />
            <div className="p-2.5 text-center">
              <strong className="block text-xs font-bold text-dark">{cat.name}</strong>
              <span className="text-[11px] text-ngray">{cat.count}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Featured Shops ───────────────────────────────────────────────────────────
const shops = [
  { name: "Rima's Bakery", category: "Food & Cake", rating: "4.9", city: "Dhaka", premium: true, banner: "https://images.unsplash.com/photo-1530648672449-81f6c723e2f1?w=400&q=80", icon: "🍰", slug: "rimas-bakery" },
  { name: "Dhaka Fashion Hub", category: "Clothing", rating: "4.7", city: "Dhaka", premium: false, banner: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80", icon: "✂️", slug: "dhaka-fashion-hub" },
  { name: "TechZone BD", category: "Electronics", rating: "4.8", city: "Chittagong", premium: true, banner: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80", icon: "⚡", slug: "techzone-bd" },
  { name: "Glow Beauty", category: "Beauty", rating: "4.6", city: "Sylhet", premium: false, banner: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80", icon: "💄", slug: "glow-beauty" },
];

function FeaturedShops() {
  return (
    <section className="px-12 py-18 bg-cream">
      <div className="flex justify-between items-end mb-7">
        <div>
          <h2 className="text-[28px] font-extrabold text-dark">Featured shops</h2>
          <p className="text-ngray text-sm mt-1">Handpicked top-rated local businesses</p>
        </div>
        <a href="/explore" className="text-orange text-sm font-bold no-underline">
          View all →
        </a>
      </div>

      <div className="grid grid-cols-4 gap-[18px]">
        {shops.map((shop) => (
          <a
            key={shop.slug}
            href={`/shop/${shop.slug}`}
            className="bg-white rounded-2xl overflow-hidden border border-ngray-light hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)] transition-all duration-200 no-underline block"
          >
            {/* Banner */}
            <div className="h-24 relative overflow-hidden">
              <img src={shop.banner} alt={shop.name} className="w-full h-full object-cover" />
              {shop.premium && (
                <span className="absolute top-2 right-2 bg-orange text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full tracking-wide">
                  PREMIUM
                </span>
              )}
            </div>
            {/* Body */}
            <div className="px-3.5 pb-3.5">
              <div className="w-[38px] h-[38px] rounded-full bg-orange-tint border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.1)] flex items-center justify-center -mt-[19px] mb-2 text-base">
                {shop.icon}
              </div>
              <div className="text-[13px] font-bold text-dark mb-1.5">{shop.name}</div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-orange-tint text-orange-deep text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {shop.category}
                </span>
                <span className="text-[11px] text-ngray">
                  <span className="text-warning">★</span> {shop.rating}
                </span>
                <span className="text-[11px] text-ngray">📍 {shop.city}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Hot Offers ───────────────────────────────────────────────────────────────
const offers = [
  { name: "Custom Birthday Cake", shop: "Rima's Bakery", old: "৳850", new: "৳595", off: "-30%", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80" },
  { name: "Summer Kurti Set", shop: "Dhaka Fashion Hub", old: "৳1,200", new: "৳900", off: "-25%", img: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=300&q=80" },
  { name: "Wireless Earbuds Pro", shop: "TechZone BD", old: "৳2,500", new: "৳2,125", off: "-15%", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80" },
  { name: "Skincare Glow Kit", shop: "Glow Beauty", old: "৳1,800", new: "৳1,080", off: "-40%", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80" },
  { name: "Handmade Cushion Set", shop: "Home Nest BD", old: "৳950", new: "৳760", off: "-20%", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80" },
];

function HotOffers() {
  return (
    <section className="px-12 py-18 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[28px] font-extrabold text-dark flex items-center gap-2.5">
          Hot offers 🔥
        </h2>
        <a href="/explore?filter=offers" className="text-orange text-sm font-bold no-underline">
          View all →
        </a>
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-1.5 scroll-hide">
        {offers.map((offer) => (
          <div
            key={offer.name}
            className="min-w-[188px] flex-shrink-0 bg-white border border-ngray-light rounded-[14px] overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform duration-200"
          >
            <div className="h-[120px] relative overflow-hidden">
              <img src={offer.img} alt={offer.name} className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2 bg-danger text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                {offer.off}
              </span>
            </div>
            <div className="p-[11px]">
              <div className="text-[13px] font-bold text-dark mb-0.5">{offer.name}</div>
              <div className="text-[11px] text-ngray mb-1.5">{offer.shop}</div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-300 line-through">{offer.old}</span>
                <span className="text-base font-extrabold text-orange">{offer.new}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const steps = [
  {
    num: "STEP 01",
    title: "Browse local shops",
    desc: "Explore verified local businesses by category, city, or rating.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5C1A" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    num: "STEP 02",
    title: "Add to cart",
    desc: "Pick your items. Delivery cost auto-adjusts to your location.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5C1A" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    num: "STEP 03",
    title: "Get delivered",
    desc: "Pay via bKash or Nagad. The seller delivers it to your door.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5C1A" strokeWidth="1.8" strokeLinecap="round">
        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
      </svg>
    ),
  },
];

function HowItWorks() {
  return (
    <section className="px-12 py-18 bg-cream">
      <div className="text-center mb-11">
        <h2 className="text-3xl font-extrabold text-dark tracking-tight mb-2">
          How shopping works
        </h2>
        <p className="text-ngray text-[15px]">
          Three steps to buy from your favourite local businesses
        </p>
      </div>

      <div className="flex relative">
        {/* Connector line */}
        <div className="absolute top-[34px] left-[calc(16.7%+12px)] w-[calc(66.6%-24px)] h-0.5 bg-orange-tint z-0" />

        {steps.map((step) => (
          <div key={step.num} className="flex-1 text-center px-4 z-10">
            <div className="w-[68px] h-[68px] rounded-full bg-white border-2 border-orange-tint mx-auto mb-4 flex items-center justify-center hover:border-orange transition-colors">
              {step.icon}
            </div>
            <div className="text-[11px] font-bold text-orange tracking-wide mb-1.5">
              {step.num}
            </div>
            <div className="text-[15px] font-bold text-dark mb-1.5">{step.title}</div>
            <p className="text-[13px] text-ngray leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Seller CTA ───────────────────────────────────────────────────────────────
function SellerCTA() {
  return (
    <section className="px-12 py-16">
      <div className="bg-orange-tint rounded-[32px] px-12 py-[72px] text-center">
        <h2 className="text-[40px] font-extrabold text-dark tracking-tight mb-3">
          No website?{" "}
          <span className="text-orange">No problem.</span>
        </h2>
        <p className="text-ngray text-base mb-7">
          Launch your online shop in minutes. Pay monthly, cancel anytime.
        </p>
        <a
          href="/signup"
          className="inline-block bg-orange text-white font-bold px-9 py-4 rounded-full text-base no-underline hover:bg-orange-light transition-colors"
        >
          Start selling today →
        </a>
        <div className="flex gap-2.5 justify-center mt-6 flex-wrap">
          {[
            "Your own branded URL",
            "Setup in 10 minutes",
            "Real-time dashboard",
            "bKash and Nagad",
          ].map((pill) => (
            <div
              key={pill}
              className="bg-white text-gray-500 text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 border border-orange/20"
            >
              <span className="text-orange font-extrabold">✓</span>
              {pill}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: "EXPLORE", links: ["Browse shops", "All categories", "Current offers", "Top rated"] },
    { title: "SELLERS", links: ["Become a seller", "Packages", "Dashboard", "How it works"] },
    { title: "COMPANY", links: ["About Nexora", "Contact us", "Privacy policy", "Terms"] },
  ];

  return (
    <footer className="bg-dark px-12 pt-12 pb-6 text-gray-500">
      <div className="grid grid-cols-4 gap-10 mb-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <NexoraLogo size={28} />
            <span className="text-white text-base font-extrabold">
              ne<span className="text-orange">x</span>ora
            </span>
          </div>
          <p className="text-[13px] leading-relaxed max-w-[240px]">
            Bangladesh&apos;s digital shopping mall — connecting local
            businesses with buyers across the country.
          </p>
          <div className="flex gap-2 mt-3.5">
            {["f", "in", "▶"].map((icon) => (
              <div
                key={icon}
                className="w-8 h-8 bg-white/7 border border-white/10 rounded-lg flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-orange hover:text-white hover:border-orange transition-all"
              >
                {icon}
              </div>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-gray-300 text-xs font-bold mb-3.5 tracking-wide">
              {col.title}
            </h4>
            {col.links.map((link) => (
              <a
                key={link}
                href="#"
                className="block text-gray-500 text-[13px] mb-2.5 no-underline hover:text-gray-300 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-white/7 pt-5 flex justify-between items-center">
        <p className="text-xs">© 2025 Nexora Digital Mall. All rights reserved.</p>
        <div className="flex gap-2">
          {["bKash", "Nagad"].map((pay) => (
            <span
              key={pay}
              className="bg-white/7 border border-white/10 text-gray-500 text-[11px] font-bold px-3 py-1 rounded-lg"
            >
              {pay}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <FeaturedShops />
        <HotOffers />
        <HowItWorks />
        <SellerCTA />
      </main>
      <Footer />
    </>
  );
}