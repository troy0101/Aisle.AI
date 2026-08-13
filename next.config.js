/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "**.etsystatic.com" }
    ]
  }
};

module.exports = nextConfig;
