"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { teamAPI } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import { resolveImageUrl } from "@/lib/mappers";

type TeamMember = {
  id: number;
  name: string;
  role?: string;
  imageUrl?: string;
  sortOrder: number;
  enabled: boolean;
};

type MemberForm = {
  name: string;
  role: string;
  imageUrl: string;
  sortOrder: string;
};

const emptyForm: MemberForm = {
  name: "",
  role: "",
  imageUrl: "",
  sortOrder: "0",
};

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const data = await teamAPI.getAll();
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      role: member.role || "",
      imageUrl: member.imageUrl || "",
      sortOrder: String(member.sortOrder),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { name: form.name, role: form.role, imageUrl: form.imageUrl, sortOrder: Number(form.sortOrder) };
    try {
      if (editingId) { await teamAPI.update(editingId, data); } else { await teamAPI.create(data); }
      await fetchMembers();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save member:', error);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try { await teamAPI.toggle(id); await fetchMembers(); } catch (error) { console.error(error); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await teamAPI.delete(deletingId);
      await fetchMembers();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('刪除失敗');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">團隊管理</h1>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors">
          <Plus size={16} /> 新增成員
        </button>
      </div>

      <div className="card bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="card-body p-0">
          {members.length === 0 ? (
            <div className="text-center py-12 text-base-content/40">尚無團隊成員</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-center w-16">頭像</th>
                    <th className="text-center">名字</th>
                    <th className="text-center">職稱</th>
                    <th className="text-center w-20">排序</th>
                    <th className="text-center w-24">狀態</th>
                    <th className="text-center w-32">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="text-center">
                        {member.imageUrl ? (
                          <Image src={resolveImageUrl(member.imageUrl)} alt={member.name} width={40} height={40} className="rounded-full object-cover mx-auto" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto flex items-center justify-center text-sm text-gray-500">{member.name[0]}</div>
                        )}
                      </td>
                      <td className="text-center font-medium">{member.name}</td>
                      <td className="text-center text-base-content/50">{member.role || "-"}</td>
                      <td className="text-center">{member.sortOrder}</td>
                      <td className="text-center">
                        <button onClick={() => handleToggle(member.id)} className={`text-sm font-medium ${member.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                          {member.enabled ? "啟用" : "停用"}
                        </button>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(member)} className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-gray-300 text-base-content/60 hover:bg-gray-100 transition-colors" aria-label="編輯"><Pencil size={14} /></button>
                          <button onClick={() => { setDeletingId(member.id); setDeleteDialogOpen(true); }} className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-error/30 text-error/60 hover:bg-error/10 transition-colors" aria-label="刪除"><Trash2 size={14} /></button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "編輯成員" : "新增成員"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">名字</label>
              <input className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">職稱</label>
              <input className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">頭像</label>
              <ImageUploader
                existingImages={form.imageUrl ? [form.imageUrl] : []}
                onChange={(urls) => setForm({ ...form, imageUrl: urls[0] || "" })}
                maxImages={1}
              />
            </div>
            <div>
              <label className="text-xs text-base-content/60 mb-1 block">排序</label>
              <input type="number" className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
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
          <p className="text-sm text-base-content/60 py-4">確定要刪除此成員嗎？此操作無法復原。</p>
          <DialogFooter>
            <button onClick={() => setDeleteDialogOpen(false)} className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-gray-300 text-base-content/70 hover:bg-gray-100 transition-colors">取消</button>
            <button onClick={handleDelete} className="inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors">刪除</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
