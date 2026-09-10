import { NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin-guard";

export const runtime = "nodejs";

/**
 * Recibe el PNG editado por ProductPhotoEditor (onExport) y devuelve { url }.
 *
 * TODO(backend): conectar a almacenamiento real. Hoy NO persiste nada.
 *   1. Guardar el archivo en un bucket (S3 / Vercel Blob / Supabase Storage /
 *      Cloudflare R2) y obtener su URL pública.
 *   2. Devolver { url } con esa URL.
 *   3. El cliente (photo-editor-launcher.tsx) ya mete esa url en el campo
 *      `photoUrl` del formulario; al guardar el producto, la server action
 *      `updateProduct`/`createProduct` la escribe en `Product.photoUrl` (Prisma).
 *   4. Opcional: aceptar `?productId=` y hacer el update de Prisma aquí mismo,
 *      registrando un AdminAuditLog PRODUCT_UPDATE.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin("throw");
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

  // ---- STUB: sin almacenamiento todavía ----------------------------------
  // Devuelve un data URL para que el flujo del panel funcione end-to-end en
  // desarrollo. NO usar en producción: infla la fila del producto.
  const bytes = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type || "image/png"};base64,${bytes.toString("base64")}`;

  return NextResponse.json({
    url: dataUrl,
    warning:
      "STUB: imagen no persistida. Conectar almacenamiento en apps/web/app/api/admin/product-photo/route.ts",
  });
}
