/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Disable static optimization for pages that use dynamic features
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Skip static optimization during build
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;