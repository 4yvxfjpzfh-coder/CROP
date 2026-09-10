import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Paquetes del workspace publicados como TypeScript sin compilar.
  transpilePackages: ["@crop/prisma", "@crop/trpc", "@crop/shared"],
};

export default nextConfig;
