import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.API_URL 
          ? `${process.env.API_URL}/api/:path*` 
          : 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
