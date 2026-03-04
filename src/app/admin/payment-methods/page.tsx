"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { adminPaymentMethodAPI } from "@/lib/api";
import type { PaymentMethod } from "@/types";

type PMForm = {
  name: string; symbol: string; network: string; contractAddress: string;
  walletAddress: string; exchangeRate: string; rateSource: string;
  gateway: string; explorerUrl: string; iconUrl: string;
};

const emptyForm: PMForm = {
  name: "", symbol: "", network: "", contractAddress: "",
  walletAddress: "", exchangeRate: "", rateSource: "manual",
  gateway: "direct", explorerUrl: "", iconUrl: "",
};

function toForm(p: PaymentMethod): PMForm {
  return {
    name: p.name, symbol: p.symbol, network: p.network,
    contractAddress: p.contractAddress || "", walletAddress: p.walletAddress,
    exchangeRate: String(p.exchangeRate), rateSource: p.rateSource,
    gateway: p.gateway, explorerUrl: p.explorerUrl || "", iconUrl: p.iconUrl || "",
  };
}

function truncate(s: string | null | undefined, len: number) {
  if (!s) return "";
  return s.length > len ? s.slice(0, len) + "…" : s;
}

export default function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<PMForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchMethods(); }, []);

  const fetchMethods = async () => {
    try {
      const data = await adminPaymentMethodAPI.getAll();
      setMethods(Array.isArray(data) ? data : data.content || []);
    } catch {
      console.warn("Failed to fetch payment methods");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: PaymentMethod) => { setEditingId(p.id); setForm(toForm(p)); setDialogOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      ...form,
      exchangeRate: Number(form.exchangeRate),
      contractAddress: form.contractAddress || null,
      explorerUrl: form.explorerUrl || null,
      iconUrl: form.iconUrl || null,
    };
    try {
      if (editingId) {
        await adminPaymentMethodAPI.update(editingId, data);
      } else {
        await adminPaymentMethodAPI.create(data);
      }
      await fetchMethods();
    } catch {
      console.warn("Save failed");
    } finally {
      setSaving(false);
      setDialogOpen(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await adminPaymentMethodAPI.toggle(id);
      await fetchMethods();
    } catch {
      console.warn("Toggle failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminPaymentMethodAPI.delete(deletingId);
      await fetchMethods();
    } catch {
      console.warn("Delete failed");
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const handleRefreshRates = async () => {
    setRefreshing(true);
    try {
      await adminPaymentMethodAPI.refreshRates();
      await fetchMethods(); // Re-fetch to show updated rates
    } catch {
      console.warn("Refresh rates failed");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">支付管理</h1>
        <div className="flex gap-2">
          <button onClick={handleRefreshRates} disabled={refreshing} className="btn btn-outline btn-sm gap-2">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> 
            {refreshing ? "更新中..." : "刷新匯率"}
          </button>
          <button onClick={openAdd} className="btn btn-primary btn-sm gap-2">
            <Plus size={16} /> 新增幣種
          </button>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>幣種名</th>
                  <th>符號</th>
                  <th>網路</th>
                  <th>錢包地址</th>
                  <th className="text-right">匯率 (TWD)</th>
                  <th>匯率來源</th>
                  <th>狀態</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {methods.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-base-content/50 py-8">尚無幣種設定</td></tr>
                )}
                {methods.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium">{m.name}</td>
                    <td>{m.symbol}</td>
                    <td className="text-base-content/60">{m.network}</td>
                    <td className="font-mono text-xs">{truncate(m.walletAddress, 16)}</td>
                    <td className="text-right tabular-nums">{m.exchangeRate}</td>
                    <td>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        m.rateSource === 'api' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {m.rateSource === 'api' ? 'API' : '手動'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(m.id)}
                        className={`btn btn-xs ${m.enabled ? 'btn-success' : 'btn-ghost border-base-300'}`}
                      >
                        {m.enabled ? '啟用' : '停用'}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(m)} className="btn btn-ghost btn-xs btn-square" aria-label="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { setDeletingId(m.id); setDeleteDialogOpen(true); }}
                          className="btn btn-ghost btn-xs btn-square text-error" aria-label="Delete">
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "編輯幣種" : "新增幣種"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">名稱</span></label>
                <input className="input input-bordered w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="AAA Token" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">符號</span></label>
                <input className="input input-bordered w-full" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="AAA" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">網路</span></label>
                <input className="input input-bordered w-full" value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })} placeholder="polygon" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Gateway</span></label>
                <select className="select select-bordered w-full" value={form.gateway} onChange={(e) => setForm({ ...form, gateway: e.target.value })}>
                  <option value="direct">direct</option>
                  <option value="nowpayments">nowpayments</option>
                </select>
              </div>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">合約地址（原生幣可留空）</span></label>
              <input className="input input-bordered w-full font-mono text-sm" value={form.contractAddress} onChange={(e) => setForm({ ...form, contractAddress: e.target.value })} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">收款錢包地址</span></label>
              <input className="input input-bordered w-full font-mono text-sm" value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">匯率（1幣 = ? TWD）</span></label>
                <input type="number" step="any" className="input input-bordered w-full" value={form.exchangeRate} onChange={(e) => setForm({ ...form, exchangeRate: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">匯率來源</span></label>
                <select className="select select-bordered w-full" value={form.rateSource} onChange={(e) => setForm({ ...form, rateSource: e.target.value })}>
                  <option value="manual">手動</option>
                  <option value="api">API</option>
                </select>
              </div>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">區塊鏈瀏覽器 URL 模板</span></label>
              <input className="input input-bordered w-full text-sm" value={form.explorerUrl} onChange={(e) => setForm({ ...form, explorerUrl: e.target.value })} placeholder="https://polygonscan.com/tx/{hash}" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Icon URL</span></label>
              <input className="input input-bordered w-full text-sm" value={form.iconUrl} onChange={(e) => setForm({ ...form, iconUrl: e.target.value })} />
            </div>
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
          <p className="text-sm text-base-content/60 py-4">確定要刪除此幣種嗎？此操作無法復原。</p>
          <DialogFooter>
            <button onClick={() => setDeleteDialogOpen(false)} className="btn btn-ghost btn-sm">取消</button>
            <button onClick={handleDelete} className="btn btn-error btn-sm">刪除</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
