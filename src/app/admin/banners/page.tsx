"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { bannerAPI } from "@/lib/api";

type Banner = {
  id: number;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl: string;
  bgColor?: string;
  sortOrder: number;
  enabled: boolean;
};

type BannerForm = {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  bgColor: string;
  sortOrder: string;
};

const emptyForm: BannerForm = {
  title: "",
  subtitle: "",
  ctaText: "",
  ctaLink: "",
  imageUrl: "",
  bgColor: "#f5f5f7",
  sortOrder: "0",
};

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await bannerAPI.getAll();
      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      ctaText: banner.ctaText || "",
      ctaLink: banner.ctaLink || "",
      imageUrl: banner.imageUrl,
      bgColor: banner.bgColor || "#f5f5f7",
      sortOrder: String(banner.sortOrder),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      title: form.title,
      subtitle: form.subtitle,
      ctaText: form.ctaText,
      ctaLink: form.ctaLink,
      imageUrl: form.imageUrl,
      bgColor: form.bgColor,
      sortOrder: Number(form.sortOrder),
    };

    try {
      if (editingId) {
        await bannerAPI.update(editingId, data);
      } else {
        await bannerAPI.create(data);
      }
      await fetchBanners();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save banner:', error);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await bannerAPI.toggle(id);
      await fetchBanners();
    } catch (error) {
      console.error('Failed to toggle banner:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await bannerAPI.delete(deletingId);
      await fetchBanners();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Failed to delete banner:', error);
      alert('刪除失敗');
    }
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
        <h1 className="text-2xl font-bold">輪播管理</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors"
        >
          <Plus size={16} /> 新增輪播
        </button>
      </div>

      {/* Table */}
      <div className="card bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="card-body p-0">
          {banners.length === 0 ? (
            <div className="text-center py-12 text-base-content/40">尚無輪播資料</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-center w-16">縮圖</th>
                    <th className="text-center">標題</th>
                    <th className="text-center">副標題</th>
                    <th className="text-center w-24">背景色</th>
                    <th className="text-center w-20">排序</th>
                    <th className="text-center w-24">狀態</th>
                    <th className="text-center w-32">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr key={banner.id}>
                      <td className="text-center">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.title}
                          width={50}
                          height={50}
                          className="rounded object-cover mx-auto"
                        />
                      </td>
                      <td className="text-center font-medium">{banner.title}</td>
                      <td className="text-center text-base-content/50">{banner.subtitle || "-"}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: banner.bgColor || "#f5f5f7" }}
                          />
                          <span className="text-xs text-base-content/50">{banner.bgColor}</span>
                        </div>
                      </td>
                      <td className="text-center">{banner.sortOrder}</td>
                      <td className="text-center">
                        <button
                          onClick={() => handleToggle(banner.id)}
                          className={`text-sm font-medium ${
                            banner.enabled ? "text-emerald-600" : "text-gray-400"
                          }`}
                        >
                          {banner.enabled ? "啟用" : "停用"}
                        </button>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(banner)}
                            className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-gray-300 text-base-content/60 hover:bg-gray-100 transition-colors"
                            aria-label="編輯"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingId(banner.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-error/30 text-error/60 hover:bg-error/10 transition-colors"
                            aria-label="刪除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "編輯輪播" : "新增輪播"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">標題</label>
              <input
                className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">副標題</label>
              <input
                className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-base-content/60 mb-1 block">CTA 文字</label>
                <input
                  className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
                  value={form.ctaText}
                  onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-base-content/60 mb-1 block">CTA 連結</label>
                <input
                  className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
                  value={form.ctaLink}
                  onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">圖片 URL</label>
              <input
                className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-base-content/60 mb-1 block">背景色</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-12 h-10 border border-base-200 rounded-xl cursor-pointer"
                    value={form.bgColor}
                    onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
                    value={form.bgColor}
                    onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-base-content/60 mb-1 block">排序</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-gray-300 text-base-content/70 hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors"
            >
              {saving ? <span className="loading loading-spinner loading-xs mr-2" /> : null}
              儲存
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-base-content/60 py-4">確定要刪除此輪播嗎？此操作無法復原。</p>
          <DialogFooter>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-gray-300 text-base-content/70 hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            >
              刪除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
