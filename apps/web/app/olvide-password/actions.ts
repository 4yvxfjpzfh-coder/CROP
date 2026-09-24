"use server";

import { z } from "zod";
import { prisma } from "@crop/prisma";
import { signResetToken } from "@/lib/reset-token";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido"),
});

export type ForgotPasswordResult = { ok: true } | { ok: false; error: string };

/**
 * Siempre devuelve ok:true si el correo tiene formato válido, exista o no la
 * cuenta -- así nadie puede usar este formulario para averiguar qué correos
 * están registrados en Crop.
 */
export async function requestPasswordReset(
  _prev: ForgotPasswordResult | null,
  formData: FormData,
): Promise<ForgotPasswordResult> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Correo inválido" };
  }
  const { email } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  // Cuentas que solo usan Apple (sin passwordHash) no tienen contraseña que
  // resetear -- se sigue de largo sin mandar nada, mismo resultado visible.
  if (user && user.passwordHash) {
    const token = await signResetToken(user.id, user.passwordHash);
    const siteUrl = process.env.AUTH_URL || "http://localhost:3000";
    const resetUrl = `${siteUrl}/restablecer-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Recuperar tu contraseña de Crop",
      html: `
        <p>Pediste restablecer tu contraseña de Crop.</p>
        <p><a href="${resetUrl}">Elegí una contraseña nueva</a></p>
        <p>Este link vale por 30 minutos. Si no pediste esto, ignorá el correo.</p>
      `,
    });
  }

  return { ok: true };
}
