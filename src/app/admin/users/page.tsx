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
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
        <input type="text" placeholder="搜尋姓名或 Email…" value={search} name="search" autoComplete="off" aria-label="搜尋會員"
          onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-base-200 rounded-2xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors" />
      </div>

      {/* Table */}
      <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-center">名稱</th><th className="text-center">Email</th><th className="text-center">電話</th><th className="text-center">角色</th>
                  <th className="text-center">註冊日期</th><th className="text-center">狀態</th><th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td className="text-center font-medium">{user.name}</td>
                    <td className="text-center text-base-content/50">{user.email}</td>
                    <td className="text-center text-base-content/50">{user.phone}</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium border ${
                        user.role === "admin" ? "border-violet-200 bg-violet-50 text-violet-600" : "border-gray-200 bg-gray-50 text-gray-500"
                      }`}>
                        {user.role === "admin" ? "管理員" : "會員"}
                      </span>
                    </td>
                    <td className="text-center text-base-content/50">{formatDate(user.registeredAt)}</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center justify-center min-w-[60px] px-3 py-1 rounded-full text-xs font-medium border ${
                        user.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-red-200 bg-red-50 text-red-500"
                      }`}>
                        {user.isActive ? "啟用" : "停用"}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setDetailUser(user)} className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-gray-300 text-base-content/60 hover:bg-gray-300 transition-colors cursor-pointer" aria-label="View user details">
                          <Eye size={14} aria-hidden="true" />
                        </button>
                        <button onClick={() => toggleActive(user.id)}
                          className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                            user.isActive 
                              ? "border-red-200 text-red-500 hover:bg-red-50" 
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          }`}>
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
