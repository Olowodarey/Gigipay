/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
      "@solana/wallet-adapter-react": false,
      "@solana/wallet-adapter-base": false,
      "@solana/web3.js": false,
    };
    return config;
  },
  staticPageGenerationTimeout: 1000,
};

module.exports = nextConfig;
