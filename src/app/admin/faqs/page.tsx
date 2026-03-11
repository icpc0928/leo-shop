"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { faqAPI } from "@/lib/api";

type FAQ = {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  enabled: boolean;
};

type FAQForm = {
  question: string;
  answer: string;
  sortOrder: string;
};

const emptyForm: FAQForm = {
  question: "",
  answer: "",
  sortOrder: "0",
};

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<FAQForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const data = await faqAPI.getAll();
      setFaqs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      sortOrder: String(faq.sortOrder),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      question: form.question,
      answer: form.answer,
      sortOrder: Number(form.sortOrder),
    };

    try {
      if (editingId) {
        await faqAPI.update(editingId, data);
      } else {
        await faqAPI.create(data);
      }
      await fetchFAQs();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await faqAPI.toggle(id);
      await fetchFAQs();
    } catch (error) {
      console.error('Failed to toggle FAQ:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await faqAPI.delete(deletingId);
      await fetchFAQs();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      alert('刪除失敗');
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
        <h1 className="text-2xl font-bold">FAQ 管理</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors"
        >
          <Plus size={16} /> 新增 FAQ
        </button>
      </div>

      {/* Table */}
      <div className="card bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="card-body p-0">
          {faqs.length === 0 ? (
            <div className="text-center py-12 text-base-content/40">尚無 FAQ 資料</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-center">問題</th>
                    <th className="text-center">答案</th>
                    <th className="text-center w-20">排序</th>
                    <th className="text-center w-24">狀態</th>
                    <th className="text-center w-32">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.map((faq) => (
                    <tr key={faq.id}>
                      <td className="text-center font-medium">{faq.question}</td>
                      <td className="text-center text-base-content/50">
                        {truncateText(faq.answer, 60)}
                      </td>
                      <td className="text-center">{faq.sortOrder}</td>
                      <td className="text-center">
                        <button
                          onClick={() => handleToggle(faq.id)}
                          className={`text-sm font-medium ${
                            faq.enabled ? "text-emerald-600" : "text-gray-400"
                          }`}
                        >
                          {faq.enabled ? "啟用" : "停用"}
                        </button>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(faq)}
                            className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-gray-300 text-base-content/60 hover:bg-gray-100 transition-colors"
                            aria-label="編輯"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingId(faq.id);
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
            <DialogTitle>{editingId ? "編輯 FAQ" : "新增 FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">問題</label>
              <input
                className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">答案</label>
              <textarea
                className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors min-h-[120px]"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
              />
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
          <p className="text-sm text-base-content/60 py-4">確定要刪除此 FAQ 嗎？此操作無法復原。</p>
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
