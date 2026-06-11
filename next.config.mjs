/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.luma.com" },
      { protocol: "https", hostname: "**.lu.ma" },
      { protocol: "https", hostname: "images.lumacdn.com" },
      { protocol: "https", hostname: "cdn.lu.ma" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.evbuc.com" },
      { protocol: "https", hostname: "secure.meetupstatic.com" },
    ],
  },
};

export default nextConfig;
