/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactCompiler: true,
  allowedDevOrigins: ['10.20.0.75', 'localhost', '0.0.0.0'],
  // Disable image optimization — not supported in static export
  images: { unoptimized: true },
};
export default nextConfig;