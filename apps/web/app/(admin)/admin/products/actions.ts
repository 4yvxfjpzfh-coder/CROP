"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@crop/prisma";
import { requireAdmin, AdminAccessError } from "@/lib/admin-guard";
import { recordAdminAudit } from "@/lib/audit";
import { nextFarmerSeq, retryOnUniqueConflict } from "@/lib/units";

const productInput = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  providerName: z.string().trim().max(120).optional().or(z.literal("")),
  farmerId: z.string().trim().optional().or(z.literal("")),
  photoUrl: z.string().trim().url("URL de foto inválida").optional().or(z.literal("")),
  harvestedAt: z.string().trim().optional().or(z.literal("")),
  ripenessNote: z.string().trim().max(80).optional().or(z.literal("")),
  unit: z.enum(["UNIDAD", "KG"]).optional().default("UNIDAD"),
  quantity: z.coerce.number().finite("Cantidad inválida").min(0, "La cantidad no puede ser negativa"),
  originalPriceCents: z.coerce.number().int().min(0),
  discountPriceCents: z.coerce.number().int().min(0),
  pickupPointId: z.string().trim().min(1, "Selecciona un punto de recogida"),
  isActive: z.coerce.boolean().optional().default(true),
}).refine((data) => data.unit !== "UNIDAD" || Number.isInteger(data.quantity), {
  message: "La cantidad en unidades tiene que ser un número entero",
  path: ["quantity"],
});

export type ProductActionResult =
  | { ok: true; productId: string }
  | { ok: false; error: string };

function parse(formData: FormData) {
  return productInput.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    providerName: formData.get("providerName") ?? "",
    farmerId: formData.get("farmerId") ?? "",
    photoUrl: formData.get("photoUrl") ?? "",
    harvestedAt: formData.get("harvestedAt") ?? "",
    ripenessNote: formData.get("ripenessNote") ?? "",
    unit: formData.get("unit") || "UNIDAD",
    quantity: formData.get("quantity"),
    originalPriceCents: formData.get("originalPriceCents"),
    discountPriceCents: formData.get("discountPriceCents"),
    pickupPointId: formData.get("pickupPointId"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });
}

async function guard(): Promise<
  { ok: true; actor: Awaited<ReturnType<typeof requireAdmin>> } | { ok: false; error: string }
> {
  try {
    // "throw": una acción de escritura debe fallar sin efectos, no redirigir.
    const actor = await requireAdmin("throw");
    return { ok: true, actor };
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false, error: "Acceso denegado" };
    throw err;
  }
}

export async function createProduct(
  _prev: ProductActionResult | null,
  formData: FormData,
): Promise<ProductActionResult> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = parse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  const pickupPoint = await prisma.pickupPoint.findUnique({
    where: { id: data.pickupPointId },
    select: { id: true, name: true },
  });
  if (!pickupPoint) return { ok: false, error: "El punto de recogida no existe" };

  const farmerId = data.farmerId || null;
  const product = await retryOnUniqueConflict(() =>
    prisma.$transaction(async (tx) => {
      const farmerSeq = farmerId ? await nextFarmerSeq(tx, farmerId) : null;
      return tx.product.create({
        data: {
          name: data.name,
          description: data.description || null,
          providerName: data.providerName || null,
          farmerId,
          farmerSeq,
          photoUrl: data.photoUrl || null,
          harvestedAt: data.harvestedAt ? new Date(data.harvestedAt) : null,
          ripenessNote: data.ripenessNote || null,
          unit: data.unit,
          quantity: data.quantity,
          originalPriceCents: data.originalPriceCents,
          discountPriceCents: data.discountPriceCents,
          pickupPointId: pickupPoint.id,
          isActive: data.isActive,
        },
      });
    }),
  );

  await recordAdminAudit({
    actor: g.actor,
    action: "PRODUCT_CREATE",
    entityType: "Product",
    entityId: product.id,
    summary: `Creó "${product.name}" (${pickupPoint.name})`,
    metadata: { quantity: data.quantity, discountPriceCents: data.discountPriceCents },
  });

  revalidatePath("/admin/products");
  return { ok: true, productId: product.id };
}

export async function updateProduct(
  _prev: ProductActionResult | null,
  formData: FormData,
): Promise<ProductActionResult> {
  const g = await guard();
  if (!g.ok) return g;

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Falta el id del producto" };

  const parsed = parse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "El producto no existe" };

  const farmerId = data.farmerId || null;
  const product = await retryOnUniqueConflict(() =>
    prisma.$transaction(async (tx) => {
      let farmerSeq = existing.farmerSeq;
      if (farmerId !== existing.farmerId) {
        farmerSeq = farmerId ? await nextFarmerSeq(tx, farmerId) : null;
      }
      return tx.product.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description || null,
          providerName: data.providerName || null,
          farmerId,
          farmerSeq,
          photoUrl: data.photoUrl || null,
          harvestedAt: data.harvestedAt ? new Date(data.harvestedAt) : null,
          ripenessNote: data.ripenessNote || null,
          unit: data.unit,
          quantity: data.quantity,
          originalPriceCents: data.originalPriceCents,
          discountPriceCents: data.discountPriceCents,
          pickupPointId: data.pickupPointId,
          isActive: data.isActive,
        },
      });
    }),
  );

  await recordAdminAudit({
    actor: g.actor,
    action: "PRODUCT_UPDATE",
    entityType: "Product",
    entityId: product.id,
    summary: `Editó "${product.name}"`,
    metadata: {
      before: { quantity: existing.quantity, discountPriceCents: existing.discountPriceCents },
      after: { quantity: data.quantity, discountPriceCents: data.discountPriceCents },
    },
  });

  revalidatePath("/admin/products");
  return { ok: true, productId: product.id };
}

export async function deleteProduct(
  _prev: ProductActionResult | null,
  formData: FormData,
): Promise<ProductActionResult> {
  const g = await guard();
  if (!g.ok) return g;

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Falta el id del producto" };

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "El producto no existe" };

  await prisma.product.delete({ where: { id } });

  await recordAdminAudit({
    actor: g.actor,
    action: "PRODUCT_DELETE",
    entityType: "Product",
    entityId: id,
    summary: `Eliminó "${existing.name}"`,
  });

  revalidatePath("/admin/products");
  return { ok: true, productId: id };
}
