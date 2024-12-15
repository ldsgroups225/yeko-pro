/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'merry-rook-953.convex.cloud',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
