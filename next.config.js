/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Handle all client-side routes by redirecting to the index page
  async rewrites() {
    return [
      {
        // Capture all routes that should be handled by client-side routing
        source: "/:path*",
        destination: "/",
      },
    ];
  },
};

module.exports = nextConfig;
