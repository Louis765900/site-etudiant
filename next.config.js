/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuration des images
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Headers pour Google OAuth popup et securite
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ]
  },

  // Config Turbopack pour Next.js 16
  turbopack: {
    root: __dirname,
  },
}

module.exports = nextConfig
