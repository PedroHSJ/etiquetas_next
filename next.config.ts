import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  webpack: (config, { isServer, nextRuntime }) => {
    // Avoid "A Node.js API is used" warning in Edge Runtime (Supabase/Realtime)
    if (nextRuntime === "edge") {
      config.resolve.alias = {
        ...config.resolve.alias,
        ws: false,
      };
    }
    return config;
  },
};

export default nextConfig;
