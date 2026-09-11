import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin, AdminAccessError } from "@/lib/admin-guard";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);

/**
 * Recibe el PNG que exporta ProductPhotoEditor (onExport -> multipart "file")
 * y devuelve { url } con la imagen ya alojada.
 *
 * Almacenamiento: Vercel Blob. Requiere BLOB_READ_WRITE_TOKEN en el entorno
 * (Vercel lo inyecta al conectar un store Blob al proyecto; en local se saca
 * con `vercel blob store add` o desde el dashboard).
 *
 * Sin token -> responde 200 con un data URL (modo dev) para no bloquear el
 * flujo del panel; NO usar así en producción (infla la fila del producto).
 *
 * El cliente mete la url devuelta en el campo `photoUrl` del formulario; al
 * guardar, createProduct/updateProduct la persisten en Product.photoUrl y
 * registran el AdminAuditLog correspondiente.
 */
export async function POST(request: Request) {
  let actor;
  try {
    actor = await requireAdmin("throw");
  } catch (err) {
    if (err instanceof AdminAccessError) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    throw err;
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen supera 8 MB" }, { status: 413 });
  }
  const contentType = file.type || "image/png";
  if (!ALLOWED.has(contentType)) {
    return NextResponse.json({ error: `Tipo no permitido: ${contentType}` }, { status: 415 });
  }

  const safeName = (file.name || "producto-editado.png").replace(/[^\w.-]+/g, "-");
  const key = `products/${Date.now()}-${safeName}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // ---- modo dev sin almacenamiento configurado ----
    const bytes = Buffer.from(await file.arrayBuffer());
    return NextResponse.json({
      url: `data:${contentType};base64,${bytes.toString("base64")}`,
      warning: "BLOB_READ_WRITE_TOKEN ausente: imagen NO persistida (data URL de dev).",
    });
  }

  const blob = await put(key, file, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });

  return NextResponse.json({ url: blob.url, uploadedBy: actor.email });
}
