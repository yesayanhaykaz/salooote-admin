/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['images.unsplash.com', 'back.salooote.am'],
  },
};
module.exports = nextConfig;
