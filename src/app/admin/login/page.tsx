"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminAuthAPI, setAdminToken, getAdminToken, removeAdminToken } from "@/lib/api";
import { useSiteInfo } from "@/contexts/SiteContext";
import { Lock, Mail, AlertCircle } from "lucide-react";

interface AdminInfo {
  name: string;
  email: string;
  role: string;
}

function getStoredAdmin(): AdminInfo | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('leo-shop-admin-user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function setStoredAdmin(admin: AdminInfo): void {
  localStorage.setItem('leo-shop-admin-user', JSON.stringify(admin));
}

export function clearAdminSession(): void {
  removeAdminToken();
  if (typeof window !== 'undefined') localStorage.removeItem('leo-shop-admin-user');
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { siteName } = useSiteInfo();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && getAdminToken() && getStoredAdmin()) {
      router.push("/admin");
    }
  }, [mounted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminAuthAPI.login({ email, password });
      setAdminToken(res.token);
      setStoredAdmin({ name: res.name, email: res.email, role: res.role });
      router.push("/admin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "登入失敗";
      setError(message);
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral px-4">
      <div className="card bg-base-100 shadow-2xl w-full max-w-sm">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-widest" style={{ color: "#c8956c" }}>
              {siteName}
            </h1>
            <p className="text-xs text-base-content/50 uppercase tracking-[0.3em] mt-1">
              Admin Panel
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error text-sm py-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text text-sm">Email</span></label>
              <label className="input input-bordered flex items-center gap-2">
                <Mail className="w-4 h-4 text-base-content/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@leoshop.com"
                  className="grow"
                  required
                  autoComplete="email"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text text-sm">密碼</span></label>
              <label className="input input-bordered flex items-center gap-2">
                <Lock className="w-4 h-4 text-base-content/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="grow"
                  required
                  autoComplete="current-password"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn w-full text-white border-0"
              style={{ backgroundColor: "#c8956c" }}
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : null}
              {loading ? "登入中..." : "登入"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
