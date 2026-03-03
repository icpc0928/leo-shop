"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { ShieldX } from "lucide-react";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push("/admin/login");
    }
  }, [mounted, isLoggedIn, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (user?.role !== "admin" && user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl max-w-sm w-full">
          <div className="card-body items-center text-center">
            <ShieldX className="w-16 h-16 text-error mb-4" />
            <h2 className="card-title text-error">無管理員權限</h2>
            <p className="text-base-content/60 text-sm">您的帳號沒有管理員權限，無法存取此頁面。</p>
            <div className="card-actions mt-4">
              <button className="btn btn-outline btn-sm" onClick={() => router.push("/admin/login")}>
                返回登入
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
