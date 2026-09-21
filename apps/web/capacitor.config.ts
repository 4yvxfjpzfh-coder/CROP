import type { CapacitorConfig } from "@capacitor/cli";

// Crop es una app Next.js con Server Actions, sesión de Auth.js y acceso
// directo a Prisma/Postgres — nada de eso corre dentro de un WebView sin
// backend. Por eso esto NO empaqueta HTML/JS estático (`webDir` abajo es un
// placeholder que Capacitor exige pero no se usa): la app nativa carga el
// sitio real por red, igual que Safari, pero con cáscara nativa (ícono,
// splash screen, presencia en el App Store).
//
// server.url apunta a localhost mientras no haya un deploy — server.url
// se cambia a la URL de producción (ver DEPLOY.md) antes de mandar a
// revisión de Apple. CAPACITOR_SERVER_URL permite pisarlo sin tocar este
// archivo (ej. para probar contra la Mac en la red local).
// "|| " (no "??"): si alguien exporta CAPACITOR_SERVER_URL vacío por error
// (ej. una plantilla de CI mal armada), también cae al default en vez de
// terminar apuntando a una URL vacía.
const serverUrl = process.env.CAPACITOR_SERVER_URL || "http://localhost:3000";

const config: CapacitorConfig = {
  appId: "com.crop.app",
  appName: "Crop",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
