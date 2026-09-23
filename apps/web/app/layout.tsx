import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import { getSiteTexts } from "@/lib/site-text";
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
  const t = await getSiteTexts();
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
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
