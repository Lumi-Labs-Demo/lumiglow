/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  // GitHub Pages serves from /lumiglow sub-path in production
  basePath: isProd ? "/lumiglow" : "",
  assetPrefix: isProd ? "/lumiglow/" : "",
  images: {
    unoptimized: true, // required for static export
  },
};

module.exports = nextConfig;
