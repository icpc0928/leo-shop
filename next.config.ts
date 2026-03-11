import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// 從 NEXT_PUBLIC_API_URL 自動提取 hostname
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
const apiHostname = apiUrl ? new URL(apiUrl).hostname : "";
const apiProtocol = apiUrl ? (new URL(apiUrl).protocol.replace(":", "") as "http" | "https") : "http";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
      // 自動從環境變數加入 API hostname
      ...(apiHostname ? [
        { protocol: apiProtocol, hostname: apiHostname },
      ] : []),
    ],
  },
};

export default withNextIntl(nextConfig);
