import path from "path";
import type { NextConfig } from "next";

// /chama-festa é outro app (projeto front-chama na Vercel), servido aqui por
// multi-zones: as páginas e os assets (/chama-festa-static) vêm de lá.
const CHAMA_FESTA = (process.env.CHAMA_FESTA_URL ?? "https://front-chama.vercel.app").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    serverActions: {
      bodySizeLimit: "4kb",
      allowedOrigins: ["festalugar.com.br", "www.festalugar.com.br", "apuracao-2026-enquete.vercel.app"],
    },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.festalugar.com.br" }],
        destination: "https://festalugar.com.br/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "apuracao-2026-alexetecribeiro-9013.vercel.app" }],
        destination: "https://apuracao-2026-enquete.vercel.app/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/chama-festa", destination: `${CHAMA_FESTA}/chama-festa` },
      { source: "/chama-festa/:path*", destination: `${CHAMA_FESTA}/chama-festa/:path*` },
      { source: "/chama-festa-static/:path*", destination: `${CHAMA_FESTA}/chama-festa-static/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "X-Frame-Options", value: "DENY" }]
            : []),
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
        ],
      },
    ];
  },
};

export default nextConfig;
