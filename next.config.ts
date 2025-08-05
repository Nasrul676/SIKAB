import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./registry/**/*"],
  },
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  eslint: {
    ignoreDuringBuilds: true, // skips all ESLint errors at build time
  },
  typescript: {
    // !! WARN !!
    // Sangat disarankan untuk TIDAK menggunakan ini di produksi.
    // Ini akan membuat Next.js berhasil mem-build proyek Anda bahkan jika ada error tipe.
    ignoreBuildErrors: true,
  },
  output: 'standalone',
};

export default nextConfig;
