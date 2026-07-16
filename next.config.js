/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'mrmed-image.s3.ap-south-1.amazonaws.com' },
    ],
  },
  serverExternalPackages: ['openai'],
}

module.exports = nextConfig
