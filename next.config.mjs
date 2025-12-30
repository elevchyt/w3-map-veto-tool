/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3upx5peno0o6w.cloudfront.net",
        pathname: "/**",
      },
    ], // warcraft3.info API endpoint
  },
};

export default nextConfig;
