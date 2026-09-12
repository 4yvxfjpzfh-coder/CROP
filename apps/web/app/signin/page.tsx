import { SignInClient } from "./signin-client";

// Comprobación en el servidor: si Apple todavía no tiene credenciales reales,
// el botón "Iniciar sesión con Apple" quedaría clickeable pero roto (llevaba
// a un error de NextAuth sin salida clara). Mejor no ofrecerlo como opción
// funcional hasta que AUTH_APPLE_ID/AUTH_APPLE_SECRET estén configurados.
export default function SignInPage() {
  const appleConfigured = Boolean(
    process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET,
  );

  return <SignInClient appleConfigured={appleConfigured} />;
}
