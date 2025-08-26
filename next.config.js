/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  // Security: Disable directory listing
  trailingSlash: false,
  // Security: Disable source maps in production
  productionBrowserSourceMaps: false,
  // Security: Enable compression
  compress: true,
  // Security: Disable powered by header
  poweredByHeader: false,
  // Vercel deployment configuration
  output: 'standalone',
}

module.exports = nextConfig
