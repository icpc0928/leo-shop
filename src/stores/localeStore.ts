"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Locale, defaultLocale } from "@/i18n/config";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale: (locale: Locale) => set({ locale }),
    }),
    { name: "leo-shop-locale" }
  )
);
