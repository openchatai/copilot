/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",

  async rewrites() {
    return [
      {
        source: '/backend/:path*', // Matches any path after /backend/copilot/
        destination: 'http://localhost:5000/backend/:path*', // Replace with your API server URL
      },
    ];
  },
};

module.exports = nextConfig;
