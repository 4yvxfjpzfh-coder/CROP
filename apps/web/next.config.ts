import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Paquetes del workspace publicados como TypeScript sin compilar.
  transpilePackages: ["@crop/prisma", "@crop/trpc", "@crop/shared"],
  // Permite abrir el dev server desde otro dispositivo en la misma red
  // (ej. el celular, usando la IP que muestra "pnpm dev" como "Network").
  // Sin esto, Next bloquea el HMR y el catálogo 3D no llega a hidratarse.
  allowedDevOrigins: ["192.168.0.145"],
};

export default nextConfig;
