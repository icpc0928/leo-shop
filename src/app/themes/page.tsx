"use client";

import Container from "@/components/ui/Container";
import { useThemeStore, AVAILABLE_THEMES } from "@/stores/themeStore";

export default function ThemesPage() {
  const { currentTheme, setTheme } = useThemeStore();

  return (
    <Container>
      <div className="py-12">
        <h1 className="text-3xl font-serif tracking-wider mb-2 text-center">主題預覽</h1>
        <p className="text-sm text-base-content/60 text-center mb-10">
          目前主題：<span className="badge badge-primary">{currentTheme}</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {AVAILABLE_THEMES.map((theme) => (
            <button
              key={theme}
              onClick={() => setTheme(theme)}
              className={`card bg-base-100 shadow-sm border-2 transition-all hover:scale-105 ${
                currentTheme === theme ? "border-primary ring-2 ring-primary/30" : "border-transparent"
              }`}
            >
              <div data-theme={theme} className="card-body p-4 rounded-lg">
                <h3 className="text-sm font-medium capitalize text-base-content mb-2">{theme}</h3>
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded-full bg-primary" title="primary" />
                  <div className="w-6 h-6 rounded-full bg-secondary" title="secondary" />
                  <div className="w-6 h-6 rounded-full bg-accent" title="accent" />
                  <div className="w-6 h-6 rounded-full bg-neutral" title="neutral" />
                </div>
                <div className="flex gap-1 mt-1">
                  <div className="w-6 h-6 rounded-full bg-info" title="info" />
                  <div className="w-6 h-6 rounded-full bg-success" title="success" />
                  <div className="w-6 h-6 rounded-full bg-warning" title="warning" />
                  <div className="w-6 h-6 rounded-full bg-error" title="error" />
                </div>
                <div className="mt-2 text-xs text-base-content/50 flex gap-2">
                  <span className="bg-base-200 px-2 py-0.5 rounded">base-200</span>
                  <span className="bg-base-300 px-2 py-0.5 rounded">base-300</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Container>
  );
}
