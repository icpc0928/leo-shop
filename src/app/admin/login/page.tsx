"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Lock, Mail, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, isLoggedIn, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && isLoggedIn && (user?.role === "admin" || user?.role === "ADMIN")) {
      router.push("/admin");
    }
  }, [mounted, isLoggedIn, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || "登入失敗");
        setLoading(false);
        return;
      }

      // Check role after login
      const state = useAuthStore.getState();
      if (state.user?.role !== "admin" && state.user?.role !== "ADMIN") {
        setError("無管理員權限，此帳號不是管理員。");
        useAuthStore.getState().logout();
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("登入失敗，請稍後再試");
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
              LEO SHOP
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
