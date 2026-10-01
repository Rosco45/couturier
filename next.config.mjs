import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Support @react-pdf/renderer in browser
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default withSerwist(nextConfig);
