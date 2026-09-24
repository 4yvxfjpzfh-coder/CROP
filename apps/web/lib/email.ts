// Envío de correo vía la API REST de Resend (sin su SDK, un fetch alcanza).
// Sin RESEND_API_KEY configurada, no rompe: solo loguea y no manda nada --
// útil en desarrollo local, donde nadie necesita recibir el correo de verdad.
export async function sendEmail(options: { to: string; subject: string; html: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY no configurada, no se envía:", options.subject, "->", options.to);
    return false;
  }

  const from = process.env.RESEND_FROM_EMAIL || "Crop <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: options.to, subject: options.subject, html: options.html }),
    });
    if (!res.ok) {
      console.error("[email] Resend respondió con error:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] no se pudo enviar:", err);
    return false;
  }
}
