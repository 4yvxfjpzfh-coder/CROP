import { redirect } from "next/navigation";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";

export class FarmerAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FarmerAccessError";
  }
}

export type FarmerActor = {
  id: string;
  email: string | null;
  name: string | null;
};

/**
 * Verificación autoritativa de agricultor, para /agricultor y sus acciones.
 * No confía en el JWT: relee el rol desde la DB. A diferencia de admin, no
 * hay allowlist de correos — el rol FARMER lo asigna un admin a mano desde
 * /admin/agricultores, y esa asignación es el único portón.
 *
 * @param mode "redirect" (páginas) lanza un redirect de Next; "throw" (acciones)
 *             lanza FarmerAccessError para que la acción falle sin efectos.
 */
export async function requireFarmer(
  mode: "redirect" | "throw" = "redirect",
): Promise<FarmerActor> {
  const fail = (reason: string): never => {
    if (mode === "redirect") redirect("/");
    throw new FarmerAccessError(reason);
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

  // Un admin también puede entrar a /agricultor (por si necesita revisar algo),
  // pero el caso normal es el rol FARMER.
  if (user.role !== "FARMER" && user.role !== "ADMIN") {
    return fail("El usuario no tiene rol FARMER");
  }

  return { id: user.id, email: user.email, name: user.name };
}
