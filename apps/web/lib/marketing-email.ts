import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@crop/prisma";
import { sendEmail } from "./email";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Correos de novedades (no transaccionales).
 *
 * Regla que no se rompe: todo correo de novedades lleva un enlace para darse
 * de baja que funciona de un solo clic, sin pedir contraseña. Quien se dio de
 * baja no vuelve a recibir novedades, pero sí los correos transaccionales
 * (recuperar contraseña), porque darse de baja de esos dejaría la cuenta sin
 * forma de recuperarse.
 */

/**
 * ¿Hay un remitente propio configurado?
 *
 * Sin RESEND_FROM_EMAIL los correos salen desde onboarding@resend.dev, el
 * dominio de pruebas de Resend: solo llega a la cuenta dueña de la API key y
 * lo demás cae en spam. Sirve para probar, no para lanzar.
 */
export function hasVerifiedSender() {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  return !!from && !from.includes("resend.dev");
}

export function siteUrl() {
  return getSiteUrl();
}

/** Token estable por persona. Se crea la primera vez que hace falta. */
export async function getUnsubscribeToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { unsubscribeToken: true } });
  if (user?.unsubscribeToken) return user.unsubscribeToken;
  const token = randomBytes(32).toString("base64url");
  await prisma.user.update({ where: { id: userId }, data: { unsubscribeToken: token } });
  return token;
}

export function unsubscribeUrl(token: string) {
  return `${siteUrl()}/baja?token=${encodeURIComponent(token)}`;
}

/** Da de baja por token. Idempotente: darse de baja dos veces no es un error. */
export async function unsubscribeByToken(token: string): Promise<{ ok: boolean; email?: string | null }> {
  if (!token) return { ok: false };
  const user = await prisma.user.findUnique({ where: { unsubscribeToken: token }, select: { id: true, email: true } });
  if (!user) return { ok: false };
  await prisma.user.update({ where: { id: user.id }, data: { marketingOptOutAt: new Date() } });
  return { ok: true, email: user.email };
}

/** Vuelve a suscribir, por si alguien se dio de baja sin querer. */
export async function resubscribeByToken(token: string): Promise<boolean> {
  if (!token) return false;
  const user = await prisma.user.findUnique({ where: { unsubscribeToken: token }, select: { id: true } });
  if (!user) return false;
  await prisma.user.update({ where: { id: user.id }, data: { marketingOptOutAt: null } });
  return true;
}

const ESCAPE: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ESCAPE[c]);
}

/**
 * Plantilla del correo de lanzamiento. Tabla simple y estilos en línea: es lo
 * único que renderiza parejo en Gmail, Outlook y Mail de iPhone.
 */
export function launchEmailHtml(opts: { name: string | null; brand: string; url: string; unsubscribe: string }) {
  const hola = opts.name ? `Hola, ${esc(opts.name.split(" ")[0])}` : "Hola";
  return `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#f4f1ea;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:#1f2a22;">
    <tr><td style="padding:28px 28px 0;">
      <p style="margin:0;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;">${esc(opts.brand)}</p>
      <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;color:#1f2a22;">Ya podés apartar en la feria desde el teléfono</h1>
    </td></tr>
    <tr><td style="padding:18px 28px 0;font-size:15px;line-height:1.6;">
      <p style="margin:0 0 14px;">${hola}:</p>
      <p style="margin:0 0 14px;">Abrimos ${esc(opts.brand)}. Mirá lo que los agricultores tienen hoy, apartá lo que querés y pasá a recogerlo a la hora que te sirva.</p>
      <p style="margin:0 0 14px;"><strong>No se paga nada en línea.</strong> El pago, si aplica, es directo con el agricultor cuando recogés.</p>
      <p style="margin:0 0 6px;">Por qué nos importa: lo que no se vende el día de la feria muchas veces se pierde, y esa pérdida la absorbe el agricultor. Apartando por adelantado, él sabe qué llevar.</p>
    </td></tr>
    <tr><td style="padding:22px 28px 4px;">
      <a href="${esc(opts.url)}/catalogo" style="display:inline-block;background:#1f2a22;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:8px;font-size:15px;font-weight:bold;">Ver el catálogo</a>
    </td></tr>
    <tr><td style="padding:22px 28px 26px;">
      <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
        Si no te abre el botón, copiá esta dirección: ${esc(opts.url)}/catalogo
      </p>
    </td></tr>
    <tr><td style="padding:16px 28px 24px;border-top:1px solid #e7e2d8;">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
        Recibís este correo porque tenés una cuenta en ${esc(opts.brand)}.<br>
        <a href="${esc(opts.unsubscribe)}" style="color:#6b7280;">Darme de baja de estos correos</a> ·
        <a href="${esc(opts.url)}/privacy" style="color:#6b7280;">Privacidad</a>
      </p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

export type SendReport = { enviados: number; omitidosSinCorreo: number; omitidosBaja: number; fallidos: number };

/**
 * Manda el correo de lanzamiento a quien corresponde.
 * `dryRun` cuenta a quién le llegaría sin mandar nada: usalo primero.
 */
export async function sendLaunchEmail(opts: { brand: string; dryRun: boolean; onlyTo?: string }): Promise<SendReport> {
  const users = await prisma.user.findMany({
    where: opts.onlyTo ? { email: opts.onlyTo } : {},
    select: { id: true, email: true, name: true, marketingOptOutAt: true, isActive: true },
  });

  const report: SendReport = { enviados: 0, omitidosSinCorreo: 0, omitidosBaja: 0, fallidos: 0 };
  const url = siteUrl();

  for (const u of users) {
    if (!u.email || !u.isActive) {
      report.omitidosSinCorreo++;
      continue;
    }
    if (u.marketingOptOutAt) {
      report.omitidosBaja++;
      continue;
    }
    if (opts.dryRun) {
      report.enviados++;
      continue;
    }
    const token = await getUnsubscribeToken(u.id);
    const ok = await sendEmail({
      to: u.email,
      subject: `Ya abrimos: apartá en la feria desde el teléfono`,
      html: launchEmailHtml({ name: u.name, brand: opts.brand, url, unsubscribe: unsubscribeUrl(token) }),
    });
    if (ok) report.enviados++;
    else report.fallidos++;
  }
  return report;
}
