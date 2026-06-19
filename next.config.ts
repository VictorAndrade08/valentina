/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Redirects permanentes (301) — para que los links viejos sigan funcionando.
  async redirects() {
    return [
      {
        source: "/concurso-ia",
        destination: "/becas",
        permanent: true,
      },
      {
        source: "/concurso-ia/:path*",
        destination: "/becas/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
