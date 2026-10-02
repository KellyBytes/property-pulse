/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Don't keep fetch responses (e.g. temporary geocoding) across HMR in dev
    serverComponentsHmrCache: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
