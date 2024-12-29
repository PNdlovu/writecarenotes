const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
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

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
    };

    return config;
  },
  // Transpile specific modules
  transpilePackages: [
    '@mapbox/node-pre-gyp',
    'bcrypt'
  ]
};

module.exports = withPWA(nextConfig);
