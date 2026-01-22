import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirect www to non-www (pick one canonical domain)
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.memorybook.family" }],
        destination: "https://memorybook.family/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
