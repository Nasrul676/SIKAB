import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./registry/**/*"],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.vercel.app"]
    }
  },
  eslint: {
    ignoreDuringBuilds: true, // skips all ESLint errors at build time
  },
  typescript: {
    // !! WARN !!
    // Sangat disarankan untuk TIDAK menggunakan ini di produksi.
    // Ini akan membuat Next.js berhasil mem-build proyek Anda bahkan jika ada error tipe.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
