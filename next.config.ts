import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    FIREBASE_APIKEY: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
    FIREBASE_AUTHDOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
    FIREBASE_PROJECTID: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
    FIREBASE_STORAGEBUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
    FIREBASE_MESSAGINGSENDERID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
    FIREBASE_APPID: process.env.NEXT_PUBLIC_FIREBASE_APPID,
    FIREBASE_DATABASE_URL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    FIREBASE_PROJECTID: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
    FIREBASE_DATABASE_SECRET: process.env.FIREBASE_DATABASE_SECRET,
  },
  async redirects() {
    return [
      {
        source: "/dashboard/environment",
        destination: "/dashboard/sensors",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
