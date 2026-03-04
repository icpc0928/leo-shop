"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";

type SystemSettings = {
  baseCurrency: string;
  shippingFee: number;
  freeShippingThreshold: number;
  availableCurrencies: string[];
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    baseCurrency: "",
    shippingFee: "",
    freeShippingThreshold: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("leo-shop-admin-token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      setSettings(data);
      setForm({
        baseCurrency: data.baseCurrency,
        shippingFee: String(data.shippingFee),
        freeShippingThreshold: String(data.freeShippingThreshold),
      });
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("leo-shop-admin-token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          baseCurrency: form.baseCurrency,
          shippingFee: Number(form.shippingFee),
          freeShippingThreshold: Number(form.freeShippingThreshold),
        }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      const data = await res.json();
      setSettings(data);
      setForm({
        baseCurrency: data.baseCurrency,
        shippingFee: String(data.shippingFee),
        freeShippingThreshold: String(data.freeShippingThreshold),
      });
      alert("設定已儲存");
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="alert alert-error">
        <span>無法載入系統設定</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">系統設定</h1>
          <p className="text-sm text-base-content/60 mt-1">管理主幣別、運費等全域設定</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary gap-2"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          儲存設定
        </button>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6">
        {/* Base Currency */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-lg">主幣別設定</h2>
            <p className="text-sm text-base-content/60 mb-4">
              選擇系統的基準貨幣。切換主幣別時，所有匯率將自動重新計算。
            </p>
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">主幣別</span>
              </label>
              <select
                className="select select-bordered"
                value={form.baseCurrency}
                onChange={(e) => setForm({ ...form, baseCurrency: e.target.value })}
              >
                {settings.availableCurrencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt text-warning">
                  ⚠️ 切換主幣別會重新計算所有匯率
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-lg">運費設定</h2>
            <p className="text-sm text-base-content/60 mb-4">
              設定免運門檻和運費金額（以主幣別計價）
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">免運門檻</span>
                  <span className="label-text-alt">{settings.baseCurrency}</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={form.freeShippingThreshold}
                  onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value })}
                  min="0"
                  step="1"
                />
                <label className="label">
                  <span className="label-text-alt">
                    訂單金額達此門檻即免運費
                  </span>
                </label>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">運費金額</span>
                  <span className="label-text-alt">{settings.baseCurrency}</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={form.shippingFee}
                  onChange={(e) => setForm({ ...form, shippingFee: e.target.value })}
                  min="0"
                  step="1"
                />
                <label className="label">
                  <span className="label-text-alt">
                    未達免運門檻時的運費
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Current Settings Display */}
        <div className="card bg-neutral text-neutral-content border border-neutral">
          <div className="card-body">
            <h3 className="font-semibold mb-2">目前設定</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="opacity-60">主幣別</div>
                <div className="font-mono font-semibold">{settings.baseCurrency}</div>
              </div>
              <div>
                <div className="opacity-60">免運門檻</div>
                <div className="font-mono font-semibold">
                  {settings.freeShippingThreshold} {settings.baseCurrency}
                </div>
              </div>
              <div>
                <div className="opacity-60">運費</div>
                <div className="font-mono font-semibold">
                  {settings.shippingFee} {settings.baseCurrency}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
