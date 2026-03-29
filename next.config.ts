import type { NextConfig } from "next";

const configuredOrigins =
  process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [...new Set(["*.agent.cvm.dev", ...configuredOrigins])]
};

export default nextConfig;
