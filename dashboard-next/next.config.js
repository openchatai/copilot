/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
