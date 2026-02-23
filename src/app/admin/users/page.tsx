"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Eye } from "lucide-react";
import { mockUsers, mockOrders, type AdminUser } from "@/lib/adminMockData";
import { formatCurrency, formatDate } from "@/lib/format";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (userId: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)));
  };

  const userOrders = detailUser ? mockOrders.filter((o) => o.customerEmail === detailUser.email) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">會員管理</h1>

      {/* Search */}
      <div className="form-control">
        <div className="input-group flex">
          <span className="bg-base-200 flex items-center px-3"><Search className="w-4 h-4 text-base-content/40" /></span>
          <input type="text" placeholder="搜尋姓名或 Email…" value={search} name="search" autoComplete="off" aria-label="搜尋會員"
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
                  <th>名稱</th><th>Email</th><th>電話</th><th>角色</th>
                  <th>註冊日期</th><th>狀態</th><th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td className="font-medium">{user.name}</td>
                    <td className="text-base-content/50">{user.email}</td>
                    <td className="text-base-content/50">{user.phone}</td>
                    <td>
                      <span className={`badge badge-sm ${user.role === "admin" ? "badge-secondary" : "badge-ghost"}`}>
                        {user.role === "admin" ? "管理員" : "會員"}
                      </span>
                    </td>
                    <td className="text-base-content/50">{formatDate(user.registeredAt)}</td>
                    <td>
                      <span className={`badge badge-sm ${user.isActive ? "badge-success" : "badge-error"}`}>
                        {user.isActive ? "啟用" : "停用"}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailUser(user)} className="btn btn-ghost btn-xs btn-square" aria-label="View user details">
                          <Eye size={14} aria-hidden="true" />
                        </button>
                        <button onClick={() => toggleActive(user.id)}
                          className={`btn btn-xs ${user.isActive ? "btn-error btn-outline" : "btn-success btn-outline"}`}>
                          {user.isActive ? "停用" : "啟用"}
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

      {/* Detail Dialog (shadcn) */}
      <Dialog open={!!detailUser} onOpenChange={(open) => !open && setDetailUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>會員詳情</DialogTitle></DialogHeader>
          {detailUser && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-base-content/40">姓名</span><p className="font-medium">{detailUser.name}</p></div>
                <div><span className="text-base-content/40">角色</span><p className="font-medium">{detailUser.role === "admin" ? "管理員" : "會員"}</p></div>
                <div><span className="text-base-content/40">Email</span><p className="font-medium">{detailUser.email}</p></div>
                <div><span className="text-base-content/40">電話</span><p className="font-medium">{detailUser.phone}</p></div>
                <div><span className="text-base-content/40">註冊日期</span><p className="font-medium">{formatDate(detailUser.registeredAt)}</p></div>
                <div><span className="text-base-content/40">狀態</span><p className="font-medium">{detailUser.isActive ? "啟用中" : "已停用"}</p></div>
              </div>
              <div className="divider my-0" />
              <div>
                <h4 className="text-sm font-semibold mb-2">消費摘要</h4>
                <div className="text-sm text-base-content/60 space-y-1">
                  <p>累計訂單：{detailUser.totalOrders} 筆</p>
                  <p>累計消費：{formatCurrency(detailUser.totalSpent)}</p>
                </div>
              </div>
              {userOrders.length > 0 && (
                <>
                  <div className="divider my-0" />
                  <div>
                    <h4 className="text-sm font-semibold mb-2">訂單記錄</h4>
                    <div className="space-y-2">
                      {userOrders.map((o) => (
                        <div key={o.id} className="flex items-center justify-between text-sm p-2 bg-base-200 rounded">
                          <span className="font-mono">{o.orderNumber}</span>
                          <span className="tabular-nums">{formatCurrency(o.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
