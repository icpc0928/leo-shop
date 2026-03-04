"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useLocaleStore } from "@/stores/localeStore";
import { useTranslations } from "next-intl";
import { ShoppingBag, Search, Menu, X, Globe, User, ChevronDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const navKeys = ["home", "products", "about", "contact", "faq"] as const;
const navHrefs = ["/", "/products", "/about", "/contact", "/faq"];

const CURRENCY_OPTIONS = [
  { code: "TWD", flag: "🇹🇼" },
  { code: "USD", flag: "🇺🇸" },
  { code: "JPY", flag: "🇯🇵" },
  { code: "EUR", flag: "🇪🇺" },
  { code: "GBP", flag: "🇬🇧" },
  { code: "CNY", flag: "🇨🇳" },
  { code: "KRW", flag: "🇰🇷" },
  { code: "THB", flag: "🇹🇭" },
  { code: "VND", flag: "🇻🇳" },
  { code: "SGD", flag: "🇸🇬" },
  { code: "HKD", flag: "🇭🇰" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const { user, isLoggedIn, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const { locale, setLocale } = useLocaleStore();
  const { currency, setCurrency } = useCurrency();
  const t = useTranslations();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bounce animation when cart count changes
  useEffect(() => {
    if (mounted && cartCount > 0) {
      setCartBounce(true);
      const timer = setTimeout(() => setCartBounce(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount, mounted]);

  const displayCount = mounted ? cartCount : 0;

  const toggleLocale = () => {
    setLocale(locale === "zh-TW" ? "en" : "zh-TW");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <div className="bg-primary text-primary-content text-xs text-center py-2 tracking-wider">
        {t("announcement.freeShipping")}
      </div>

      <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50">
        <Container>
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <Link href="/" className="text-xl lg:text-2xl font-serif tracking-[0.15em] text-primary">
              {t("common.shopName")}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navKeys.map((key, i) => (
                <Link
                  key={key}
                  href={navHrefs[i]}
                  className="nav-link text-sm tracking-wider text-base-content/60 hover:text-base-content transition-colors"
                >
                  {t(`nav.${key}`)}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Language */}
              <button
                onClick={toggleLocale}
                className="btn btn-ghost btn-sm gap-1"
                aria-label="Switch language"
              >
                <Globe className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                <span className="hidden sm:inline text-xs tracking-wider">{locale === "zh-TW" ? "EN" : "中"}</span>
              </button>

              {/* Currency */}
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn btn-ghost btn-sm gap-1" aria-label="Switch currency">
                  <span className="text-xs tracking-wider">
                    {CURRENCY_OPTIONS.find((c) => c.code === currency)?.flag} {currency}
                  </span>
                  <ChevronDown className="w-3 h-3" strokeWidth={1.5} aria-hidden="true" />
                </button>
                <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-[100] w-36 p-2 shadow-lg max-h-64 overflow-y-auto">
                  {CURRENCY_OPTIONS.map((opt) => (
                    <li key={opt.code}>
                      <button
                        className={currency === opt.code ? "active" : ""}
                        onClick={() => {
                          setCurrency(opt.code);
                          // blur to close dropdown
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                      >
                        {opt.flag} {opt.code}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Search */}
              <button className="btn btn-ghost btn-sm btn-square" aria-label="Search">
                <Search className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
              </button>

              {/* User */}
              {mounted && isLoggedIn ? (
                <div className="dropdown dropdown-end">
                  <button tabIndex={0} className="btn btn-ghost btn-sm gap-1" aria-label={user?.name || "User menu"}>
                    <User className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                    <span className="hidden sm:inline text-xs tracking-wider">{user?.name}</span>
                  </button>
                  <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-[100] w-44 p-2 shadow-lg">
                    <li>
                      <Link href="/account">{t("account.center")}</Link>
                    </li>
                    <li>
                      <Link href="/account/orders">{t("account.myOrders")}</Link>
                    </li>
                    <li>
                      <button onClick={handleLogout} className="text-error">
                        {t("account.logout")}
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link href="/account/login" className="btn btn-ghost btn-sm btn-square" aria-label="Login">
                  <User className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="btn btn-ghost btn-sm btn-square relative" aria-label="Cart">
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                {displayCount > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary text-primary-content text-[10px] font-bold leading-none px-1 shadow-sm transition-transform ${
                      cartBounce ? "animate-[cart-bounce_0.3s_ease]" : ""
                    }`}
                  >
                    {displayCount > 99 ? "99+" : displayCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu */}
              <button
                className="btn btn-ghost btn-sm btn-square md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" /> : <Menu className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileOpen && (
            <nav className="md:hidden pb-4 border-t border-base-300 pt-4 w-full">
              {navKeys.map((key, i) => (
                <Link
                  key={key}
                  href={navHrefs[i]}
                  className="block py-2 text-sm tracking-wider text-base-content/60 hover:text-base-content"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(`nav.${key}`)}
                </Link>
              ))}
            </nav>
          )}
        </Container>
      </header>
    </>
  );
}
