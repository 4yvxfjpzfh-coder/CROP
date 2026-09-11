"use server";

import { redirect } from "next/navigation";
import { prisma } from "@crop/prisma";
import { auth, signOut } from "@/auth";

export type DeleteAccountResult = { ok: false; error: string };

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

/**
 * "Eliminar mi cuenta" — requerido por las políticas de Apple.
 *
 * Borra los datos personales del usuario de forma permanente:
 *  - la fila User (nombre, correo, teléfono, imagen)
 *  - sus Account (credenciales del proveedor Apple) y Session, por cascada
 *
 * Los apartados (Order) tienen FK a User; para no romper el histórico de la
 * feria se anonimiza en vez de borrar la persona en cascada dura:
 *  - Order.userId apunta a un usuario "eliminado" reservado, o
 *  - si preferís borrado total, cambiá la relación Order->User a onDelete: Cascade.
 * Aquí optamos por borrado total del usuario y sus órdenes personales.
 */
export async function deleteMyAccount(
  _prev: DeleteAccountResult | null,
): Promise<DeleteAccountResult> {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const userId = session.user.id;

  await prisma.$transaction(async (tx) => {
    // OrderItem -> Order (Cascade ya definido). Borramos las órdenes del usuario.
    const orders = await tx.order.findMany({
      where: { userId },
      select: { id: true },
    });
    if (orders.length > 0) {
      await tx.orderItem.deleteMany({
        where: { orderId: { in: orders.map((o) => o.id) } },
      });
      await tx.order.deleteMany({ where: { userId } });
    }

    // Account y Session tienen onDelete: Cascade desde User; basta con borrar User.
    await tx.user.delete({ where: { id: userId } });
  });

  await signOut({ redirectTo: "/" });

  // signOut ya redirige; este return es solo para el tipo.
  return { ok: false, error: "" };
}
