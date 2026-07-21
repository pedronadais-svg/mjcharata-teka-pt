import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.teka.com',
        pathname: '/**/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'teka.b-cdn.net',
        pathname: '/CMP1219/**',
      },
      {
        protocol: 'https',
        hostname: 'd7rh5s3nxmpy4.cloudfront.net',
        pathname: '/CMP1219/**',
      },
    ],
  },
};

export default nextConfig;
