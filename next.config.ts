import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Locales and defaultLocale are defined via `i18n/routing.ts` (next-intl v4)
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Allow bypassing the Image Optimizer in environments where
    // a reverse proxy (nginx) serves images directly. Set env
    // NEXT_IMAGE_UNOPTIMIZED=true in production to avoid optimizer
    // fetching failures when files are missing or Content-Type issues occur.
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === 'true',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    qualities: [50, 75, 80, 90, 100],
  },
  webpack: (config, { isServer }) => {
    // Configure for FFmpeg WASM
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Handle WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
  // Add headers for WASM and SharedArrayBuffer
  async headers() {
    return [
      {
        // Exclude static images from CORS restrictions
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ]
      },
      {
        source: '/((?!images).*)',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' }
        ]
      },
      {
        // Long-cache FFmpeg WASM assets to reduce bandwidth
        source: '/ffmpeg/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          // Explicit wasm mime is generally handled by Next, but safe to include CORP
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' }
        ]
      }
    ];
  }
};

export default withNextIntl(nextConfig);
