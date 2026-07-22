// src/app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import type { Category } from "@/app/lib/types";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function loadCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) setError(error.message);
    else setCategories(data as Category[]);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setImageFile(null);
    setImagePreview(null);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setImagePreview(cat.image_url);
    setImageFile(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let image_url: string | undefined = imagePreview ?? undefined;
      if (imageFile) {
        image_url = await uploadImage(imageFile);
      }

      if (editingId) {
        const { error } = await supabase
          .from("categories")
          .update({ name, slug: slugify(name), image_url })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const nextOrder = categories.length
          ? Math.max(...categories.map((c) => c.sort_order)) + 1
          : 1;
        const catId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `cat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const { error } = await supabase.from("categories").insert({
          id: catId,
          name,
          slug: slugify(name),
          image_url,
          sort_order: nextOrder,
          is_active: true,
        });
        if (error) throw error;
      }

      resetForm();
      await loadCategories();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? It will disappear from the landing page.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) setError(error.message);
    else await loadCategories();
  }

  async function toggleActive(cat: Category) {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !cat.is_active })
      .eq("id", cat.id);
    if (error) setError(error.message);
    else await loadCategories();
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Categories</h1>
        <p className="text-slate-500 text-sm mt-1">
          These show on the landing page &amp; explore page category grid.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-7 max-w-xl">
        <h2 className="text-base font-bold text-slate-800 mb-4">
          {editingId ? "Edit category" : "Add a category"}
        </h2>

        <div className="flex gap-5">
          {/* Image upload */}
          <div>
            <div className="w-24 h-24 rounded-xl bg-teal-50 border-2 border-dashed border-teal-500/30 overflow-hidden flex items-center justify-center relative">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-teal-700 text-xs font-semibold text-center px-2">
                  Upload photo
                </span>
              )}
            </div>
            <label className="block mt-2 text-center">
              <span className="text-[11px] font-bold text-teal-700 cursor-pointer hover:underline">
                {imagePreview ? "Change" : "Choose file"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Name + actions */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              Category name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Food & Cake"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 mb-4"
            />

            <div className="flex gap-2.5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-teal-600 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-teal-600-light transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Save changes" : "Add category"}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-sm font-semibold text-slate-500 px-5 py-2.5 rounded-full border border-slate-200 hover:border-gray-400 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-slate-500 text-sm">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="text-slate-500 text-sm">No categories yet — add one above.</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`bg-white border rounded-2xl overflow-hidden ${
                cat.is_active ? "border-slate-200" : "border-slate-200 opacity-50"
              }`}
            >
              <div className="h-28 bg-teal-50">
                {cat.image_url && (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3.5">
                <div className="text-sm font-bold text-slate-800 mb-0.5">{cat.name}</div>
                <div className="text-[11px] text-slate-500 mb-3">/{cat.slug}</div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleActive(cat)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      cat.is_active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {cat.is_active ? "Active" : "Hidden"}
                  </button>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-[11px] font-bold text-teal-700 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}