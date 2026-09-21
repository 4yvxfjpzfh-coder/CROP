import { Resend } from "resend";
import { formatPickupDeadline } from "./format";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// resend.dev es un dominio de prueba que Resend deja usar sin verificar
// dominio propio — sirve para arrancar; conviene cambiarlo a un dominio real
// (EMAIL_FROM) apenas se verifique uno en el dashboard de Resend.
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "Crop <notificaciones@resend.dev>";

/**
 * Avisa por correo al agricultor dueño de un producto que alguien lo apartó.
 * Nunca tira: si falta RESEND_API_KEY o falla el envío, solo se loguea —
 * el apartado ya se confirmó en la base antes de llegar acá, no tiene
 * sentido que un correo roto lo eche para atrás.
 */
export async function sendFarmerReservationEmail(params: {
  to: string;
  farmerName: string | null;
  productName: string;
  quantity: number;
  pickupPointName: string | null;
  pickupBy: Date;
}) {
  if (!resend) {
    console.error("[email] RESEND_API_KEY no configurada, no se envió el aviso al agricultor");
    return;
  }
  try {
    const greeting = params.farmerName ? `Hola ${params.farmerName},` : "Hola,";
    const unidad = params.quantity === 1 ? "unidad" : "unidades";
    const lugar = params.pickupPointName ? `\nPunto de recogida: ${params.pickupPointName}` : "";
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Te apartaron "${params.productName}" en Crop`,
      text:
        `${greeting}\n\n` +
        `Alguien acaba de apartar ${params.quantity} ${unidad} de "${params.productName}".` +
        `${lugar}\n` +
        `Tiene hasta el ${formatPickupDeadline(params.pickupBy)} para recogerlo.\n\n` +
        `— Crop`,
    });
  } catch (err) {
    console.error("[email] no se pudo enviar el aviso al agricultor:", err);
  }
}
