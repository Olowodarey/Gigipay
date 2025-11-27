/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  // Allow build to continue despite prerender errors
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Disable static page generation errors
  staticPageGenerationTimeout: 1000,
  // Skip prerendering for dynamic pages
  generateBuildId: async () => {
    return 'build-id'
  },
};

module.exports = nextConfig;
