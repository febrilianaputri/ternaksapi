import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/dashboard/environment",
        destination: "/dashboard/sensors",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
