import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/intern",
  output: "standalone",
  reactCompiler: true,
  allowedDevOrigins: ["0.0.0.0"],
  experimental: {
    proxyClientMaxBodySize: "30mb",
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
