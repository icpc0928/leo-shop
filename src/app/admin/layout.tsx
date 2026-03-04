"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { clearAdminSession } from "@/app/admin/login/page";
import { LayoutDashboard, Package, ClipboardList, Users, LogOut, Store, Menu, Wallet, Bitcoin, Shield, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "管理員", href: "/admin/admin-users", icon: Shield },
  { label: "支付管理", href: "/admin/payment-methods", icon: Wallet },
  { label: "加密訂單", href: "/admin/crypto-orders", icon: Bitcoin },
  { label: "系統設定", href: "/admin/settings", icon: Settings },
];

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col h-full bg-neutral text-neutral-content">
      <div className="p-6 border-b border-neutral-content/20">
        <h1 className="text-xl font-bold tracking-wider">LEO SHOP</h1>
        <span className="text-xs opacity-60 uppercase tracking-widest">Admin Panel</span>
      </div>
      <ul className="menu flex-1 p-4 gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link href={item.href} className={isActive ? "active" : ""}>
                <Icon size={18} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-4 border-t border-neutral-content/20">
        <ul className="menu p-0">
          <li>
            <Link href="/">
              <Store size={18} />
              回到前台
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [adminName, setAdminName] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('leo-shop-admin-user');
      if (raw) setAdminName(JSON.parse(raw).name || 'Admin');
    } catch { /* ignore */ }
  }, []);

  // Login page: render without sidebar or auth guard
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-base-200 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[250px] flex-shrink-0 fixed inset-y-0 left-0 z-30">
          <Sidebar pathname={pathname} />
        </aside>

        <div className="flex-1 lg:ml-[250px]">
          {/* Top Bar */}
          <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-20 px-6">
            <div className="flex-1 flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="btn btn-ghost btn-sm btn-square lg:hidden" aria-label="Open menu">
                    <Menu size={20} aria-hidden="true" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[250px] bg-neutral">
                  <Sidebar pathname={pathname} />
                </SheetContent>
              </Sheet>
              <h2 className="text-lg font-semibold">
                {navItems.find((item) =>
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
                )?.label ?? "Admin"}
              </h2>
            </div>
            <div className="flex-none flex items-center gap-4">
              <span className="text-sm text-base-content/60">{adminName}</span>
              <button
                onClick={() => { clearAdminSession(); router.push("/admin/login"); }}
                className="btn btn-ghost btn-sm gap-2"
              >
                <LogOut size={16} aria-hidden="true" />
                登出
              </button>
            </div>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
