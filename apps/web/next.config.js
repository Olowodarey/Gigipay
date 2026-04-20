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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ── X-Frame-Options ──────────────────────────────────────────
          // Prevents your app from being embedded in iframes on other sites
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // ── Content Security Policy ───────────────────────────────────
          // Privy requires auth.privy.io to be allowed for the embedded wallet iframe
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + inline (Next.js needs unsafe-inline) + Privy
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://auth.privy.io",
              // Styles: self + inline (Tailwind/CSS-in-JS needs unsafe-inline)
              "style-src 'self' 'unsafe-inline'",
              // Images: self + data URIs + blob + Privy + common CDNs
              "img-src 'self' data: blob: https://auth.privy.io https://*.privy.io",
              // Fonts: self + data URIs
              "font-src 'self' data:",
              // Connect: self + your backend + Privy + RPC endpoints + WalletConnect
              "connect-src 'self' https://auth.privy.io wss://auth.privy.io https://*.privy.io https://gigipay-backend-production.up.railway.app https://forno.celo.org https://mainnet.base.org https://rpc.ankr.com https://*.walletconnect.com wss://*.walletconnect.com https://api.coingecko.com https://pro-api.coingecko.com",
              // Frames: Privy embedded wallet iframe must be allowed
              "frame-src 'self' https://auth.privy.io https://*.privy.io",
              // Workers: blob for wagmi/viem
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
