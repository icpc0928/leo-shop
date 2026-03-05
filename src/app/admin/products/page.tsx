"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { mockProducts, categories as mockCategories } from "@/lib/mockData";
import { productAPI, adminProductAPI } from "@/lib/api";
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
      const cats = await productAPI.getCategories();
      setCategories(cats);
    } catch {
      // keep mock categories
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
        <button onClick={openAdd} className="btn btn-primary btn-sm gap-2">
          <Plus size={16} /> 新增商品
        </button>
      </div>

      {/* Search */}
      <div className="form-control">
        <div className="input-group flex">
          <span className="bg-base-200 flex items-center px-3"><Search className="w-4 h-4 text-base-content/40" /></span>
          <input type="text" placeholder="搜尋商品名稱或分類…" value={search} name="search" autoComplete="off" aria-label="搜尋商品"
            onChange={(e) => setSearch(e.target.value)} className="input input-bordered flex-1" />
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-[60px]">圖片</th>
                  <th>名稱</th>
                  <th>分類</th>
                  <th className="text-right">價格</th>
                  <th className="text-right">庫存</th>
                  <th>狀態</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <Image src={resolveImageUrl(product.images?.[0] || product.imageUrl || "https://picsum.photos/40/40")} alt={product.name} width={40} height={40} className="rounded object-cover" />
                    </td>
                    <td className="font-medium">{product.name}</td>
                    <td className="text-base-content/50">{product.category}</td>
                    <td className="text-right tabular-nums">{formatCurrency(product.price)}</td>
                    <td className="text-right">{product.stock}</td>
                    <td>
                      <span className={`inline-block min-w-[60px] px-3 py-1.5 rounded-full text-xs font-medium text-center ${
                        product.active !== false ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                      }`}>
                        {product.active !== false ? "上架" : "下架"}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(product)} className="btn btn-ghost btn-xs btn-square" aria-label="Edit product">
                          <Pencil size={14} aria-hidden="true" />
                        </button>
                        <button onClick={() => { setDeletingId(product.id); setDeleteDialogOpen(true); }}
                          className="btn btn-ghost btn-xs btn-square text-error" aria-label="Delete product">
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
          <div className="space-y-4 py-4">
            <div className="form-control"><label className="label"><span className="label-text">名稱</span></label>
              <input className="input input-bordered w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-control"><label className="label"><span className="label-text">Slug</span></label>
              <input className="input input-bordered w-full" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
            <div className="form-control"><label className="label"><span className="label-text">描述</span></label>
              <textarea className="textarea textarea-bordered w-full" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control"><label className="label"><span className="label-text">價格</span></label>
                <input type="number" className="input input-bordered w-full" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div className="form-control"><label className="label"><span className="label-text">比較價</span></label>
                <input type="number" className="input input-bordered w-full" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control"><label className="label"><span className="label-text">分類</span></label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="選擇分類" /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select></div>
              <div className="form-control"><label className="label"><span className="label-text">庫存</span></label>
                <input type="number" className="input input-bordered w-full" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            </div>
            <div className="form-control"><label className="label"><span className="label-text">商品圖片</span></label>
              <ImageUploader
                existingImages={form.imageUrls}
                onChange={(urls) => setForm({ ...form, imageUrls: urls })}
              /></div>
            <label className="label cursor-pointer justify-start gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="checkbox checkbox-sm checkbox-primary" />
              <span className="label-text">啟用</span>
            </label>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="btn btn-ghost btn-sm">取消</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">
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
            <button onClick={() => setDeleteDialogOpen(false)} className="btn btn-ghost btn-sm">取消</button>
            <button onClick={handleDelete} className="btn btn-error btn-sm">刪除</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
