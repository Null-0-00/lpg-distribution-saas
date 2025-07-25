/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build and CI
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [], // Only run ESLint on these directories - empty means disable
  },

  // Disable TypeScript errors during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },

  // Server external packages
  serverExternalPackages: ['prisma', '@prisma/client'],

  // Enhanced experimental features for performance
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'date-fns',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'framer-motion',
      'recharts',
    ],
    webVitalsAttribution: ['CLS', 'LCP'],
    optimizeCss: true,
  },

  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['localhost'],
  },

  // Output optimization
  output: 'standalone',

  // Compiler optimizations (SWC)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Basic security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    BUILD_TIME: new Date().toISOString(),
    VERCEL_ENV: process.env.VERCEL_ENV || 'development',
  },
};

module.exports = nextConfig;
