"use server";

import { z } from "zod";
import { prisma } from "@crop/prisma";
import { hashPassword } from "@/lib/password";

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(8, "La contraseña necesita al menos 8 caracteres"),
});

export type RegisterResult = { ok: true } | { ok: false; error: string };

export async function registerCustomer(
  _prev: RegisterResult | null,
  formData: FormData,
): Promise<RegisterResult> {
  if (formData.get("accepted") !== "on") {
    return { ok: false, error: "Tenés que aceptar Privacidad y Términos" };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Ya existe una cuenta con ese correo. Entrá con tu contraseña." };
  }

  const passwordHash = await hashPassword(password);
  try {
    await prisma.user.create({
      data: { name, email, passwordHash, role: "USER", consentedAt: new Date() },
    });
  } catch (err) {
    console.error("[registro] no se pudo crear la cuenta:", err);
    return { ok: false, error: "No se pudo crear la cuenta. Probá de nuevo." };
  }

  return { ok: true };
}
