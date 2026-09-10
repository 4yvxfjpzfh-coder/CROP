import { redirect } from "next/navigation";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";

export class AdminAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAccessError";
  }
}

/**
 * Lista blanca de correos con acceso de administrador.
 * Segunda capa: aunque el rol en DB diga ADMIN, si el correo no está aquí se
 * niega el acceso. Formato: "ana@crop.com,otro@crop.com".
 */
function adminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export type AdminActor = {
  id: string;
  email: string;
  name: string | null;
};

/**
 * Verificación autoritativa de administrador, para usar en el servidor:
 * Server Components del panel y TODAS las acciones de escritura.
 *
 * No confía en el JWT: relee al usuario desde la base de datos y exige
 *   1. sesión válida
 *   2. role === "ADMIN" en DB
 *   3. email presente en ADMIN_EMAILS
 *
 * @param mode "redirect" (páginas) lanza un redirect de Next; "throw" (acciones)
 *             lanza AdminAccessError para que la acción falle sin efectos.
 */
export async function requireAdmin(
  mode: "redirect" | "throw" = "redirect",
): Promise<AdminActor> {
  const fail = (reason: string): never => {
    if (mode === "redirect") redirect("/");
    throw new AdminAccessError(reason);
  };

  const session = await auth();
  if (!session?.user?.id) {
    return fail("No autenticado");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return fail("Usuario inexistente o inactivo");
  }

  if (user.role !== "ADMIN") {
    return fail("El usuario no tiene rol ADMIN");
  }

  const allowlist = adminEmailAllowlist();
  if (allowlist.length === 0) {
    return fail("ADMIN_EMAILS no está configurado");
  }

  if (!user.email || !allowlist.includes(user.email.toLowerCase())) {
    return fail("El correo no está en la allowlist ADMIN_EMAILS");
  }

  return { id: user.id, email: user.email, name: user.name };
}
