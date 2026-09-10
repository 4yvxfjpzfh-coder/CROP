import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Los paquetes del workspace se publican como TypeScript sin compilar.
  transpilePackages: ["@crop/trpc", "@crop/prisma"],
};

export default nextConfig;
