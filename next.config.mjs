// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' }, // Cloudinary
      { protocol: 'https', hostname: 'unsplash.com', pathname: '/**' }, // (optional) Unsplash
      { protocol: 'https', hostname: 'fastly.picsum.photos', pathname: '/**' }, // (optional) Google avatars
    ],
    // If you ever need to debug without Next/Image optimization:
    // unoptimized: true,
  },
};

export default nextConfig;
