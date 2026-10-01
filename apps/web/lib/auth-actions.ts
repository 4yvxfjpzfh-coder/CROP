"use server";

import { signOut } from "@/auth";

/**
 * Cierra sesión de verdad con un solo click. Antes algunos lugares usaban
 * un <Link href="/api/auth/signout">, que en Auth.js v5 lleva a una página
 * de confirmación sin estilos (en blanco, sin la identidad de la app) donde
 * hay que tocar "Sign out" una segunda vez -- se sentía como un botón
 * trabado/sin respuesta. Esta acción hace el signOut directo, sin esa
 * pantalla intermedia.
 */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
