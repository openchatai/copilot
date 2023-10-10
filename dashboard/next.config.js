/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compiler: {
    removeConsole: false,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone",
};

module.exports = nextConfig;
