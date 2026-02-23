"use client";

import { NextIntlClientProvider } from "next-intl";
import { useLocaleStore } from "@/stores/localeStore";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";

const messageImports: Record<Locale, () => Promise<Record<string, unknown>>> = {
  "zh-TW": () => import("@/i18n/zh-TW.json").then((m) => m.default as unknown as Record<string, unknown>),
  en: () => import("@/i18n/en.json").then((m) => m.default as unknown as Record<string, unknown>),
};

export default function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);
  const [currentLocale, setCurrentLocale] = useState(locale);

  useEffect(() => {
    messageImports[locale]().then((msgs) => {
      setMessages(msgs);
      setCurrentLocale(locale);
    });
  }, [locale]);

  if (!messages) return null;

  return (
    <NextIntlClientProvider locale={currentLocale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
