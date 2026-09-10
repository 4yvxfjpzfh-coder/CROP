"use server";

import { redirect } from "next/navigation";
import { prisma } from "@crop/prisma";
import { auth } from "@/auth";

/**
 * Persiste el consentimiento (Política de Privacidad + Términos) tras el primer
 * login con Apple. El checkbox obligatorio vive en /signin; esto lo registra
 * del lado del servidor y desbloquea el uso de la cuenta.
 */
export async function confirmConsent() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { consentedAt: new Date() },
  });

  redirect("/");
}
