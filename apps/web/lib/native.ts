import { Capacitor } from "@capacitor/core";

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

const REMINDER_HOURS_BEFORE = 2;

export async function schedulePickupReminder(orderId: string, pickupByIso: string) {
  if (!isNativeApp()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const pickupBy = new Date(pickupByIso);
    const reminderAt = new Date(pickupBy.getTime() - REMINDER_HOURS_BEFORE * 3600 * 1000);
    if (reminderAt.getTime() <= Date.now()) return;

    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== "granted") return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationIdFor(orderId),
          title: "Tu apartado vence pronto",
          body: `Tenés hasta las ${pickupBy.toLocaleString("es-CR", { dateStyle: "medium", timeStyle: "short" })} para recogerlo.`,
          schedule: { at: reminderAt },
        },
      ],
    });
  } catch (err) {
    console.error("[native] no se pudo programar el recordatorio:", err);
  }
}

export async function cancelPickupReminder(orderId: string) {
  if (!isNativeApp()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: [{ id: notificationIdFor(orderId) }] });
  } catch (err) {
    console.error("[native] no se pudo cancelar el recordatorio:", err);
  }
}

/**
 * Abre la cámara/galería nativa y devuelve un File listo para mandar al
 * mismo endpoint de subida que ya usa el input web. Devuelve null si no hay
 * cámara nativa disponible (web normal) o si el usuario canceló el picker.
 */
export async function captureNativePhoto(): Promise<File | null> {
  if (!isNativeApp()) return null;
  try {
    const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
    const photo = await Camera.getPhoto({
      quality: 85,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt,
      promptLabelHeader: "Foto del producto",
      promptLabelPhoto: "Elegir de la galería",
      promptLabelPicture: "Tomar foto",
    });
    if (!photo.webPath) return null;
    const res = await fetch(photo.webPath);
    const blob = await res.blob();
    const ext = photo.format ?? "jpg";
    return new File([blob], `producto.${ext}`, { type: blob.type || `image/${ext}` });
  } catch {
    // Picker cancelado por el usuario: no es un error real.
    return null;
  }
}
