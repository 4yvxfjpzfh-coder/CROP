import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import { getSiteTexts } from "@/lib/site-text";
import { getBrandTextColor, isValidHexColor } from "@/lib/site-settings";
import "./globals.css";

export const dynamic = "force-dynamic";

// Identidad de Crop, cargada acá una sola vez para toda la app (antes solo
// vivía en el layout de /admin; el resto de las páginas caían en fuentes
// genéricas de create-next-app).
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.AUTH_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getSiteTexts();
  const title = t["meta.title"];
  const description = t["meta.description"];
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: { title, description, url: siteUrl, siteName: t["brand.name"], locale: "es_CR" },
    twitter: { card: "summary", title, description },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [t, brandTextColor] = await Promise.all([getSiteTexts(), getBrandTextColor()]);
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Tailwind "@theme inline" hornea el color de .text-olive directo
            en el CSS compilado (color: #1f2a22), no como var(--color-olive)
            -- así que una variable CSS en :root no lo pisaría. Esta regla
            suelta, cargada después de globals.css, sí gana por orden.
            isValidHexColor ya se corrió al leer el settings, pero se repite
            acá (defensa en profundidad: esto se imprime tal cual en HTML). */}
        {brandTextColor && isValidHexColor(brandTextColor) && (
          <style>{`.text-olive{color:${brandTextColor} !important}`}</style>
        )}
      </head>
      {/* suppressHydrationWarning: extensiones como Grammarly inyectan sus
          propios atributos data-gr-* en <body> antes de que React hidrate;
          no es un problema real de la app, solo ruido en consola. */}
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-cream font-[family-name:var(--font-form)] text-olive"
      >
        {children}
        <CookieConsent
          body={t["cookie.body"]}
          acceptLabel={t["cookie.accept"]}
          privacyLabel={t["footer.privacidad"]}
        />
      </body>
    </html>
  );
}
