"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useLocaleStore } from "@/stores/localeStore";
import { useTranslations } from "next-intl";
import { useSiteInfo } from "@/contexts/SiteContext";
import { ShoppingBag, Search, User, Heart, Phone, Mail, Globe, ChevronDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import "./theme.css";

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

export default function Header2() {
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const { user, isLoggedIn, logout } = useAuthStore();
  const { locale, setLocale } = useLocaleStore();
  const { currency, setCurrency } = useCurrency();
  const t = useTranslations();
  const { siteName } = useSiteInfo();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const displayCount = mounted ? cartCount : 0;

  const toggleLocale = () => {
    setLocale(locale === "zh-TW" ? "en" : "zh-TW");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="home2-header">
      {/* Top Info Bar */}
      <div className="home2-header-info-bar">
        <Container>
          <div className="flex items-center justify-between text-xs">
            {/* Left: Contact */}
            <div className="flex items-center gap-4">
              <a href="tel:+886212345678" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Phone className="w-3 h-3" strokeWidth={1.5} />
                <span className="hidden sm:inline">+886 2 1234 5678</span>
              </a>
              <a href="mailto:info@leoshop.com" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Mail className="w-3 h-3" strokeWidth={1.5} />
                <span className="hidden sm:inline">info@leoshop.com</span>
              </a>
            </div>

            {/* Right: Language & Currency */}
            <div className="flex items-center gap-3">
              {/* Language Dropdown */}
              <div className="dropdown dropdown-end">
                <button
                  tabIndex={0}
                  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                  aria-label="Switch language"
                >
                  <Globe className="w-3 h-3" strokeWidth={1.5} />
                  <span>{locale === "zh-TW" ? "繁體中文" : "English"}</span>
                  <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
                </button>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-white text-gray-700 rounded-xl z-[100] w-40 p-2 shadow-lg border border-base-200 mt-2"
                >
                  {[
                    { code: "zh-TW", label: "繁體中文" },
                    { code: "en", label: "English" },
                  ].map((lang) => (
                    <li key={lang.code}>
                      <button
                        className={`${locale === lang.code ? "bg-base-200 font-medium" : ""}`}
                        onClick={() => {
                          setLocale(lang.code as "zh-TW" | "en");
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                      >
                        {lang.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Currency Dropdown */}
              <div className="dropdown dropdown-end">
                <button
                  tabIndex={0}
                  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                  aria-label="Switch currency"
                >
                  <span>{CURRENCY_OPTIONS.find((c) => c.code === currency)?.flag} {currency}</span>
                  <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
                </button>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-white text-gray-700 rounded-xl z-[100] w-40 p-2 shadow-lg border border-base-200 max-h-64 overflow-y-auto mt-2"
                >
                  {CURRENCY_OPTIONS.map((opt) => (
                    <li key={opt.code}>
                      <button
                        className={`${currency === opt.code ? "bg-base-200 font-medium" : ""}`}
                        onClick={() => {
                          setCurrency(opt.code);
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                      >
                        {opt.flag} {opt.code}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Middle Logo Section */}
      <div className="home2-header-main">
        <Container>
          <div className="flex items-center justify-end relative">
            {/* Center: Logo (absolute center) */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-2xl lg:text-3xl font-serif tracking-[0.2em] text-[var(--home2-text)]">
              {siteName}
            </Link>

            {/* Right: Search, Account, Wishlist, Cart */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="w-10 h-10 flex items-center justify-center hover:text-[var(--home2-primary)] transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-50 flex items-center bg-white border border-base-200 rounded-full shadow-lg overflow-hidden transition-all duration-300 ease-in-out origin-right ${
                    searchOpen ? "w-64 sm:w-80 opacity-100 scale-x-100" : "w-0 opacity-0 scale-x-0"
                  }`}
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="搜尋商品..."
                    className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    className="w-10 h-10 flex items-center justify-center hover:text-[var(--home2-primary)] transition-colors shrink-0"
                  >
                    <Search className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* User Account */}
              {mounted && isLoggedIn ? (
                <div className="dropdown dropdown-end">
                  <button
                    tabIndex={0}
                    className="w-10 h-10 flex items-center justify-center hover:text-[var(--home2-primary)] transition-colors"
                    aria-label={user?.name || "User menu"}
                  >
                    <User className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-base-100 rounded-box z-[100] w-44 p-2 shadow-lg mt-2"
                  >
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
                <Link
                  href="/account/login"
                  className="w-10 h-10 flex items-center justify-center hover:text-[var(--home2-primary)] transition-colors"
                  aria-label="Login"
                >
                  <User className="w-5 h-5" strokeWidth={1.5} />
                </Link>
              )}

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="w-10 h-10 flex items-center justify-center hover:text-[var(--home2-primary)] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" strokeWidth={1.5} />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="w-10 h-10 flex items-center justify-center hover:text-[var(--home2-primary)] transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                {displayCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-[var(--home2-primary)] text-white text-[10px] font-bold leading-none px-1">
                    {displayCount > 99 ? "99+" : displayCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Navigation */}
      <div className="home2-header-nav">
        <Container>
          <nav className="flex items-center justify-center gap-8">
            {navKeys.map((key, i) => (
              <Link key={key} href={navHrefs[i]} className="home2-nav-link">
                {t(`nav.${key}`)}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </header>
  );
}
