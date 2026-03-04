"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface CurrencyContextType {
  currency: string;
  rates: Record<string, number>;
  setCurrency: (c: string) => void;
  convertPrice: (twdAmount: number) => number;
  formatPrice: (twdAmount: number) => string;
  formatPriceTWD: (twdAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const LOCALE_CURRENCY_MAP: Record<string, string> = {
  "zh-TW": "TWD",
  "zh-CN": "CNY",
  "ja": "JPY",
  "ko": "KRW",
  "en-US": "USD",
  "en-GB": "GBP",
  "en": "USD",
  "th": "THB",
  "vi": "VND",
};

const CURRENCY_LOCALE_MAP: Record<string, string> = {
  TWD: "zh-TW",
  USD: "en-US",
  JPY: "ja-JP",
  EUR: "de-DE",
  GBP: "en-GB",
  CNY: "zh-CN",
  KRW: "ko-KR",
  THB: "th-TH",
  VND: "vi-VN",
  SGD: "en-SG",
  HKD: "zh-HK",
};

const ZERO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW", "VND"]);

const STORAGE_KEY = "leo-shop-currency";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function detectCurrency(): string {
  if (typeof navigator === "undefined") return "TWD";
  const lang = navigator.language;
  if (LOCALE_CURRENCY_MAP[lang]) return LOCALE_CURRENCY_MAP[lang];
  const prefix = lang.split("-")[0];
  if (LOCALE_CURRENCY_MAP[prefix]) return LOCALE_CURRENCY_MAP[prefix];
  return "TWD";
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState("TWD");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Read stored currency or detect
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCurrencyState(stored);
    } else {
      const detected = detectCurrency();
      setCurrencyState(detected);
    }

    // Fetch rates
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/exchange-rates`);
        if (res.ok) {
          const data = await res.json();
          // New API format: { baseCurrency, rates }
          if (data.rates) {
            setRates(data.rates);
          } else {
            // Fallback for old API format (just in case)
            setRates(data);
          }
        }
      } catch {
        // API unavailable, keep TWD only
      } finally {
        setInitialized(true);
      }
    })();
  }, []);

  const setCurrency = useCallback((c: string) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  }, []);

  const convertPrice = useCallback(
    (twdAmount: number): number => {
      if (currency === "TWD") return twdAmount;
      const rate = rates[currency];
      if (!rate) return twdAmount;
      return twdAmount * rate;
    },
    [currency, rates]
  );

  const formatPrice = useCallback(
    (twdAmount: number): string => {
      const converted = currency === "TWD" ? twdAmount : twdAmount * (rates[currency] || 1);
      const locale = CURRENCY_LOCALE_MAP[currency] || "en-US";
      const fractionDigits = ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2;
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: currency === "TWD" ? 0 : fractionDigits,
        maximumFractionDigits: currency === "TWD" ? 0 : fractionDigits,
      }).format(converted);
    },
    [currency, rates]
  );

  const formatPriceTWD = useCallback((twdAmount: number): string => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(twdAmount);
  }, []);

  // Prevent flash: render children only after initialization
  if (!initialized) return null;

  return (
    <CurrencyContext.Provider
      value={{ currency, rates, setCurrency, convertPrice, formatPrice, formatPriceTWD }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
