"use server";

import { z } from "zod";
import { prisma } from "@crop/prisma";
import { hashPassword } from "@/lib/password";
import { verifyResetToken, passwordFingerprint } from "@/lib/reset-token";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "La contraseña necesita al menos 8 caracteres"),
});

export type ResetPasswordResult = { ok: true } | { ok: false; error: string };

export async function resetPassword(
  _prev: ResetPasswordResult | null,
  formData: FormData,
): Promise<ResetPasswordResult> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { token, password } = parsed.data;

  const verified = await verifyResetToken(token);
  if (!verified) {
    return { ok: false, error: "Este link venció o no es válido. Pedí uno nuevo." };
  }

  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
    select: { id: true, passwordHash: true },
  });
  if (!user || passwordFingerprint(user.passwordHash) !== verified.passwordFingerprint) {
    return { ok: false, error: "Este link ya se usó o venció. Pedí uno nuevo." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, failedLoginCount: 0, lockedUntil: null },
  });

  return { ok: true };
}
