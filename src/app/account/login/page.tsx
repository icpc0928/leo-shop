"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { useAuthStore } from "@/stores/authStore";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("account");
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  if (isLoggedIn) {
    router.push("/account");
    return null;
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = t("required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t("invalidEmail");
    if (!password) errs.password = t("required");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push("/account");
    } else {
      setApiError(result.error || "Login failed");
    }
  };

  return (
    <Container>
      <div className="max-w-md mx-auto py-16">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h1 className="text-2xl font-serif text-center mb-6">{t("login")}</h1>
            {apiError && (
              <div className="alert alert-error text-sm mb-4">{apiError}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("email")}</span>
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                />
                {errors.email && <label className="label"><span className="label-text-alt text-error">{errors.email}</span></label>}
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{t("password")}</span>
                </label>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
                />
                {errors.password && <label className="label"><span className="label-text-alt text-error">{errors.password}</span></label>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="checkbox checkbox-sm checkbox-primary"
                  />
                  <span className="label-text">{t("rememberMe")}</span>
                </label>
                <Link href="#" className="link link-hover text-base-content/60">
                  {t("forgotPassword")}
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : null}
                {loading ? t("loggingIn") : t("login")}
              </button>
            </form>
            <p className="text-center text-sm text-base-content/60 mt-4">
              {t("noAccount")}{" "}
              <Link href="/account/register" className="link link-primary">
                {t("registerNow")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
