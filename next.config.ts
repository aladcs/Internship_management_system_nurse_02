import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/intern",
  output: "standalone",
  reactCompiler: true,
  experimental: {
    proxyClientMaxBodySize: "30mb",
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
