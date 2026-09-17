import { getSiteTexts } from "@/lib/site-text";
import { SignInClient } from "./signin-client";

export const dynamic = "force-dynamic";

// Comprobación en el servidor: si Apple todavía no tiene credenciales reales,
// el botón "Iniciar sesión con Apple" quedaría clickeable pero roto (llevaba
// a un error de NextAuth sin salida clara). Mejor no ofrecerlo como opción
// funcional hasta que AUTH_APPLE_ID/AUTH_APPLE_SECRET estén configurados.
export default async function SignInPage() {
  const appleConfigured = Boolean(
    process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET,
  );
  const texts = await getSiteTexts();

  return <SignInClient appleConfigured={appleConfigured} texts={texts} />;
}
