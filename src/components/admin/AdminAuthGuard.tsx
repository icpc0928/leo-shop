"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/api";
import { clearAdminSession } from "@/app/admin/login/page";
import { ShieldX } from "lucide-react";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasToken(!!getAdminToken());
  }, []);

  useEffect(() => {
    if (mounted && !hasToken) {
      router.push("/admin/login");
    }
  }, [mounted, hasToken, router]);

  if (!mounted || !hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return <>{children}</>;
}

export function useAdminLogout() {
  const router = useRouter();
  return () => {
    clearAdminSession();
    router.push("/admin/login");
  };
}
