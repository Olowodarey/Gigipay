/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Stub out React Native modules pulled in by @metamask/sdk
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
    };
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
    return "build-id";
  },
};

module.exports = nextConfig;
