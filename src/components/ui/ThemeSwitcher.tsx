"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { useThemeStore, AVAILABLE_THEMES } from "@/stores/themeStore";

export default function ThemeSwitcher() {
  const { currentTheme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-1">
        <Palette className="w-4 h-4" strokeWidth={1.5} />
        <span className="hidden sm:inline text-xs tracking-wider capitalize">{currentTheme}</span>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-200 rounded-box z-[100] w-52 p-2 shadow-lg max-h-80 overflow-y-auto flex-nowrap"
      >
        {AVAILABLE_THEMES.map((theme) => (
          <li key={theme}>
            <button
              className={`capitalize ${currentTheme === theme ? "active" : ""}`}
              onClick={() => setTheme(theme)}
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  data-theme={theme}
                  className="flex gap-0.5 rounded-md overflow-hidden"
                >
                  <span className="w-2 h-4 bg-primary" />
                  <span className="w-2 h-4 bg-secondary" />
                  <span className="w-2 h-4 bg-accent" />
                  <span className="w-2 h-4 bg-neutral" />
                </div>
                {theme}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
