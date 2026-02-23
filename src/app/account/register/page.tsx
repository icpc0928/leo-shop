"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { useAuthStore } from "@/stores/authStore";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("account");
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  if (isLoggedIn) {
    router.push("/account");
    return null;
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name) errs.name = t("required");
    if (!email) errs.email = t("required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t("invalidEmail");
    if (!password) errs.password = t("required");
    if (password !== confirmPassword) errs.confirmPassword = t("passwordMismatch");
    if (!agreeTerms) errs.terms = t("mustAgreeTerms");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    const result = await register(name, email, password);
    setLoading(false);
    if (result.success) {
      router.push("/account");
    } else {
      setApiError(result.error || "Registration failed");
    }
  };

  return (
    <Container>
      <div className="max-w-md mx-auto py-16">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h1 className="text-2xl font-serif text-center mb-6">{t("register")}</h1>
            {apiError && (
              <div className="alert alert-error text-sm mb-4">{apiError}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text">{t("name")}</span></label>
                <input type="text" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
                  className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`} />
                {errors.name && <label className="label"><span className="label-text-alt text-error">{errors.name}</span></label>}
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">{t("email")}</span></label>
                <input type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`} />
                {errors.email && <label className="label"><span className="label-text-alt text-error">{errors.email}</span></label>}
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">{t("password")}</span></label>
                <input type="password" name="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`} />
                {errors.password && <label className="label"><span className="label-text-alt text-error">{errors.password}</span></label>}
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">{t("confirmPassword")}</span></label>
                <input type="password" name="confirmPassword" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input input-bordered w-full ${errors.confirmPassword ? "input-error" : ""}`} />
                {errors.confirmPassword && <label className="label"><span className="label-text-alt text-error">{errors.confirmPassword}</span></label>}
              </div>
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-2">
                  <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="checkbox checkbox-sm checkbox-primary" />
                  <span className="label-text">{t("agreeTerms")}</span>
                </label>
                {errors.terms && <label className="label"><span className="label-text-alt text-error">{errors.terms}</span></label>}
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? <span className="loading loading-spinner loading-sm" /> : null}
                {loading ? t("registering") : t("register")}
              </button>
            </form>
            <p className="text-center text-sm text-base-content/60 mt-4">
              {t("hasAccount")}{" "}
              <Link href="/account/login" className="link link-primary">{t("loginNow")}</Link>
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
