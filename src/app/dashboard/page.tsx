"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

// ─── Logo ──────────────────────────────────────────────────────────────────────
function NexoraLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nGradDash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8C5A" />
          <stop offset="50%" stopColor="#FF5C1A" />
          <stop offset="100%" stopColor="#C43A08" />
        </linearGradient>
      </defs>
      <rect x="28" y="35" width="52" height="148" rx="14" fill="url(#nGradDash)" />
      <rect x="120" y="35" width="52" height="148" rx="14" fill="url(#nGradDash)" />
      <polygon points="80,35 120,120 120,35" fill="url(#nGradDash)" />
      <polygon points="80,35 120,183 80,183" fill="#C43A08" opacity="0.35" />
      <path d="M55 22 Q100 2 145 22" fill="none" stroke="#1A1A1A" strokeWidth="13" strokeLinecap="round" />
      <circle cx="55" cy="22" r="8" fill="#1A1A1A" />
      <circle cx="145" cy="22" r="8" fill="#1A1A1A" />
    </svg>
  );
}

const navItems = [
  { key: "overview", label: "Overview", icon: "🏠" },
  { key: "products", label: "Products", icon: "📦" },
  { key: "orders", label: "Orders", icon: "🧾" },
  { key: "revenue", label: "Revenue", icon: "💰" },
  { key: "settings", label: "Shop Settings", icon: "⚙️" },
  { key: "theme", label: "Theme Customizer", icon: "🎨" },
  { key: "account", label: "Account", icon: "👤" },
];

const statusStyles: Record<string, string> = {
  pending: "bg-warning/15 text-warning",
  confirmed: "bg-info/15 text-info",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-danger/15 text-danger",
};

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({
  active,
  setActive,
  onLogout,
}: {
  active: string;
  setActive: (k: string) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="w-[220px] bg-white border-r border-ngray-light flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-ngray-light flex items-center gap-2.5">
        <NexoraLogo size={32} />
        <div className="flex flex-col">
          <span className="text-sm font-extrabold text-dark leading-none">
            ne<span className="text-orange">x</span>ora
          </span>
          <span className="text-[8px] tracking-[2.5px] text-ngray font-medium mt-0.5">SELLER</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors
                ${isActive ? "bg-orange-tint text-orange-deep font-bold" : "text-gray-600 hover:bg-cream"}`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-ngray-light">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-cream transition-colors"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  locked = false,
}: {
  label: string;
  value: string;
  sub?: string;
  locked?: boolean;
}) {
  return (
    <div className="bg-white border border-ngray-light rounded-2xl p-5 relative overflow-hidden">
      {locked && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center flex-col gap-1">
          <span className="text-lg">🔒</span>
          <span className="text-[10px] font-bold text-orange-deep">Premium only</span>
        </div>
      )}
      <div className="text-xs text-ngray font-medium mb-2">{label}</div>
      <div className="text-2xl font-extrabold text-dark">{value}</div>
      {sub && <div className="text-xs text-success font-semibold mt-1">{sub}</div>}
    </div>
  );
}

// ─── Overview Page ─────────────────────────────────────────────────────────────
function OverviewPage({
  shop,
  products,
  orders,
  onNavigate,
}: {
  shop: any;
  products: any[];
  orders: any[];
  onNavigate: (k: string) => void;
}) {
  const activePlan = shop?.plan || "basic";
  const isStandardPlus = activePlan === "standard" || activePlan === "premium";
  const isPremium = activePlan === "premium";

  // Compute stats dynamically from the actual orders
  const todayStr = new Date().toISOString().split("T")[0];
  const salesToday = orders
    .filter((o) => o.created_at?.split("T")[0] === todayStr && o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const salesThisWeek = orders
    .filter((o) => new Date(o.created_at) >= sevenDaysAgo && o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const salesMonthly = orders
    .filter((o) => new Date(o.created_at) >= thirtyDaysAgo && o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const totalOrders = orders.length;

  // Find top selling product
  const topProduct = products.length > 0 ? products[0].name : "No products yet";

  // Return Rate
  const phones = orders.map((o) => o.customer_phone).filter(Boolean);
  const uniquePhones = Array.from(new Set(phones));
  const returnRate = phones.length > 0 
    ? Math.round(((phones.length - uniquePhones.length) / phones.length) * 100) 
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-dark">Welcome back, {shop?.shop_name || "Seller"}!</h1>
          <p className="text-ngray text-sm mt-1">Here&apos;s how your shop is performing today.</p>
        </div>
        <span className="bg-orange-tint text-orange-deep text-xs font-bold px-3 py-1.5 rounded-full capitalize">
          {activePlan} Plan
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Sales Today" value={`৳${salesToday.toLocaleString()}`} />
        <StatCard label="Sales This Week" value={`৳${salesThisWeek.toLocaleString()}`} />
        <StatCard label="Sales Monthly" value={`৳${salesMonthly.toLocaleString()}`} />
        <StatCard label="Total Orders" value={totalOrders.toString()} />
        <StatCard label="Top Selling Product" value={topProduct} locked={!isStandardPlus} />
        <StatCard label="Revenue by Area" value="Dhanmondi: 40%" locked={!isPremium} />
        <StatCard label="Customer Return Rate" value={`${returnRate}%`} locked={!isPremium} />
        <StatCard label="Monthly Growth" value="+15.2%" locked={!isPremium} />
      </div>

      {/* Recent orders preview */}
      <div className="bg-white border border-ngray-light rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-ngray-light flex justify-between items-center">
          <h3 className="font-bold text-dark text-sm">Recent Orders</h3>
          <span onClick={() => onNavigate("orders")} className="text-orange text-xs font-bold cursor-pointer hover:underline">
            View all →
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream text-left text-xs font-semibold text-ngray">
              <th className="px-5 py-3">Order ID</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 4).map((o) => (
              <tr key={o.id} className="border-b border-ngray-light last:border-0">
                <td className="px-5 py-3 font-semibold text-dark text-xs truncate max-w-[120px]">{o.id}</td>
                <td className="px-5 py-3 text-gray-600">{o.customer_name || "Guest Customer"}</td>
                <td className="px-5 py-3 text-gray-600 font-bold text-orange">৳{o.total_amount?.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${statusStyles[o.status] || "bg-warning/15 text-warning"}`}>
                    {o.status || "pending"}
                  </span>
                </td>
                <td className="px-5 py-3 text-ngray text-xs text-right">
                  {o.created_at ? new Date(o.created_at).toLocaleDateString() : "Today"}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ngray">
                  No orders placed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Products Page ──────────────────────────────────────────────────────────────
function ProductsPage({
  shop,
  products,
  categories,
  onSaveProduct,
  onDeleteProduct,
}: {
  shop: any;
  products: any[];
  categories: any[];
  onSaveProduct: (data: any, isEdit: boolean) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const handleEdit = (p: any) => {
    setEditingProduct(p);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleSaveSuccess = async (formData: any) => {
    const success = await onSaveProduct(formData, !!editingProduct);
    if (success) {
      setShowForm(false);
      setEditingProduct(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Products</h1>
          <p className="text-ngray text-sm mt-1">{products.length} products in your shop</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingProduct(null);
            } else {
              handleAddClick();
            }
          }}
          className="bg-orange text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-orange-light transition-colors"
        >
          {showForm ? "← Back to list" : "+ Add Product"}
        </button>
      </div>

      {showForm ? (
        <AddProductForm
          categories={categories}
          initialData={editingProduct}
          onSave={handleSaveSuccess}
        />
      ) : (
        <ProductsTable
          products={products}
          onEdit={handleEdit}
          onDelete={onDeleteProduct}
        />
      )}
    </div>
  );
}

function ProductsTable({
  products,
  onEdit,
  onDelete,
}: {
  products: any[];
  onEdit: (p: any) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-ngray-light rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-cream text-left">
            <th className="px-5 py-3 font-semibold text-ngray text-xs">Product</th>
            <th className="px-5 py-3 font-semibold text-ngray text-xs">Category</th>
            <th className="px-5 py-3 font-semibold text-ngray text-xs">Price</th>
            <th className="px-5 py-3 font-semibold text-ngray text-xs">Stock</th>
            <th className="px-5 py-3 font-semibold text-ngray text-xs">Status</th>
            <th className="px-5 py-3 font-semibold text-ngray text-xs text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-ngray-light">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={p.image_url || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&q=80"}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-dark">{p.name}</span>
                    {p.description && <span className="text-xs text-ngray max-w-[200px] truncate">{p.description}</span>}
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-gray-600">{p.category || "General"}</td>
              <td className="px-5 py-3 font-bold text-orange">৳{p.selling_price || p.price}</td>
              <td className="px-5 py-3">
                {p.stock === 0 ? (
                  <span className="text-danger font-semibold text-xs">Out of stock</span>
                ) : (
                  <span className="text-gray-600">{p.stock} units</span>
                )}
              </td>
              <td className="px-5 py-3">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${p.is_available ? "bg-success/15 text-success" : "bg-ngray-light text-ngray"}`}>
                  {p.is_available ? "Active" : "Unpublished"}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <span onClick={() => onEdit(p)} className="text-orange text-xs font-bold cursor-pointer mr-3 hover:underline">
                  Edit
                </span>
                <span onClick={() => { if(confirm("Delete product?")) onDelete(p.id) }} className="text-danger text-xs font-bold cursor-pointer hover:underline">
                  Delete
                </span>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-ngray">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AddProductForm({
  categories,
  initialData,
  onSave,
}: {
  categories: any[];
  initialData?: any;
  onSave: (data: any) => void;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [sellingPrice, setSellingPrice] = useState(initialData?.selling_price || "");
  const [costPrice, setCostPrice] = useState(initialData?.cost_price || "");
  const [stock, setStock] = useState(initialData?.stock || 10);
  const [category, setCategory] = useState(initialData?.category || (categories[0]?.name || "Cakes"));
  const [isAvailable, setIsAvailable] = useState(initialData?.is_available !== false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      id: initialData?.id,
      name,
      description,
      price: parseFloat(price) || 0,
      selling_price: parseFloat(sellingPrice) || parseFloat(price) || 0,
      cost_price: parseFloat(costPrice) || 0,
      stock: parseInt(stock as any) || 0,
      category,
      is_available: isAvailable,
      image_url: initialData?.image_url || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80",
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ngray-light rounded-2xl p-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-dark mb-1.5">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chocolate Truffle Cake"
            className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange transition-colors"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-semibold text-dark mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe your product..."
            className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">
            Total Cost <span className="text-ngray font-normal text-xs">(internal)</span>
          </label>
          <input
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="৳0"
            className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">Selling Price</label>
          <input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="৳0"
            className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">Stock Quantity</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value as any)}
            placeholder="10"
            className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange transition-colors bg-white"
          >
            {categories.map((c) => (
              <option key={c.id || c.name} value={c.name}>{c.name}</option>
            ))}
            {categories.length === 0 && (
              <>
                <option value="Cakes">Cakes</option>
                <option value="Cupcakes">Cupcakes</option>
                <option value="Slices">Slices</option>
              </>
            )}
          </select>
        </div>

        <div className="col-span-2 flex items-center gap-3 bg-cream rounded-xl px-4 py-3">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="w-4 h-4 accent-orange"
          />
          <span className="text-sm font-medium text-dark">Publish immediately (Active)</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full mt-6 bg-orange text-white font-bold text-sm py-3 rounded-full hover:bg-orange-light transition-colors"
      >
        {saving ? "Saving..." : "Save Product"}
      </button>
    </form>
  );
}

// ─── Orders Page ─────────────────────────────────────────────────────────────────
function OrdersPage({
  orders,
  onUpdateStatus,
}: {
  orders: any[];
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}) {
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-1">Orders</h1>
      <p className="text-ngray text-sm mb-6">Manage and track all your shop orders in real-time.</p>

      <div className="flex gap-2 mb-5">
        {(["all", "pending", "confirmed", "delivered", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-bold px-4 py-2 rounded-full capitalize transition-colors
              ${filter === f ? "bg-orange text-white" : "bg-cream text-ngray hover:bg-orange-tint"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white border border-ngray-light rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream text-left text-xs font-semibold text-ngray">
              <th className="px-5 py-3">Order ID</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Address</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-ngray-light">
                <td className="px-5 py-3 font-semibold text-dark text-xs truncate max-w-[120px]">{o.id}</td>
                <td className="px-5 py-3 text-gray-600 font-medium">{o.customer_name || "Guest Customer"}</td>
                <td className="px-5 py-3 text-gray-600 font-mono text-xs">{o.customer_phone || "-"}</td>
                <td className="px-5 py-3 text-gray-600 text-xs truncate max-w-[150px]">{o.customer_address || "-"}</td>
                <td className="px-5 py-3 font-bold text-orange">৳{o.total_amount?.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${statusStyles[o.status] || "bg-warning/15 text-warning"}`}>
                    {o.status || "pending"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <select
                    value={o.status || "pending"}
                    onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                    className="border border-ngray-light rounded-lg px-2 py-1 text-xs outline-none bg-white font-semibold text-dark cursor-pointer focus:border-orange"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-ngray">
                  No orders found under this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Revenue Page ────────────────────────────────────────────────────────────────
function RevenuePage({ shop, orders }: { shop: any; orders: any[] }) {
  const isPremium = shop?.plan === "premium";

  // Calculations
  const salesThisMonth = orders
    .filter((o) => {
      const now = new Date();
      const orderDate = new Date(o.created_at);
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear() &&
        o.status !== "cancelled"
      );
    })
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const commissionRate = 0.025; // 2.5% platform rate
  const commissionPaid = salesThisMonth * commissionRate;
  const netEarnings = salesThisMonth - commissionPaid;

  // Simple dynamic daily bar calculations
  const getWeeklySalesData = () => {
    const weeklySales = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    orders.forEach((o) => {
      const d = new Date(o.created_at);
      if (d >= startOfWeek && o.status !== "cancelled") {
        weeklySales[d.getDay()] += o.total_amount || 0;
      }
    });

    // Rotate array so it matches Mon - Sun: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    return [...weeklySales.slice(1), weeklySales[0]];
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklySales = getWeeklySalesData();
  const maxSale = Math.max(...weeklySales, 1);
  const bars = weeklySales.map((val) => (val / maxSale) * 100);

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-1">Revenue</h1>
      <p className="text-ngray text-sm mb-6">Track your earnings over time</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="This Month Sales" value={`৳${salesThisMonth.toLocaleString()}`} />
        <StatCard label="Commission Paid (2.5%)" value={`৳${Math.round(commissionPaid).toLocaleString()}`} />
        <StatCard label="Net Earnings" value={`৳${Math.round(netEarnings).toLocaleString()}`} />
      </div>

      {/* Simple bar chart */}
      <div className="bg-white border border-ngray-light rounded-2xl p-6 mb-6">
        <h3 className="font-bold text-dark text-sm mb-5">Weekly Sales Overview</h3>
        <div className="flex items-end gap-4 h-40">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 bg-dark text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow">
                ৳{weeklySales[i].toLocaleString()}
              </div>
              <div
                className="w-full bg-orange rounded-t-lg hover:bg-orange-deep transition-colors"
                style={{ height: `${Math.max(h, 4)}%` }}
              />
              <span className="text-[11px] text-ngray font-medium">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Premium: Revenue by area */}
      <div className="bg-white border border-ngray-light rounded-2xl p-6 relative overflow-hidden">
        {!isPremium && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-10">
            <span className="text-2xl">🔒</span>
            <span className="text-sm font-bold text-orange-deep">Upgrade to Premium to unlock</span>
          </div>
        )}
        <h3 className="font-bold text-dark text-sm mb-4">Revenue by Area</h3>
        <div className="flex flex-col gap-3">
          {[
            { area: "Dhanmondi", pct: 40 },
            { area: "Gulshan", pct: 25 },
            { area: "Mirpur", pct: 18 },
            { area: "Uttara", pct: 11 },
            { area: "Others", pct: 6 },
          ].map((a) => (
            <div key={a.area} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-20">{a.area}</span>
              <div className="flex-1 h-2 bg-cream rounded-full overflow-hidden">
                <div className="h-full bg-orange rounded-full" style={{ width: `${a.pct}%` }} />
              </div>
              <span className="text-xs font-bold text-dark w-8">{a.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shop Settings Page ──────────────────────────────────────────────────────────
function ShopSettingsPage({
  shop,
  onSaveSettings,
}: {
  shop: any;
  onSaveSettings: (data: any) => Promise<void>;
}) {
  const [shopName, setShopName] = useState(shop?.shop_name || "");
  const [description, setDescription] = useState(shop?.description || "");
  const [city, setCity] = useState(shop?.city || "Dhaka");
  const [deliveryInside, setDeliveryInside] = useState(shop?.delivery_inside_city || 0);
  const [deliveryOutside, setDeliveryOutside] = useState(shop?.delivery_outside_city || 0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await onSaveSettings({
        shop_name: shopName,
        description,
        city,
        delivery_inside_city: parseFloat(deliveryInside as any) || 0,
        delivery_outside_city: parseFloat(deliveryOutside as any) || 0,
      });
      setMsg("✅ Shop settings updated successfully!");
    } catch (err: any) {
      setMsg("❌ Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-ngray-light rounded-2xl p-6">
      <h2 className="text-xl font-bold text-dark mb-1">Shop Settings</h2>
      <p className="text-ngray text-sm mb-6">Manage your shop name, description, city, and shipping rates.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">Shop Name</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange transition-colors resize-none"
            placeholder="Tell buyers about your shop..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark mb-1.5">City</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange bg-white transition-colors"
          >
            {["Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi", "Rangpur"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Delivery Inside City (৳)</label>
            <input
              type="number"
              value={deliveryInside}
              onChange={(e) => setDeliveryInside(e.target.value as any)}
              className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Delivery Outside City (৳)</label>
            <input
              type="number"
              value={deliveryOutside}
              onChange={(e) => setDeliveryOutside(e.target.value as any)}
              className="w-full border border-ngray-light rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange transition-colors"
            />
          </div>
        </div>

        {msg && <p className={`text-sm ${msg.startsWith("✅") ? "text-success" : "text-danger"}`}>{msg}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orange text-white font-bold text-sm py-3 rounded-full hover:bg-orange-light transition-colors"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

// ─── Theme Customizer Page ───────────────────────────────────────────────────────
const THEMES = {
  basic: [
    { id: "basic-clean", name: "Clean White", colors: { bg: "#FFFFFF", primary: "#1B1F5E", accent: "#F5A623" }, desc: "Simple, minimal, professional" },
    { id: "basic-soft", name: "Soft Lilac", colors: { bg: "#F5F3FF", primary: "#6D28D9", accent: "#EC4899" }, desc: "Soft purple tones, feminine" },
    { id: "basic-earth", name: "Earthy Green", colors: { bg: "#F0FDF4", primary: "#166534", accent: "#F59E0B" }, desc: "Natural, organic feel" },
  ],
  standard: [
    { id: "std-navy", name: "Navy Gold", colors: { bg: "#F7F8FF", primary: "#1B1F5E", accent: "#F5A623" }, desc: "Bold and trustworthy" },
    { id: "std-rose", name: "Rose Modern", colors: { bg: "#FFF1F2", primary: "#BE123C", accent: "#F59E0B" }, desc: "Trendy, fashion-forward" },
    { id: "std-dark", name: "Dark Minimal", colors: { bg: "#111827", primary: "#F9FAFB", accent: "#F5A623" }, desc: "Sleek dark mode shop" },
  ],
  premium: [
    { id: "pre-luxury", name: "Luxury Black", colors: { bg: "#0A0A0A", primary: "#F5A623", accent: "#FFFFFF" }, desc: "Premium luxury brand feel" },
    { id: "pre-royal", name: "Royal Blue", colors: { bg: "#EFF6FF", primary: "#1D4ED8", accent: "#7C3AED" }, desc: "Corporate, high-end" },
    { id: "pre-blush", name: "Blush Premium", colors: { bg: "#FFF7F7", primary: "#9F1239", accent: "#F59E0B" }, desc: "Elegant, bridal & fashion" },
  ],
};

function ThemeCustomizerPage({
  shop,
  onSaveTheme,
}: {
  shop: any;
  onSaveTheme: (themeId: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState(shop?.theme_id || "basic-clean");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      await onSaveTheme(selected);
      setMsg("✅ Theme updated successfully!");
    } catch (err: any) {
      setMsg("❌ Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-ngray-light rounded-2xl p-6">
      <h2 className="text-xl font-bold text-dark mb-1">Theme Customizer</h2>
      <p className="text-ngray text-sm mb-6">
        Select a visual theme that suits your brand identity. (Available based on your <strong>{shop?.plan || "Basic"}</strong> plan).
      </p>

      <div className="space-y-6">
        {(["basic", "standard", "premium"] as const).map((tier) => {
          const tierThemes = THEMES[tier];
          const isLocked = (tier === "standard" && shop?.plan === "basic") || (tier === "premium" && shop?.plan !== "premium");

          return (
            <div key={tier}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-bold text-dark uppercase tracking-wider capitalize">{tier} Themes</h3>
                {isLocked && <span className="bg-warning/15 text-warning text-[10px] font-bold px-2 py-0.5 rounded-full">🔒 Locked</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tierThemes.map((theme) => {
                  const isSelected = selected === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => !isLocked && setSelected(theme.id)}
                      className={`border rounded-xl overflow-hidden cursor-pointer transition-all ${
                        isSelected ? "border-orange ring-2 ring-orange/20" : "border-ngray-light hover:border-gray-400"
                      } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="p-4" style={{ background: theme.colors.bg, height: "100px" }}>
                        <div className="h-4 rounded mb-2 w-2/3" style={{ background: theme.colors.primary }} />
                        <div className="flex gap-1">
                          <div className="h-8 rounded w-1/3" style={{ background: `${theme.colors.primary}15` }} />
                          <div className="h-8 rounded w-1/3" style={{ background: `${theme.colors.primary}15` }} />
                          <div className="h-8 rounded w-1/3" style={{ background: `${theme.colors.primary}15` }} />
                        </div>
                      </div>
                      <div className="p-3 bg-cream border-t border-ngray-light">
                        <div className="font-bold text-xs text-dark">{theme.name}</div>
                        <div className="text-[10px] text-ngray mt-0.5">{theme.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {msg && <p className={`text-sm ${msg.startsWith("✅") ? "text-success" : "text-danger"}`}>{msg}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange text-white font-bold text-sm py-3 rounded-full hover:bg-orange-light transition-colors mt-4"
        >
          {saving ? "Saving..." : "Save Theme"}
        </button>
      </div>
    </div>
  );
}

// ─── Account Page ────────────────────────────────────────────────────────────────
function AccountPage({ user, shop }: { user: any; shop: any }) {
  return (
    <div className="max-w-2xl bg-white border border-ngray-light rounded-2xl p-6">
      <h2 className="text-xl font-bold text-dark mb-1">Account & Billing</h2>
      <p className="text-ngray text-sm mb-6">Manage your credentials and view subscription plans.</p>

      <div className="space-y-6">
        <div className="border-b border-ngray-light pb-4">
          <div className="text-xs text-ngray font-bold uppercase tracking-wider mb-2">User Profile</div>
          <div className="flex flex-col gap-1.5 text-sm">
            <div><strong className="text-dark">Email:</strong> <span className="text-gray-600">{user?.email}</span></div>
            <div><strong className="text-dark">Seller User ID:</strong> <span className="text-gray-600 font-mono text-xs">{user?.id}</span></div>
          </div>
        </div>

        <div>
          <div className="text-xs text-ngray font-bold uppercase tracking-wider mb-2">Subscription Package</div>
          <div className="bg-orange-tint border border-orange-tint/50 rounded-xl p-4 flex justify-between items-center">
            <div>
              <div className="text-orange-deep font-extrabold text-base capitalize">{shop?.plan || "Basic"} Plan</div>
              <div className="text-xs text-orange-deep/80 mt-0.5">Your shop is registered and active on the marketplace.</div>
            </div>
            <span className="bg-white text-orange-deep text-xs font-bold px-3 py-1.5 rounded-full border border-orange-deep/20">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [active, setActive] = useState("overview");

  // Auth & DB state
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (userId: string) => {
    try {
      // 1. Fetch shop
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("seller_id", userId)
        .single();

      if (shopError) {
        console.error("No shop found for this seller:", shopError.message);
        return;
      }

      setShop(shopData);

      // 2. Fetch products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopData.id)
        .order("created_at", { ascending: false });
      setProducts(productsData || []);

      // 3. Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("shop_id", shopData.id)
        .order("created_at", { ascending: false });
      setOrders(ordersData || []);

      // 4. Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      setCategories(categoriesData || []);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      await loadData(user.id);
      setLoading(false);
    };
    init();
  }, [router]);

  // Actions
  const handleSaveProduct = async (formData: any, isEdit: boolean): Promise<boolean> => {
    if (!shop) return false;
    try {
      if (isEdit) {
        const { error } = await supabase
          .from("products")
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            selling_price: formData.selling_price,
            cost_price: formData.cost_price,
            stock: formData.stock,
            category: formData.category,
            is_available: formData.is_available,
            image_url: formData.image_url,
          })
          .eq("id", formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert({
            shop_id: shop.id,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            selling_price: formData.selling_price,
            cost_price: formData.cost_price,
            stock: formData.stock,
            category: formData.category,
            is_available: formData.is_available,
            image_url: formData.image_url,
          });
        if (error) throw error;
      }
      // Reload products list
      await loadData(user.id);
      return true;
    } catch (err: any) {
      alert("Error saving product: " + err.message);
      return false;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await loadData(user.id);
    } catch (err: any) {
      alert("Error deleting product: " + err.message);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      await loadData(user.id);
    } catch (err: any) {
      alert("Error updating order status: " + err.message);
    }
  };

  const handleSaveSettings = async (formData: any) => {
    if (!shop) return;
    const { error } = await supabase
      .from("shops")
      .update(formData)
      .eq("id", shop.id);
    if (error) throw error;
    await loadData(user.id);
  };

  const handleSaveTheme = async (themeId: string) => {
    if (!shop) return;
    const { error } = await supabase
      .from("shops")
      .update({ theme_id: themeId })
      .eq("id", shop.id);
    if (error) throw error;
    await loadData(user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange mx-auto mb-4" />
          <p className="text-sm font-bold text-dark">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center font-sans p-4">
        <div className="max-w-md bg-white border border-ngray-light rounded-2xl p-8 text-center shadow-sm">
          <span className="text-5xl">🏪</span>
          <h2 className="text-xl font-bold text-dark mt-4 mb-2">No Shop Created Yet</h2>
          <p className="text-ngray text-sm mb-6">
            Your seller application might be under review by our admin team. Once approved, your digital shop is instantly live!
          </p>
          <button
            onClick={handleLogout}
            className="bg-orange text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-orange-light transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (active) {
      case "overview":
        return (
          <OverviewPage
            shop={shop}
            products={products}
            orders={orders}
            onNavigate={setActive}
          />
        );
      case "products":
        return (
          <ProductsPage
            shop={shop}
            products={products}
            categories={categories}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case "orders":
        return (
          <OrdersPage
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        );
      case "revenue":
        return <RevenuePage shop={shop} orders={orders} />;
      case "settings":
        return <ShopSettingsPage shop={shop} onSaveSettings={handleSaveSettings} />;
      case "theme":
        return <ThemeCustomizerPage shop={shop} onSaveTheme={handleSaveTheme} />;
      case "account":
        return <AccountPage user={user} shop={shop} />;
      default:
        return (
          <OverviewPage
            shop={shop}
            products={products}
            orders={orders}
            onNavigate={setActive}
          />
        );
    }
  };

  return (
    <div className="flex bg-cream min-h-screen font-sans">
      <Sidebar active={active} setActive={setActive} onLogout={handleLogout} />
      <main className="flex-1 px-8 py-7 overflow-y-auto max-h-screen">{renderPage()}</main>
    </div>
  );
}
