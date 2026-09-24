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

export type ShareResult = "shared" | "cancelled" | "copied" | "unavailable";

/**
 * Comparte un producto/enlace. Usa el menú nativo de compartir dentro de la
 * app (@capacitor/share), el Web Share API del navegador en celulares fuera
 * de la app, o copia el link al portapapeles como último recurso (ej.
 * navegador de escritorio, donde no existe menú de compartir del sistema).
 */
export async function shareContent(options: {
  title: string;
  text: string;
  url: string;
}): Promise<ShareResult> {
  if (isNativeApp()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({ ...options, dialogTitle: options.title });
      return "shared";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // El usuario cerró la hoja de compartir sin elegir nada: no es un
      // error, y tampoco corresponde caer al respaldo de portapapeles acá
      // (sorprendería copiar el link sin que el usuario lo haya pedido).
      if (/cancel/i.test(message)) return "cancelled";
      console.error("[native] no se pudo compartir:", err);
      return "unavailable";
    }
  }

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(options);
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
      console.error("[native] no se pudo compartir (web share):", err);
      return "unavailable";
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(options.url);
      return "copied";
    } catch (err) {
      console.error("[native] no se pudo copiar el link:", err);
    }
  }
  return "unavailable";
}

export type HapticStrength = "light" | "medium" | "heavy";

/**
 * Vibración corta al tocar acciones clave (sumar/restar cantidad, apartar,
 * cancelar). No-op fuera de la app nativa — el navegador no tiene una API
 * equivalente confiable, así que no vale la pena un respaldo ahí.
 */
export async function hapticTap(strength: HapticStrength = "light"): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    const style =
      strength === "heavy" ? ImpactStyle.Heavy : strength === "medium" ? ImpactStyle.Medium : ImpactStyle.Light;
    await Haptics.impact({ style });
  } catch (err) {
    console.error("[native] no se pudo vibrar:", err);
  }
}
