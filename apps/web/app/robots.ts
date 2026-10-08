import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
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
