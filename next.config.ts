import type { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const PerformanceAnalysisPlugin = require('./lib/webpack/performance-plugin.js')

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'lucide-react',
    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack: (config, { isServer, dev }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
      }
    }

    // Performance optimizations for production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            // Create separate chunks for large libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              maxSize: 244000, // 244KB
            },
            // UI components chunk
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|sonner)[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 20,
            },
            // Common utilities
            utils: {
              test: /[\\/]node_modules[\\/](date-fns|clsx|class-variance-authority)[\\/]/,
              name: 'utils',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      }
    }

    // Add performance analysis plugin for development
    config.plugins = config.plugins || []
    config.plugins.push(new PerformanceAnalysisPlugin())

    return config
  },
}

export default withBundleAnalyzer(nextConfig)
