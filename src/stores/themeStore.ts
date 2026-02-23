"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const AVAILABLE_THEMES = [
  "light",
  "dark",
  "cupcake",
  "forest",
  "luxury",
  "cyberpunk",
  "garden",
  "aqua",
  "dracula",
  "autumn",
  "business",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
] as const;

export type ThemeName = (typeof AVAILABLE_THEMES)[number];

interface ThemeState {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: "light",
      setTheme: (theme: ThemeName) => {
        document.documentElement.setAttribute("data-theme", theme);
        set({ currentTheme: theme });
      },
    }),
    {
      name: "leo-shop-theme",
    }
  )
);
