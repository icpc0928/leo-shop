"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { adminPaymentMethodAPI, adminSettingsAPI } from "@/lib/api";
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
  const [baseCurrency, setBaseCurrency] = useState("TWD");

  useEffect(() => {
    fetchMethods();
    adminSettingsAPI.get().then((data: any) => {
      if (data?.baseCurrency) setBaseCurrency(data.baseCurrency);
    }).catch(() => {});
  }, []);

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
        <div className="flex gap-3">
          <button onClick={handleRefreshRates} disabled={refreshing}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium border border-base-300 bg-white text-base-content hover:bg-base-200 transition-colors cursor-pointer">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> 
            {refreshing ? "更新中..." : "刷新匯率"}
          </button>
          <button onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors cursor-pointer">
            <Plus size={15} /> 新增幣種
          </button>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-center">幣種名</th>
                  <th className="text-center">符號</th>
                  <th className="text-center">網路</th>
                  <th className="text-center">錢包地址</th>
                  <th className="text-center">匯率 ({baseCurrency})</th>
                  <th className="text-center">匯率來源</th>
                  <th className="text-center">狀態</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {methods.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-base-content/50 py-8">尚無幣種設定</td></tr>
                )}
                {methods.map((m) => (
                  <tr key={m.id}>
                    <td className="text-center font-medium">{m.name}</td>
                    <td className="text-center">{m.symbol}</td>
                    <td className="text-center text-base-content/60">{m.network}</td>
                    <td className="text-center font-mono text-xs">{truncate(m.walletAddress, 16)}</td>
                    <td className="text-center tabular-nums">{m.exchangeRate}</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                        m.rateSource === 'api' 
                          ? 'border-blue-200 bg-blue-50 text-blue-600' 
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      }`}>
                        {m.rateSource === 'api' ? 'API' : '手動'}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleToggle(m.id)}
                        className={`inline-flex items-center min-w-[60px] justify-center px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                          m.enabled 
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {m.enabled ? '啟用' : '停用'}
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(m)} className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-gray-300 text-base-content/60 hover:bg-gray-300 transition-colors cursor-pointer" aria-label="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { setDeletingId(m.id); setDeleteDialogOpen(true); }}
                          className="w-7 h-7 rounded-full inline-flex items-center justify-center border border-error/30 text-error/60 hover:bg-error/10 transition-colors cursor-pointer" aria-label="Delete">
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
                <select className="select select-bordered w-full" value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })}>
                  <option value="">請選擇網路</option>
                  <option value="bitcoin">Bitcoin</option>
                  <option value="ethereum">Ethereum</option>
                  <option value="tron">Tron (TRC-20)</option>
                  <option value="polygon">Polygon</option>
                </select>
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
                <label className="label"><span className="label-text">匯率（1幣 = ? {baseCurrency}）</span></label>
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
