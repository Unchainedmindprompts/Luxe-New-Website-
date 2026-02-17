/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint is run separately in CI; don't block production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
