import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.AUTH_URL || "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Páginas de cuenta/admin: privadas, no aportan nada a un buscador.
      disallow: ["/admin", "/perfil", "/mis-apartados", "/welcome", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
