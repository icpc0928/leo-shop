"use client";

import { usePathname } from "next/navigation";
import { CURRENT_THEME } from "@/config/themes";

// Home-1 Components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Home-2 Components
import Header2 from "@/components/themes/home2/Header2";
import Footer2 from "@/components/themes/home2/Footer2";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  // Select Header & Footer based on theme
  const HeaderComponent = CURRENT_THEME === "home2" ? Header2 : Header;
  const FooterComponent = CURRENT_THEME === "home2" ? Footer2 : Footer;

  return (
    <>
      <HeaderComponent />
      <main className="min-h-screen">{children}</main>
      <FooterComponent />
    </>
  );
}
