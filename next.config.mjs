/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "www.thebestf1.es",
      },
      {
        protocol: "https",
        hostname: "www.formula1.com",
      },
    ],
  },
};

export default nextConfig;
