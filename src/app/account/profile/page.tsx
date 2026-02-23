"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import { useAuthStore } from "@/stores/authStore";
import { userAPI } from "@/lib/api";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("account");
  const router = useRouter();
  const { user, isLoggedIn, updateProfile } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) { router.push("/account/login"); return; }
    if (user) { setName(user.name); setEmail(user.email); setPhone(user.phone || ""); }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({ name, phone });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return;
    if (newPassword !== confirmNewPassword) {
      setPasswordError("新密碼不一致");
      return;
    }
    setPasswordError("");
    setPasswordMsg("");
    try {
      await userAPI.changePassword({ oldPassword, newPassword });
      setPasswordMsg("密碼已更新");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (e: unknown) {
      setPasswordError(e instanceof Error ? e.message : "密碼更新失敗");
    }
  };

  return (
    <Container>
      <div className="max-w-lg mx-auto py-16">
        <Link href="/account" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t("backToAccount")}
        </Link>
        <h1 className="text-2xl font-serif mb-8">{t("profile")}</h1>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm mb-1">{t("name")}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t("email")}</label>
            <input type="email" value={email} disabled
              className="w-full border border-border px-4 py-2.5 text-sm bg-gray-50 text-muted" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t("phone")}</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-foreground" />
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-foreground text-white py-3 text-sm tracking-wider hover:bg-foreground/90 transition-colors disabled:opacity-50">
            {saving ? t("saving") : saved ? t("saved") : t("save")}
          </button>
        </form>

        <hr className="my-8" />
        <h2 className="text-lg font-serif mb-4">{t("changePassword")}</h2>
        {passwordMsg && <div className="alert alert-success text-sm mb-4">{passwordMsg}</div>}
        {passwordError && <div className="alert alert-error text-sm mb-4">{passwordError}</div>}
        <div className="space-y-5">
          <div>
            <label className="block text-sm mb-1">{t("oldPassword")}</label>
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t("newPassword")}</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-foreground" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t("confirmNewPassword")}</label>
            <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-foreground" />
          </div>
          <button type="button" onClick={handleChangePassword}
            className="w-full border border-border py-3 text-sm tracking-wider hover:border-foreground transition-colors">
            {t("changePassword")}
          </button>
        </div>
      </div>
    </Container>
  );
}
