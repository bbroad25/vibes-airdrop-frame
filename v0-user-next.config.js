/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', 'tls', etc. on the client side
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        http2: false,
        dns: false,
        child_process: false,
        path: false,
      }
    }
    return config
  },
}

module.exports = nextConfig

