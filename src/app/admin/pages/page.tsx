"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { pageAPI } from "@/lib/api";

type SitePage = {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  content?: string;
  metaDescription?: string;
  enabled: boolean;
  updatedAt?: string;
};

type PageForm = {
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  metaDescription: string;
};

const emptyForm: PageForm = {
  slug: "",
  title: "",
  subtitle: "",
  content: "",
  metaDescription: "",
};

export default function AdminPages() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<PageForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    try {
      const data = await pageAPI.getAll();
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (page: SitePage) => {
    setEditingId(page.id);
    setForm({
      slug: page.slug,
      title: page.title,
      subtitle: page.subtitle || "",
      content: page.content || "",
      metaDescription: page.metaDescription || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await pageAPI.update(editingId, form);
      } else {
        await pageAPI.create(form);
      }
      await fetchPages();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save page:', error);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try { await pageAPI.toggle(id); await fetchPages(); } catch (error) { console.error(error); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await pageAPI.delete(deletingId);
      await fetchPages();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Failed to delete page:', error);
      alert('刪除失敗');
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('zh-TW') : '-';

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">頁面管理</h1>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors">
          <Plus size={16} /> 新增頁面
        </button>
      </div>

      <div className="card bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="card-body p-0">
          {pages.length === 0 ? (
            <div className="text-center py-12 text-base-content/40">尚無頁面資料</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-center">標題</th>
                    <th className="text-center">Slug</th>
                    <th className="text-center w-24">狀態</th>
                    <th className="text-center w-28">更新時間</th>
                    <th className="text-center w-32">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id}>
                      <td className="text-center font-medium">{page.title}</td>
                      <td className="text-center">
                        <span className="inline-flex items-center gap-1 text-sm text-base-content/50">
                          /{page.slug}
                          <ExternalLink size={12} />
                        </span>
                      </td>
                      <td className="text-center">
                        <button onClick={() => handleToggle(page.id)} className={`text-sm font-medium ${page.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                          {page.enabled ? "啟用" : "停用"}
                        </button>
                      </td>
                      <td className="text-center text-sm text-base-content/50">{formatDate(page.updatedAt)}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(page)} className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-gray-300 text-base-content/60 hover:bg-gray-100 transition-colors" aria-label="編輯"><Pencil size={14} /></button>
                          <button onClick={() => { setDeletingId(page.id); setDeleteDialogOpen(true); }} className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-error/30 text-error/60 hover:bg-error/10 transition-colors" aria-label="刪除"><Trash2 size={14} /></button>
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
          <DialogHeader><DialogTitle>{editingId ? "編輯頁面" : "新增頁面"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">標題</label>
              <input className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">Slug（網址路徑）</label>
              <input className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="例：about" />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">副標題</label>
              <input className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">內容（JSON 格式）</label>
              <textarea rows={8} className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors font-mono" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder='[{"type":"text","content":"..."}]' />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">Meta Description</label>
              <input className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-gray-300 text-base-content/70 hover:bg-gray-100 transition-colors">取消</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors">
              {saving ? <span className="loading loading-spinner loading-xs mr-2" /> : null}儲存
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>確認刪除</DialogTitle></DialogHeader>
          <p className="text-sm text-base-content/60 py-4">確定要刪除此頁面嗎？此操作無法復原。</p>
          <DialogFooter>
            <button onClick={() => setDeleteDialogOpen(false)} className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-gray-300 text-base-content/70 hover:bg-gray-100 transition-colors">取消</button>
            <button onClick={handleDelete} className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors">刪除</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
