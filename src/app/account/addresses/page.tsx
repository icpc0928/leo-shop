"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { useAuthStore } from "@/stores/authStore";
import { addressAPI } from "@/lib/api";
import { useTranslations } from "next-intl";
import { ArrowLeft, Plus, Trash2, Star } from "lucide-react";
import { Address } from "@/types";

const mockAddresses: Address[] = [
  { id: 1, name: "Leo Chen", phone: "0912-345-678", address: "台北市大安區忠孝東路四段100號", isDefault: true },
  { id: 2, name: "Leo Chen", phone: "0912-345-678", address: "新北市板橋區文化路一段50號", isDefault: false },
];

export default function AddressesPage() {
  const t = useTranslations("account");
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/account/login"); return; }
    fetchAddresses();
  }, [isLoggedIn, router]);

  const fetchAddresses = async () => {
    try {
      const data = await addressAPI.getAll();
      setAddresses(data);
    } catch {
      console.warn('API unavailable, using mock addresses');
      setAddresses(mockAddresses);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  const resetForm = () => { setForm({ name: "", phone: "", address: "" }); setEditing(null); setShowForm(false); };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await addressAPI.update(Number(editing.id), form);
        setAddresses(addresses.map((a) => String(a.id) === String(editing.id) ? updated : a));
      } else {
        const created = await addressAPI.create(form);
        setAddresses([...addresses, created]);
      }
    } catch {
      console.warn('API unavailable, using local state');
      if (editing) {
        setAddresses(addresses.map((a) => String(a.id) === String(editing.id) ? { ...a, ...form } : a));
      } else {
        setAddresses([...addresses, { id: Date.now(), ...form, isDefault: false }]);
      }
    } finally {
      setSaving(false);
      resetForm();
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await addressAPI.delete(Number(id));
    } catch {
      console.warn('API unavailable, using local state');
    }
    setAddresses(addresses.filter((a) => String(a.id) !== String(id)));
  };

  const setDefault = async (id: number | string) => {
    try {
      await addressAPI.setDefault(Number(id));
      await fetchAddresses();
    } catch {
      console.warn('API unavailable, using local state');
      setAddresses(addresses.map((a) => ({ ...a, isDefault: String(a.id) === String(id) })));
    }
  };

  const startEdit = (addr: Address) => {
    setForm({ name: addr.name, phone: addr.phone, address: addr.address });
    setEditing(addr);
    setShowForm(true);
  };

  return (
    <Container>
      <div className="max-w-2xl mx-auto py-16">
        <Link href="/account" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t("backToAccount")}
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-serif">{t("addresses")}</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1 text-sm border border-border px-4 py-2 hover:border-foreground transition-colors">
            <Plus className="w-4 h-4" /> {t("addAddress")}
          </button>
        </div>

        {showForm && (
          <div className="border border-border p-6 mb-6 space-y-4">
            <h2 className="font-medium">{editing ? t("editAddress") : t("addAddress")}</h2>
            <div>
              <label className="block text-sm mb-1">{t("name")}</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="block text-sm mb-1">{t("phone")}</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="block text-sm mb-1">{t("addressLabel")}</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-foreground" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="bg-foreground text-white px-6 py-2.5 text-sm tracking-wider hover:bg-foreground/90 transition-colors disabled:opacity-50">
                {saving ? "儲存中..." : t("save")}
              </button>
              <button onClick={resetForm}
                className="border border-border px-6 py-2.5 text-sm hover:border-foreground transition-colors">
                {t("cancel")}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="border border-border p-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{addr.name}</span>
                    <span className="text-muted text-sm">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-foreground text-white px-2 py-0.5">{t("defaultAddress")}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted">{addr.address}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!addr.isDefault && (
                    <button onClick={() => setDefault(addr.id)} className="p-1.5 text-muted hover:text-foreground" title={t("setDefault")}>
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => startEdit(addr)} className="text-xs text-muted hover:text-foreground underline">
                    {t("edit")}
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="p-1.5 text-muted hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
