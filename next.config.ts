/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,  // 👈 FIX para Hostinger
  distDir: "out",       // 👈 Donde exporta todo
  images: {
    unoptimized: true,  // 👈 NECESARIO para export
  },
};

module.exports = nextConfig;
