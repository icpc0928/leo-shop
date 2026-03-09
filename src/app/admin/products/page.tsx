"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { mockProducts, categories as mockCategories } from "@/lib/mockData";
import { productAPI, adminProductAPI, categoryAPI } from "@/lib/api";
import { resolveImageUrl } from "@/lib/mappers";
import ImageUploader from "@/components/admin/ImageUploader";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types";

type ProductForm = {
  name: string; slug: string; description: string; price: string; comparePrice: string;
  category: string; stock: string; imageUrls: string[]; isActive: boolean;
};

const emptyForm: ProductForm = {
  name: "", slug: "", description: "", price: "", comparePrice: "",
  category: "", stock: "", imageUrls: [], isActive: true,
};

function productToForm(p: Product): ProductForm {
  return {
    name: p.name, slug: p.slug, description: p.description,
    price: String(p.price), comparePrice: p.comparePrice ? String(p.comparePrice) : "",
    category: p.category, stock: String(p.stock), imageUrls: p.images || [], isActive: p.active !== false,
  };
}

function mapApiProduct(p: Record<string, unknown>): Product {
  const imageUrls = (p.imageUrls as string[]) || [];
  const images = imageUrls.length > 0 ? imageUrls : p.imageUrl ? [p.imageUrl as string] : [];
  return {
    ...p,
    id: p.id as number,
    slug: p.slug as string,
    name: p.name as string,
    price: p.price as number,
    comparePrice: p.comparePrice as number | undefined,
    images,
    imageUrl: p.imageUrl as string | undefined,
    description: p.description as string,
    category: p.category as string,
    stock: p.stock as number,
    active: p.active as boolean,
    rating: 0,
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(mockCategories);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await adminProductAPI.getAll({ size: 100 });
      setProducts(data.content.map(mapApiProduct));
    } catch {
      console.warn('API unavailable, using mock products');
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getAll();
      const categoryNames = Array.isArray(data) ? data.map((c: any) => c.name) : [];
      setCategories(categoryNames);
    } catch {
      // Fallback to product API
      try {
        const cats = await productAPI.getCategories();
        setCategories(cats);
      } catch {
        // keep mock categories
      }
    }
  };

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditingId(p.id); setForm(productToForm(p)); setDialogOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    const productData = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      imageUrl: form.imageUrls[0] || "https://picsum.photos/seed/new/600/600",
      imageUrls: form.imageUrls,
      category: form.category,
      stock: Number(form.stock),
      active: form.isActive,
    };

    try {
      if (editingId) {
        await adminProductAPI.update(Number(editingId), productData);
      } else {
        await adminProductAPI.create(productData);
      }
      await fetchProducts();
    } catch {
      console.warn('Admin API unavailable, using local state');
      if (editingId) {
        setProducts((prev) => prev.map((p) => String(p.id) === String(editingId) ? {
          ...p, name: form.name, slug: form.slug, description: form.description,
          price: Number(form.price), comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
          category: form.category, stock: Number(form.stock), images: form.imageUrls.length > 0 ? form.imageUrls : p.images,
        } : p));
      } else {
        const newProduct: Product = {
          id: Date.now(), name: form.name, slug: form.slug, description: form.description,
          price: Number(form.price), comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
          category: form.category, stock: Number(form.stock),
          images: form.imageUrls.length > 0 ? form.imageUrls : ["https://picsum.photos/seed/new/600/600"], rating: 0,
        };
        setProducts((prev) => [newProduct, ...prev]);
      }
    } finally {
      setSaving(false);
      setDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminProductAPI.delete(Number(deletingId));
      await fetchProducts();
    } catch {
      console.warn('Admin API unavailable, using local state');
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(deletingId)));
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors">
          <Plus size={16} /> 新增商品
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
        <input type="text" placeholder="搜尋商品名稱或分類…" value={search} name="search" autoComplete="off" aria-label="搜尋商品"
          onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-base-200 rounded-2xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" />
      </div>

      {/* Table */}
      <div className="card bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-[60px] text-center">圖片</th>
                  <th className="text-center">名稱</th>
                  <th className="text-center">分類</th>
                  <th className="text-center">價格</th>
                  <th className="text-center">庫存</th>
                  <th className="text-center">狀態</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id}>
                    <td className="text-center">
                      <Image src={resolveImageUrl(product.images?.[0] || product.imageUrl || "https://picsum.photos/40/40")} alt={product.name} width={40} height={40} className="rounded object-cover" />
                    </td>
                    <td className="text-center font-medium">{product.name}</td>
                    <td className="text-center text-base-content/50">{product.category}</td>
                    <td className="text-center tabular-nums">{formatCurrency(product.price)}</td>
                    <td className="text-center">{product.stock}</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center justify-center min-w-[60px] px-3 py-1 rounded-full text-xs font-medium border ${
                        product.active !== false ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-gray-200 bg-gray-50 text-gray-400"
                      }`}>
                        {product.active !== false ? "上架" : "下架"}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-full inline-flex items-center justify-center border border-gray-300 text-base-content/60 hover:bg-gray-300 transition-colors cursor-pointer" aria-label="Edit product">
                          <Pencil size={14} aria-hidden="true" />
                        </button>
                        <button onClick={() => { setDeletingId(product.id); setDeleteDialogOpen(true); }}
                          className="w-8 h-8 rounded-full inline-flex items-center justify-center border border-error/30 text-error/60 hover:bg-error/10 transition-colors cursor-pointer" aria-label="Delete product">
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "編輯商品" : "新增商品"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">名稱</label>
              <input className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">Slug</label>
              <input className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">描述</label>
              <textarea className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-base-content/60 mb-1 block">價格</label>
                <input type="number" className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-base-content/60 mb-1 block">比較價</label>
                <input type="number" className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-base-content/60 mb-1 block">分類</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm"><SelectValue placeholder="選擇分類" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-base-content/60 mb-1 block">庫存</label>
                <input type="number" className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">商品圖片</label>
              <ImageUploader
                existingImages={form.imageUrls}
                onChange={(urls) => setForm({ ...form, imageUrls: urls })}
              />
            </div>
            <div className="flex items-center justify-between border border-base-200 rounded-xl px-4 py-3">
              <span className="text-sm">商品啟用</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-gray-300 text-base-content/70 hover:bg-gray-100 transition-colors cursor-pointer">取消</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors cursor-pointer">
              {saving ? <span className="loading loading-spinner loading-xs" /> : null}
              儲存
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>確認刪除</DialogTitle></DialogHeader>
          <p className="text-sm text-base-content/60 py-4">確定要刪除此商品嗎？此操作無法復原。</p>
          <DialogFooter>
            <button onClick={() => setDeleteDialogOpen(false)} className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-gray-300 text-base-content/70 hover:bg-gray-100 transition-colors cursor-pointer">取消</button>
            <button onClick={handleDelete} className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer">刪除</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
