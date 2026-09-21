import { Capacitor } from "@capacitor/core";
import { formatPickupDeadline } from "./format";

/**
 * Capacidades nativas reales (no solo el sitio cargado en un WebView):
 * recordatorio local antes de que venza un apartado, y cámara nativa para
 * fotos de producto. Todo esto es un no-op fuera de la app de iOS/Android —
 * el mismo código sirve para la web normal sin romper nada ahí.
 */

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

function notificationIdFor(orderId: string): number {
  // LocalNotifications pide un id numérico estable por apartado, para poder
  // cancelarlo después si el usuario cancela el apartado desde la web.
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    hash = (hash * 31 + orderId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2147483647;
}

async function loadLocalNotifications() {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  return LocalNotifications;
}

// Tope del recordatorio: hasta 2h antes de la fecha límite, pero nunca antes
// de "ahora" — con ventanas de recogida cortas (el admin permite desde 1h en
// /admin/settings) usamos la mitad del tiempo restante en vez de quedarnos
// sin programar nada.
const MAX_REMINDER_LEAD_MS = 2 * 3600 * 1000;

/**
 * Devuelve true si se programó el recordatorio. false si no correspondía
 * (fuera de la app nativa, la fecha límite ya pasó, el usuario no dio
 * permiso, o falló el plugin) — quien llama puede ignorarlo sin problema,
 * ya que la pantalla de "apartado listo" nunca promete un recordatorio.
 */
export async function schedulePickupReminder(orderId: string, pickupByIso: string): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    const pickupBy = new Date(pickupByIso);
    // Con fecha inválida, pickupBy.getTime() es NaN y toda comparación con
    // NaN da false — sin este chequeo aparte, "remainingMs <= 0" nunca se
    // cumple y la función sigue de largo en vez de abortar.
    if (Number.isNaN(pickupBy.getTime())) return false;
    const remainingMs = pickupBy.getTime() - Date.now();
    if (remainingMs <= 0) return false;

    const leadMs = Math.min(MAX_REMINDER_LEAD_MS, remainingMs / 2);
    const reminderAt = new Date(pickupBy.getTime() - leadMs);

    const LocalNotifications = await loadLocalNotifications();
    // @capacitor/local-notifications 8.3+ ya pide permiso solo si hace
    // falta al llamar schedule(); pedirlo antes a mano con
    // checkPermissions()/requestPermissions() es una vuelta de más al
    // puente nativo en el camino más común (permiso ya concedido).
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationIdFor(orderId),
          title: "Tu apartado vence pronto",
          body: `Tenés hasta las ${formatPickupDeadline(pickupBy)} para recogerlo.`,
          schedule: { at: reminderAt },
        },
      ],
    });
    return true;
  } catch (err) {
    console.error("[native] no se pudo programar el recordatorio:", err);
    return false;
  }
}

export async function cancelPickupReminder(orderId: string) {
  if (!isNativeApp()) return;
  try {
    const LocalNotifications = await loadLocalNotifications();
    await LocalNotifications.cancel({ notifications: [{ id: notificationIdFor(orderId) }] });
  } catch (err) {
    console.error("[native] no se pudo cancelar el recordatorio:", err);
  }
}

export type CapturePhotoResult =
  | { status: "captured"; file: File }
  | { status: "cancelled" }
  | { status: "error"; message: string };

/**
 * Abre la cámara/galería nativa y devuelve un File listo para mandar al
 * mismo endpoint de subida que ya usa el input web. Distingue cancelación
 * (el usuario cerró el picker sin elegir nada, no es un error) de fallas
 * reales (permiso denegado, plugin roto, etc.) para que quien llama solo
 * muestre un error cuando de verdad corresponde.
 *
 * Nota: Camera.getPhoto/CameraResultType/CameraSource están marcados
 * deprecated en @capacitor/camera 8.x a favor de takePhoto/pickImages, pero
 * siguen andando en toda la serie 8.x — evaluar la migración si algún día
 * se sube a una versión mayor nueva del plugin.
 */
export async function captureNativePhoto(): Promise<CapturePhotoResult> {
  if (!isNativeApp()) return { status: "error", message: "Cámara no disponible" };
  try {
    const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
    const photo = await Camera.getPhoto({
      quality: 85,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      promptLabelHeader: "Foto del producto",
      promptLabelPhoto: "Elegir de la galería",
      promptLabelPicture: "Tomar foto",
      promptLabelCancel: "Cancelar",
    });
    if (!photo.webPath) return { status: "error", message: "No se pudo leer la foto" };
    const res = await fetch(photo.webPath);
    const blob = await res.blob();
    const ext = photo.format ?? "jpg";
    const file = new File([blob], `producto.${ext}`, { type: blob.type || `image/${ext}` });
    return { status: "captured", file };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // El plugin rechaza con un mensaje que incluye "cancel" cuando el
    // usuario cierra el picker sin elegir nada — eso no es un error real.
    if (/cancel/i.test(message)) return { status: "cancelled" };
    console.error("[native] no se pudo capturar la foto:", err);
    return {
      status: "error",
      message: "No se pudo abrir la cámara. Revisá los permisos de la app en Ajustes.",
    };
  }
}
