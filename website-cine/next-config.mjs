/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000', // El puerto de tu backend
        pathname: '/**', // Permite cualquier ruta de imagen dentro del servidor
      },
    ],
  },
};

export default nextConfig;