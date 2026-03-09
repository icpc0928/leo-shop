"use client";

import Link from "next/link";
import Container from "@/components/ui/Container";
import { useTranslations } from "next-intl";
import { ArrowUp } from "lucide-react";
import { useSiteInfo } from "@/contexts/SiteContext";

const quickLinkKeys = [
  { href: "/products", key: "products" },
  { href: "/about", key: "about" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
];

export default function Footer() {
  const t = useTranslations();

  const { siteName } = useSiteInfo();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer footer-center mt-20 bg-neutral text-neutral-content p-0">
      <Container>
        <div className="footer p-10 text-neutral-content">
          {/* Store Info */}
          <nav>
            <h6 className="footer-title text-lg font-serif tracking-[0.15em]">{siteName}</h6>
            <p className="text-sm opacity-80 leading-relaxed max-w-xs">
              {t("common.shopDesc")}
            </p>
          </nav>

          {/* Quick Links */}
          <nav>
            <h6 className="footer-title">{t("footer.quickLinks")}</h6>
            {quickLinkKeys.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link link-hover text-sm opacity-80"
              >
                {t(`nav.${link.key}`)}
              </Link>
            ))}
          </nav>

          {/* Contact */}
          <nav>
            <h6 className="footer-title">{t("footer.contactTitle")}</h6>
            <span className="text-sm opacity-80">info@leoshop.com</span>
            <span className="text-sm opacity-80">+886 2 1234 5678</span>
            <span className="text-sm opacity-80">台北市信義區某某路 100 號</span>
          </nav>

          {/* Payment */}
          <nav>
            <h6 className="footer-title">{t("footer.payment")}</h6>
            <div className="flex flex-wrap gap-2">
              {["Visa", "Mastercard", "JCB", "LINE Pay", "ATM"].map((method) => (
                <span
                  key={method}
                  className="badge badge-outline badge-sm opacity-80"
                >
                  {method}
                </span>
              ))}
            </div>
          </nav>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-content/20 py-6 w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
          <p className="text-xs opacity-60">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              {["Instagram", "Facebook", "Twitter"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="link link-hover text-xs opacity-60"
                >
                  {social}
                </a>
              ))}
            </div>
            <button
              onClick={scrollToTop}
              className="btn btn-ghost btn-xs gap-1 opacity-60 hover:opacity-100"
            >
              <ArrowUp className="w-3 h-3" aria-hidden="true" />
              {t("common.backToTop")}
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
