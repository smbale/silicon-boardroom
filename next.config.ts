import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Allows accessing the dev server via local IP (e.g., from a phone or other device)
    allowedDevOrigins: ["192.168.0.6", "localhost:3000"],
  },
};

export default nextConfig;
