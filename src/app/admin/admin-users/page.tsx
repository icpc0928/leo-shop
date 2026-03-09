"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminUserAPI } from "@/lib/api";

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

type AdminUserForm = {
  email: string;
  password: string;
  name: string;
  role: string;
};

const emptyForm: AdminUserForm = {
  email: "",
  password: "",
  name: "",
  role: "ADMIN",
};

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<AdminUserForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await adminUserAPI.getAll();
      setAdmins(Array.isArray(data) ? data : []);
    } catch {
      console.warn("Failed to fetch admin users");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (admin: AdminUser) => {
    setEditingId(admin.id);
    setForm({
      email: admin.email,
      password: "",
      name: admin.name,
      role: admin.role,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.email || !form.name) return;
    if (!editingId && !form.password) return; // Password required for new admin

    setSaving(true);
    try {
      const data: any = {
        email: form.email,
        name: form.name,
        role: form.role,
      };

      // Include password only if provided
      if (form.password) {
        data.password = form.password;
      }

      if (editingId) {
        await adminUserAPI.update(editingId, data);
      } else {
        await adminUserAPI.create(data);
      }

      await fetchAdmins();
      setDialogOpen(false);
    } catch (err: any) {
      alert(err.message || "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await adminUserAPI.delete(deletingId);
      await fetchAdmins();
    } catch (err: any) {
      alert(err.message || "刪除失敗");
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
        <h1 className="text-2xl font-bold">管理員管理</h1>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors cursor-pointer">
          <Plus size={15} /> 新增管理員
        </button>
      </div>

      <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-base-content/60 text-xs uppercase tracking-wider">
                  <th className="text-center">ID</th>
                  <th className="text-center">姓名</th>
                  <th className="text-center">Email</th>
                  <th className="text-center">角色</th>
                  <th className="text-center">建立時間</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-base-content/40 py-16">
                      尚無管理員
                    </td>
                  </tr>
                )}
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-base-200/50 transition-colors">
                    <td className="text-center font-mono text-sm">#{admin.id}</td>
                    <td className="text-center font-medium">{admin.name}</td>
                    <td className="text-center text-base-content/70">{admin.email}</td>
                    <td className="text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium border border-blue-200 bg-blue-50 text-blue-600">
                        {admin.role}
                      </span>
                    </td>
                    <td className="text-center text-xs text-base-content/50">
                      {new Date(admin.createdAt).toLocaleString("zh-TW")}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEdit(admin)}
                          className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-gray-300 text-base-content/60 hover:bg-gray-300 transition-colors cursor-pointer"
                          title="編輯"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingId(admin.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-error/30 text-error/60 hover:bg-error/10 transition-colors cursor-pointer"
                          title="刪除"
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
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "編輯管理員" : "新增管理員"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">姓名 *</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email *</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  密碼 {editingId ? "(留空則不修改)" : "*"}
                </span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">角色</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="btn btn-ghost btn-sm"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary btn-sm"
            >
              {saving ? (
                <span className="loading loading-spinner loading-xs" />
              ) : null}
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
          <p className="text-sm text-base-content/60 py-4">
            確定要刪除此管理員嗎？此操作無法復原。
          </p>
          <DialogFooter>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="btn btn-ghost btn-sm"
            >
              取消
            </button>
            <button onClick={handleDelete} className="btn btn-error btn-sm">
              刪除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
