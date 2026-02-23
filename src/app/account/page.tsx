"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { useAuthStore } from "@/stores/authStore";
import { useTranslations } from "next-intl";
import { Package, UserIcon, MapPin, LogOut } from "lucide-react";

export default function AccountPage() {
  const t = useTranslations("account");
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) router.push("/account/login");
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !user) return null;

  const cards = [
    { href: "/account/orders", icon: Package, label: t("myOrders"), desc: t("myOrdersDesc") },
    { href: "/account/profile", icon: UserIcon, label: t("profile"), desc: t("profileDesc") },
    { href: "/account/addresses", icon: MapPin, label: t("addresses"), desc: t("addressesDesc") },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <Container>
      <div className="py-16 max-w-3xl mx-auto">
        <h1 className="text-2xl font-serif mb-2">{t("welcome", { name: user.name })}</h1>
        <p className="text-muted text-sm mb-10">{t("accountDesc")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="border border-border p-6 hover:border-foreground transition-colors group"
            >
              <card.icon className="w-6 h-6 mb-3 text-muted group-hover:text-foreground transition-colors" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="font-medium mb-1">{card.label}</h3>
              <p className="text-sm text-muted">{card.desc}</p>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="border border-border p-6 hover:border-red-400 transition-colors group text-left"
          >
            <LogOut className="w-6 h-6 mb-3 text-muted group-hover:text-red-500 transition-colors" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="font-medium mb-1">{t("logout")}</h3>
            <p className="text-sm text-muted">{t("logoutDesc")}</p>
          </button>
        </div>
      </div>
    </Container>
  );
}
