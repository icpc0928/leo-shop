"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { siteInfoAPI } from "@/lib/api";

interface SiteInfo {
  siteName: string;
  baseCurrency: string;
}

const SiteContext = createContext<SiteInfo>({ siteName: "Leo Shop", baseCurrency: "TWD" });

export function SiteProvider({ children }: { children: ReactNode }) {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({ siteName: "Leo Shop", baseCurrency: "TWD" });

  useEffect(() => {
    siteInfoAPI.get().then(setSiteInfo).catch(() => {});
  }, []);

  return <SiteContext.Provider value={siteInfo}>{children}</SiteContext.Provider>;
}

export function useSiteInfo() {
  return useContext(SiteContext);
}
