/**
 * Dirección pública del sitio. AUTH_URL manda; si falta (por ejemplo durante
 * el build), se usa el dominio de producción que Vercel pone solo. Sin esto el
 * sitemap y los enlaces de Google salían como localhost.
 */
export function getSiteUrl() {
  if (process.env.AUTH_URL) return process.env.AUTH_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
