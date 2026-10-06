/**
 * Siembra la memoria de traducciones con el inglés escrito a mano de los
 * textos que el admin personalizó desde /admin/textos.
 *
 * Por qué existe: lib/site-text-en.ts cubre los 271 textos por defecto, pero
 * si el admin reescribe uno, esa versión suya se traduce con IA — y sin
 * ANTHROPIC_API_KEY se quedaría en español. Esto rellena esos casos a mano
 * para que la app esté 100% en inglés sin depender de la API.
 *
 * Es idempotente: solo inserta lo que falta (unique lang+sourceHash).
 * Si el admin vuelve a editar un texto, cambia su hash y hay que correrlo de
 * nuevo (o configurar la API key, que ya lo resuelve solo).
 *
 * Uso:  npx tsx scripts/seed-translations.ts
 */
import { createHash } from "node:crypto";
import { prisma as db } from "@crop/prisma";

const LANG = "en";

/** Español personalizado por el admin → inglés escrito a mano. */
const PAIRS: [es: string, en: string][] = [
  ["Escribí tu nueva contraseña para tu cuenta de CROP FM.", "Enter the new password for your CROP FM account."],
  ["Cada feria tiene su propio catálogo.", "Each market has its own catalog."],
  [
    "CROP FM — Portal de compra en línea para ferias del agricultor",
    "CROP FM — Online ordering portal for farmers markets",
  ],
  [
    "Recorré en 3D el excedente disponible hoy en la feria: fotos, precios y cantidades reales.",
    "Explore today's surplus at the market in 3D: real photos, prices and quantities.",
  ],
  [
    "Scrolleá para recorrer el excedente · mové el mouse para mirar alrededor · clic en un producto para ver el detalle.",
    "Scroll to move through the surplus · move the mouse to look around · click a product for details.",
  ],
  [
    "Confirmá que aceptás la Política de Privacidad y los Términos de Servicio para empezar a usar CROP FM.",
    "Confirm that you accept the Privacy Policy and the Terms of Service to start using CROP FM.",
  ],
  [
    `1. Contacto
Escribinos a: ldqg33@gmail.com o gboydt@icloud.com. Respondemos lo antes posible.

2. ¿Cómo aparto un producto?
Entrá al catálogo de tu feria, elegí la cantidad que querés de cada producto y confirmá el pedido. No se cobra nada en línea: el pago, si aplica, es directo con el agricultor al recoger.

3. ¿Cómo cancelo un apartado?
Desde Mis apartados podés cancelar cualquier apartado vigente antes de la fecha límite de recogida.

4. Problemas con la cuenta
Si no podés iniciar sesión o tenés un problema con tu cuenta, escribinos a los correos de arriba con el correo que usaste para registrarte.`,
    `1. Contact
Write to us at: ldqg33@gmail.com or gboydt@icloud.com. We reply as soon as we can.

2. How do I reserve a product?
Open your market's catalog, choose how much you want of each product and confirm the order. Nothing is charged online: payment, if any, is made directly with the farmer at pickup.

3. How do I cancel a reservation?
From My reservations you can cancel any active reservation before the pickup deadline.

4. Account problems
If you can't sign in or have a problem with your account, write to the addresses above from the email you registered with.`,
  ],
  [
    `Tomá la foto con luz natural, de día — evitá el flash directo.
Que se vea solo el producto, sin fondo desordenado detrás.
Mostrá el producto entero, no muy de cerca ni muy lejos.
Usá el botón "Tomar foto" para sacarla ahí mismo con la cámara del celular, o "Subir foto" si ya la tenés guardada.
Después de subirla podés recortarla y ajustar brillo/contraste con el editor que aparece debajo.`,
    `Take the photo in natural daylight — avoid direct flash.
Show only the product, without a cluttered background behind it.
Show the whole product, not too close and not too far.
Use the "Take photo" button to shoot it right there with your phone camera, or "Upload photo" if you already have one saved.
After uploading you can crop it and adjust brightness/contrast with the editor below.`,
  ],
  [
    `1. ¿Qué es CROP FM?
CROP FM es una plataforma para apartar productos de excedente agrícola y de rescate de comida. No se realizan pagos en línea: el pago, si aplica, ocurre al recoger el producto en el punto de recogida.

2. Apartados y recogida
Un apartado reserva unidades por un tiempo limitado. Si no se recoge antes de la fecha límite, el apartado se libera automáticamente y las unidades vuelven a estar disponibles.

3. Tu cuenta
Sos responsable de la actividad de tu cuenta. Podés eliminarla en cualquier momento desde tu perfil.

4. Disponibilidad y cambios
El servicio se ofrece "tal cual". Podemos modificar o suspender funciones; los cambios materiales se comunicarán con antelación razonable.`,
    `1. What is CROP FM?
CROP FM is a platform for reserving surplus farm produce and rescued food. There are no online payments: payment, if any, happens when you pick the product up at the pickup point.

2. Reservations and pickup
A reservation holds units for a limited time. If they are not picked up before the deadline, the reservation is released automatically and the units become available again.

3. Your account
You are responsible for the activity on your account. You can delete it at any time from your profile.

4. Availability and changes
The service is provided "as is". We may modify or suspend features; material changes will be announced with reasonable notice.`,
  ],
  [
    `1. Datos que recopilamos
Cuando iniciás sesión con Apple recibimos tu nombre y tu dirección de correo (o el correo privado de reenvío de Apple, si elegís ocultarlo). Guardamos también los apartados que hacés en la plataforma.

2. Uso de los datos
Usamos estos datos únicamente para identificarte, mostrarte tus apartados y coordinar la recogida en la feria del agricultor. No vendemos ni compartimos tus datos con terceros.

3. Conservación y eliminación
Podés eliminar tu cuenta y tus datos personales en cualquier momento desde tu perfil. Al hacerlo borramos tu nombre, correo y credenciales de acceso de forma permanente.

4. Contacto
Para consultas sobre privacidad, escribinos a: ldqg33@gmail.com o gboydt@icloud.com.`,
    `1. Data we collect
When you sign in with Apple we receive your name and your email address (or Apple's private relay address, if you choose to hide it). We also store the reservations you make on the platform.

2. How we use the data
We use this data only to identify you, show you your reservations and coordinate pickup at the farmers market. We do not sell or share your data with third parties.

3. Retention and deletion
You can delete your account and your personal data at any time from your profile. When you do, we permanently delete your name, email and sign-in credentials.

4. Contact
For privacy questions, write to us at: ldqg33@gmail.com or gboydt@icloud.com.`,
  ],
  [
    `1. No hay pagos en línea
CROP FM no procesa pagos ni cobros a través de la plataforma. Un "apartado" es una reserva de producto, no una compra. Si corresponde algún pago, se realiza directamente con el agricultor al momento de recoger el producto en la feria.

2. Cancelar un apartado
Podés cancelar un apartado vigente en cualquier momento antes de la fecha límite de recogida, desde Mis apartados. Las unidades vuelven a estar disponibles de inmediato para otras personas.

3. Apartados vencidos
Si no recogés el producto antes de la fecha límite, el apartado se libera automáticamente y las unidades vuelven al inventario disponible. No hay ninguna penalización por esto.

4. Problemas con un producto
Como CROP FM no interviene en el pago ni en la entrega física, un reclamo sobre la calidad o el estado de un producto se resuelve directamente con el agricultor en el punto de recogida. Si el problema es con la plataforma en sí (por ejemplo, un error en la información mostrada), escribinos a: ldqg33@gmail.com o gboydt@icloud.com.`,
    `1. There are no online payments
CROP FM does not process payments or charges through the platform. A "reservation" sets product aside; it is not a purchase. Any payment is made directly with the farmer when you pick the product up at the market.

2. Cancelling a reservation
You can cancel an active reservation at any time before the pickup deadline, from My reservations. The units become available to other people immediately.

3. Expired reservations
If you don't pick the product up before the deadline, the reservation is released automatically and the units return to available stock. There is no penalty for this.

4. Problems with a product
Because CROP FM is not involved in payment or physical delivery, a complaint about the quality or condition of a product is resolved directly with the farmer at the pickup point. If the problem is with the platform itself (for example, an error in the information shown), write to us at: ldqg33@gmail.com or gboydt@icloud.com.`,
  ],
];

// "CROP FM" y "Costa Rican Operations Portal for Farmers Markets" no se
// traducen: son el nombre de la marca y un lema que ya está en inglés.

async function main() {
  const data = [];
  for (const [es, en] of PAIRS) {
    // El admin guarda con saltos CRLF; se siembran las dos formas para que el
    // hash coincida venga como venga de la base.
    for (const source of new Set([es, es.replace(/\n/g, "\r\n")])) {
      data.push({ lang: LANG, source, sourceHash: createHash("sha256").update(source).digest("hex"), value: en });
    }
  }
  const r = await db.translation.createMany({ data, skipDuplicates: true });
  console.log(`Sembradas ${r.count} traducciones nuevas (${data.length} candidatas).`);
  console.log(`Total en memoria: ${await db.translation.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
