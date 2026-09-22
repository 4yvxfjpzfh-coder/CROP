import type { NextConfig } from "next";

const securityHeaders = [
  // Evita que Crop se cargue dentro de un <iframe> ajeno (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // El navegador no debe "adivinar" el tipo de un archivo distinto al que
  // el servidor declaró (mitiga ataques de MIME-sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No mandar la URL completa de origen a sitios externos al seguir un enlace.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HTTPS obligatorio por 2 años, incluidos subdominios (Vercel ya sirve por
  // HTTPS; esto le dice al navegador que ni lo intente por HTTP la próxima vez).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Cámara solo para el propio origen (la usan agricultores/admin al subir
  // fotos); sin geolocalización/micrófono, que Crop no usa.
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Paquetes del workspace publicados como TypeScript sin compilar.
  transpilePackages: ["@crop/prisma", "@crop/trpc", "@crop/shared"],
  // Permite abrir el dev server desde otro dispositivo en la misma red
  // (ej. el celular, usando la IP que muestra "pnpm dev" como "Network").
  allowedDevOrigins: ["192.168.0.145", "192.168.41.2"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
