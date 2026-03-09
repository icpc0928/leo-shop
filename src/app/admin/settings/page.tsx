"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";

type SystemSettings = {
  siteName: string;
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
    siteName: "",
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
        siteName: data.siteName || "",
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
          siteName: form.siteName,
          baseCurrency: form.baseCurrency,
          shippingFee: Number(form.shippingFee),
          freeShippingThreshold: Number(form.freeShippingThreshold),
        }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      const data = await res.json();
      setSettings(data);
      setForm({
        siteName: data.siteName || "",
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
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-[#0071e3] text-white hover:bg-[#0077ED] transition-colors cursor-pointer"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          儲存設定
        </button>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6">
        {/* Site Name */}
        <div className="bg-base-100 border border-base-200 rounded-2xl">
          <div className="card-body">
            <h2 className="card-title text-lg">網站名稱</h2>
            <p className="text-sm text-base-content/60 mb-4">
              設定前台和後台顯示的網站名稱，每個運營商可自訂。
            </p>
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">網站名稱</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                placeholder="Leo Shop"
              />
            </div>
          </div>
        </div>

        {/* Base Currency */}
        <div className="bg-base-100 border border-base-200 rounded-2xl">
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
                className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
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
        <div className="bg-base-100 border border-base-200 rounded-2xl">
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
                  className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
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
                  className="w-full px-3 py-2 border border-base-200 rounded-xl bg-base-100 text-sm outline-none focus:border-gray-400 transition-colors"
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
        <div className="bg-neutral text-neutral-content border border-neutral rounded-2xl">
          <div className="card-body">
            <h3 className="font-semibold mb-2">目前設定</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="opacity-60">網站名稱</div>
                <div className="font-semibold">{settings.siteName}</div>
              </div>
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
