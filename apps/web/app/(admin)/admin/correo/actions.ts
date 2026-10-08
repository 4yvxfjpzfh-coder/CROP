"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { getSiteTexts } from "@/lib/site-text";
import { sendLaunchEmail, hasVerifiedSender, type SendReport } from "@/lib/marketing-email";

export type CorreoState = { mensaje?: string; error?: string; reporte?: SendReport };

/**
 * Manda el correo de lanzamiento. Tres modos:
 *  - prueba en seco: cuenta sin mandar nada;
 *  - prueba a una dirección: manda uno solo, para verlo en el teléfono;
 *  - envío real: pide escribir ENVIAR, porque no se puede deshacer.
 */
export async function enviarLanzamiento(_: CorreoState | null, form: FormData): Promise<CorreoState> {
  await requireAdmin("redirect");
  const t = await getSiteTexts();
  const brand = t["brand.name"];
  const modo = String(form.get("modo") ?? "seco");

  if (modo === "seco") {
    const reporte = await sendLaunchEmail({ brand, dryRun: true });
    return { mensaje: `Prueba en seco: le llegaría a ${reporte.enviados}. Nadie recibió nada.`, reporte };
  }

  if (modo === "prueba") {
    const to = String(form.get("prueba") ?? "").trim();
    if (!to.includes("@")) return { error: "Escribí una dirección de correo válida para la prueba." };
    const reporte = await sendLaunchEmail({ brand, dryRun: false, onlyTo: to });
    if (reporte.enviados === 0)
      return { error: `No se pudo mandar a ${to}. ¿Esa dirección tiene cuenta en ${brand}?`, reporte };
    return { mensaje: `Prueba enviada a ${to}. Revisá también spam.`, reporte };
  }

  // Envío real. Se bloquea sin remitente propio: mandarle a toda la base
  // desde el dominio de pruebas de Resend cae en spam y no se puede deshacer.
  if (!hasVerifiedSender())
    return {
      error:
        "Falta RESEND_FROM_EMAIL con un dominio verificado en Resend. Sin eso el correo sale desde onboarding@resend.dev y cae en spam. La prueba a una dirección sí funciona.",
    };

  // Envío real
  if (String(form.get("confirmacion") ?? "").trim().toUpperCase() !== "ENVIAR")
    return { error: 'Para mandar de verdad hay que escribir ENVIAR en el campo de confirmación.' };

  const reporte = await sendLaunchEmail({ brand, dryRun: false });
  return {
    mensaje: `Enviado a ${reporte.enviados}. Omitidos: ${reporte.omitidosBaja} dados de baja, ${reporte.omitidosSinCorreo} sin correo. Fallidos: ${reporte.fallidos}.`,
    reporte,
  };
}
