import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  serverExternalPackages: ['@supabase/supabase-js'],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default withAnalyzer(nextConfig);
