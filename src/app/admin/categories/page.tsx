"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { adminCategoryAPI } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryForm = {
  name: string;
  description: string;
  sortOrder: string;
  active: boolean;
};

const emptyForm: CategoryForm = {
  name: "",
  description: "",
  sortOrder: "0",
  active: true,
};

function toForm(c: Category): CategoryForm {
  return {
    name: c.name,
    description: c.description || "",
    sortOrder: String(c.sortOrder),
    active: c.active,
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await adminCategoryAPI.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm(toForm(c));
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("請輸入分類名稱");
      return;
    }
    setSaving(true);
    setError("");
    const data = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      sortOrder: Number(form.sortOrder),
      active: form.active,
    };
    try {
      if (editingId) {
        await adminCategoryAPI.update(editingId, data);
      } else {
        await adminCategoryAPI.create(data);
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    setError("");
    try {
      await adminCategoryAPI.delete(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "刪除失敗");
    } finally {
      setSaving(false);
    }
  };

  const moveSortOrder = (id: number, direction: "up" | "down") => {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === categories.length - 1) return;

    const newCategories = [...categories];
    const target = direction === "up" ? idx - 1 : idx + 1;
    [newCategories[idx], newCategories[target]] = [newCategories[target], newCategories[idx]];

    // Update sortOrder
    newCategories.forEach((c, i) => {
      c.sortOrder = i;
      adminCategoryAPI.update(c.id, {
        name: c.name,
        description: c.description || undefined,
        sortOrder: c.sortOrder,
        active: c.active,
      }).catch(console.error);
    });

    setCategories(newCategories);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">商品分類管理</h1>
          <p className="text-sm text-base-content/60 mt-1">管理商品分類與排序</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors">
          <Plus size={18} />
          新增分類
        </button>
      </div>

      <div className="overflow-x-auto bg-base-100 border border-base-200 rounded-2xl">
        <table className="table">
          <thead>
            <tr>
              <th className="w-12 text-center">排序</th>
              <th className="text-center">名稱</th>
              <th className="text-center">描述</th>
              <th className="w-32 text-center">狀態</th>
              <th className="w-40 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, idx) => (
              <tr key={c.id} className="hover">
                <td className="text-center">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveSortOrder(c.id, "up")}
                      disabled={idx === 0}
                      className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-gray-300 text-base-content/60 hover:bg-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="上移"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveSortOrder(c.id, "down")}
                      disabled={idx === categories.length - 1}
                      className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-gray-300 text-base-content/60 hover:bg-gray-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="下移"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </td>
                <td className="text-center font-medium">{c.name}</td>
                <td className="text-center text-sm text-base-content/60 max-w-md truncate">
                  {c.description || "—"}
                </td>
                <td className="text-center">
                  <span
                    className={`inline-flex items-center justify-center min-w-[60px] px-3 py-1 rounded-full text-xs font-medium border ${
                      c.active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                        : "border-gray-200 bg-gray-50 text-gray-400"
                    }`}
                  >
                    {c.active ? "上架" : "下架"}
                  </span>
                </td>
                <td className="text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => openEdit(c)}
                      className="w-8 h-8 rounded-full inline-flex items-center justify-center border border-gray-300 text-base-content/60 hover:bg-gray-300 transition-colors cursor-pointer"
                      title="編輯"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(c.id);
                        setError("");
                        setDeleteDialogOpen(true);
                      }}
                      className="w-8 h-8 rounded-full inline-flex items-center justify-center border border-error/30 text-error/60 hover:bg-error/10 transition-colors cursor-pointer"
                      title="刪除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-base-content/60 py-8">
                  尚無分類資料
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "編輯分類" : "新增分類"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {error && (
              <div className="text-sm text-red-500 border border-red-200 bg-red-50 rounded-xl px-4 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">名稱 *</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例如：上衣、褲子、配件"
              />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">描述</label>
              <textarea
                className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors min-h-[80px]"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="選填"
              />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">排序順序</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between border border-base-200 rounded-xl px-4 py-3">
              <span className="text-sm">啟用此分類</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} disabled={saving}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-gray-300 text-base-content/70 hover:bg-gray-100 transition-colors cursor-pointer">
              取消
            </button>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors cursor-pointer">
              {saving && <span className="loading loading-spinner loading-xs" />}
              儲存
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {error && (
              <div className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}
            <p>確定要刪除此分類嗎？如果有商品使用此分類，將無法刪除。</p>
          </div>
          <DialogFooter>
            <button
              onClick={() => { setDeleteDialogOpen(false); setDeletingId(null); setError(""); }}
              disabled={saving}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-gray-300 text-base-content/70 hover:bg-gray-100 transition-colors cursor-pointer">
              取消
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer">
              {saving && <span className="loading loading-spinner loading-xs" />}
              刪除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
