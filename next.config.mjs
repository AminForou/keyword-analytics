/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/keyword-analytics',
  assetPrefix: '/keyword-analytics/',
};

export default nextConfig;
