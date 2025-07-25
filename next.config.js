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
      'zod',
      'next-auth',
      '@prisma/client',
    ],
    webVitalsAttribution: ['CLS', 'LCP', 'FID', 'TTFB'],
    optimizeCss: true,
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
    // Enable partial prerendering for faster navigation
    ppr: 'incremental',
    // Optimize font loading
    optimizeServerReact: true,
  },

  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Optimize chunks
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    return config;
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
