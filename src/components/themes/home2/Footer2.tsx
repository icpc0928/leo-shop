"use client";

import Link from "next/link";
import Container from "@/components/ui/Container";
import { useTranslations } from "next-intl";
import { ArrowUp, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import "./theme.css";

const aboutLinks = [
  { href: "/about", key: "aboutUs" },
  { href: "/story", key: "ourStory" },
  { href: "/careers", key: "careers" },
  { href: "/sustainability", key: "sustainability" },
];

const quickLinks = [
  { href: "/products", key: "products" },
  { href: "/collections", key: "collections" },
  { href: "/new-arrivals", key: "newArrivals" },
  { href: "/sale", key: "sale" },
];

const serviceLinks = [
  { href: "/faq", key: "faq" },
  { href: "/shipping", key: "shipping" },
  { href: "/returns", key: "returns" },
  { href: "/privacy", key: "privacy" },
  { href: "/terms", key: "terms" },
];

export default function Footer2() {
  const t = useTranslations();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="home2-footer">
      <Container>
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: About */}
          <div>
            <h3 className="home2-footer-title">{t("footer.about")}</h3>
            <div className="space-y-2">
              {aboutLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="home2-footer-link block"
                >
                  {t(`footer.${link.key}`)}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="home2-footer-title">{t("footer.quickLinks")}</h3>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="home2-footer-link block"
                >
                  {t(`footer.${link.key}`)}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="home2-footer-title">{t("footer.customerService")}</h3>
            <div className="space-y-2">
              {serviceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="home2-footer-link block"
                >
                  {t(`footer.${link.key}`)}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="home2-footer-title">{t("footer.contactTitle")}</h3>
            <div className="space-y-3 text-sm text-[var(--home2-text-light)]">
              <p className="leading-relaxed">
                台北市信義區某某路 100 號<br />
                10F, Taipei 110
              </p>
              <p>
                <a href="tel:+886212345678" className="home2-footer-link">
                  +886 2 1234 5678
                </a>
              </p>
              <p>
                <a href="mailto:info@leoshop.com" className="home2-footer-link">
                  info@leoshop.com
                </a>
              </p>

              {/* Social Media */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-[var(--home2-border)] flex items-center justify-center hover:bg-[var(--home2-primary)] hover:border-[var(--home2-primary)] hover:text-white transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" strokeWidth={1.5} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-[var(--home2-border)] flex items-center justify-center hover:bg-[var(--home2-primary)] hover:border-[var(--home2-primary)] hover:text-white transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" strokeWidth={1.5} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-[var(--home2-border)] flex items-center justify-center hover:bg-[var(--home2-primary)] hover:border-[var(--home2-primary)] hover:text-white transition-all"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-[var(--home2-border)]">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-serif tracking-wide mb-2 text-[var(--home2-text)]">
              {t("footer.newsletter")}
            </h3>
            <p className="text-sm text-[var(--home2-text-light)] mb-4">
              {t("footer.newsletterDesc")}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="flex-1 px-4 py-2.5 text-sm border border-[var(--home2-border)] focus:outline-none focus:border-[var(--home2-primary)] transition-colors"
                aria-label="Email address"
              />
              <button className="px-6 py-2.5 bg-[var(--home2-primary)] text-white text-sm font-medium tracking-wide hover:bg-[var(--home2-primary-hover)] transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" strokeWidth={1.5} />
                {t("footer.subscribe")}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="home2-footer-bottom">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--home2-text-light)]">
            <p>
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="mr-2">{t("footer.payment")}:</span>
              {["Visa", "Mastercard", "JCB", "LINE Pay"].map((method) => (
                <span
                  key={method}
                  className="px-2 py-1 bg-white border border-[var(--home2-border)] rounded text-[10px] font-medium"
                >
                  {method}
                </span>
              ))}
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-[var(--home2-primary)] transition-colors"
            >
              <ArrowUp className="w-3 h-3" />
              <span>{t("common.backToTop")}</span>
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
