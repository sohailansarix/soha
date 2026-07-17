import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `pg` uses Node built-ins (dns, fs, net, tls) that must stay external to
  // the server bundle under Turbopack.
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
