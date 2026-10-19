import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://52.19.144.208";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/healthz",
        destination: `${BACKEND_URL}/healthz`,
      },
      {
        source: "/api/hub/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
