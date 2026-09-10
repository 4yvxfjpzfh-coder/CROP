import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Los paquetes del workspace se publican como TypeScript sin compilar.
  transpilePackages: ["@meguru/trpc", "@meguru/prisma"],
};

export default nextConfig;
