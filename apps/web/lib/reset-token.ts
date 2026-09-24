import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

const TOKEN_TTL_MINUTES = 30;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET no está configurado");
  return new TextEncoder().encode(secret);
}

// Huella corta del hash de contraseña actual: viaja dentro del token y se
// vuelve a calcular al verificar. Si la contraseña ya cambió desde que se
// pidió el link (porque se usó una vez, o cambió por otro medio), la huella
// no coincide más y el token queda invalido solo -- sin necesitar una tabla
// aparte en la base para marcar tokens ya usados.
export function passwordFingerprint(passwordHash: string | null): string {
  return createHash("sha256").update(passwordHash ?? "none").digest("hex").slice(0, 16);
}

export async function signResetToken(userId: string, passwordHash: string | null): Promise<string> {
  return new SignJWT({ pwv: passwordFingerprint(passwordHash) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_MINUTES}m`)
    .sign(secretKey());
}

export async function verifyResetToken(
  token: string,
): Promise<{ userId: string; passwordFingerprint: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.sub !== "string" || typeof payload.pwv !== "string") return null;
    return { userId: payload.sub, passwordFingerprint: payload.pwv };
  } catch {
    return null;
  }
}
