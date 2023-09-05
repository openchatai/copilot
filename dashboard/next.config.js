/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: false,
  },

  images: {
    unoptimized: true,
  },
  output: "standalone",
};

module.exports = nextConfig;
