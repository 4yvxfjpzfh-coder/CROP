import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
