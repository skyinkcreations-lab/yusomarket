/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ⭐ Force Turbopack — removes webpack issues + fixes source map errors
  experimental: {
    turbo: {
      rules: {
        // Allow images, svg, etc.
        "*.svg": {
          loaders: ["@svgr/webpack"],
        },
      },
    },
  },

  // ⭐ Disable Webpack completely (Next.js 16 defaults to Turbopack)
  webpack: () => {
    return {};
  },

  // Needed for images if you fetch from external URLs later
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
