import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

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

const siteUrl = process.env.AUTH_URL ?? "http://localhost:3000";
const title = "Crop — Rescate de comida y excedentes agrícolas";
const description =
  "Aparta productos de excedente agrícola (cacao, café, banano, piña y más) y recógelos en la feria del agricultor. Sin pagos en línea.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: { title, description, url: siteUrl, siteName: "Crop", locale: "es_CR" },
  twitter: { card: "summary", title, description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream font-[family-name:var(--font-form)] text-olive">
        {children}
      </body>
    </html>
  );
}
