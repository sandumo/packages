/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: true,
  reactStrictMode: false,
  output: 'standalone',
  experimental: {
    esmExternals: false,
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  transpilePackages: [
    '@fullcalendar/common',
    '@fullcalendar/react',
    '@fullcalendar/daygrid',
    '@fullcalendar/list',
    '@fullcalendar/timegrid',
    'api-client',
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision'),
    };

    return config;
  },
  images: {
    domains: ['lh3.googleusercontent.com','lh4.googleusercontent.com', 'cloudflare-ipfs.com'],
  },

  // async headers() {
  //   const baseHeaders = [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
  //         },
  //       ],
  //     },
  //   ];

  //   return [...baseHeaders];
  // },
  async rewrites() {
    const baseRewrites = [
      {
        source: '/healthcheck',
        destination: '/api/healthcheck',
      },
      {
        source: '/api/:path*',
        destination: `${process.env.INTERNAL_API_URL}/:path*`,
      },
      {
        source: '/storage/:path*',
        destination: `${process.env.API_URL}/:path*`,
      },
    ];

    return [...baseRewrites];
  },
};

