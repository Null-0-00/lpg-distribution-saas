/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },

  // Server external packages
  serverExternalPackages: ['prisma', '@prisma/client'],

  // Basic experimental features
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'date-fns'],
    webVitalsAttribution: ['CLS', 'LCP'],
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['localhost'],
  },

  // Output optimization
  output: 'standalone',
  
  // Compiler optimizations
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
  },
};

module.exports = nextConfig;