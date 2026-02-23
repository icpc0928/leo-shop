"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

export default function ThemeProvider() {
  const currentTheme = useThemeStore((s) => s.currentTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  return null;
}
