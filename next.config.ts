import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // lucide-react ships a large barrel file; without this, Next.js dev
    // mode (Turbopack/webpack) can end up compiling/re-resolving far more
    // of the icon package than a page actually uses, which is the biggest
    // single cause of slow first-load/recompile times in dev.
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;