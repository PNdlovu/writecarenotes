/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.blob.core.windows.net',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle HTML files
    config.module.rules.push({
      test: /\.html$/,
      loader: 'html-loader',
      options: {
        minimize: true,
      }
    });

    // Ignore mapbox pre-gyp
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@mapbox/node-pre-gyp': false,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    return config;
  },
  // Transpile specific modules
  transpilePackages: [
    '@mapbox/node-pre-gyp',
    'bcrypt'
  ]
};

module.exports = nextConfig;
