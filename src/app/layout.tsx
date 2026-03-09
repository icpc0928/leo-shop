import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import IntlProvider from "@/components/providers/IntlProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SiteProvider } from "@/contexts/SiteContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Leo Shop | Curated Living",
  description: "精選生活好物，簡約設計，品味生活。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f9fafb" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://picsum.photos" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider />
        <SiteProvider>
          <IntlProvider>
            <CurrencyProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </CurrencyProvider>
          </IntlProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
