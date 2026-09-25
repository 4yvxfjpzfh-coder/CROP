"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@crop/prisma";
import { requireFarmer, FarmerAccessError } from "@/lib/farmer-guard";
import { nextFarmerSeq, retryOnUniqueConflict } from "@/lib/units";

const productInput = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  photoUrl: z.string().trim().url("URL de foto inválida").optional().or(z.literal("")),
  unit: z.enum(["UNIDAD", "KG"]).optional().default("UNIDAD"),
  quantity: z.coerce.number().finite("Cantidad inválida").min(0, "La cantidad no puede ser negativa"),
  // El formulario pide el precio en colones normales, no en centavos --
  // se convierte a centavos acá antes de guardar.
  priceColones: z.coerce.number().min(0),
  pickupPointId: z.string().trim().min(1, "Selecciona un punto de recogida"),
  isActive: z.coerce.boolean().optional().default(true),
}).refine((data) => data.unit !== "UNIDAD" || Number.isInteger(data.quantity), {
  message: "La cantidad en unidades tiene que ser un número entero",
  path: ["quantity"],
});

export type FarmerProductResult =
  | { ok: true; productId: string }
  | { ok: false; error: string };

function parse(formData: FormData) {
  return productInput.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    photoUrl: formData.get("photoUrl") ?? "",
    unit: formData.get("unit") || "UNIDAD",
    quantity: formData.get("quantity"),
    priceColones: formData.get("discountPriceCents"),
    pickupPointId: formData.get("pickupPointId"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });
}

async function guard() {
  try {
    return { ok: true as const, actor: await requireFarmer("throw") };
  } catch (err) {
    if (err instanceof FarmerAccessError) return { ok: false as const, error: "Acceso denegado" };
    throw err;
  }
}

export async function createOwnProduct(
  _prev: FarmerProductResult | null,
  formData: FormData,
): Promise<FarmerProductResult> {
  const g = await guard();
  if (!g.ok) return g;

  const parsed = parse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;
  const priceCents = Math.round(data.priceColones * 100);

  const product = await retryOnUniqueConflict(() =>
    prisma.$transaction(async (tx) => {
      const farmerSeq = await nextFarmerSeq(tx, g.actor.id);
      return tx.product.create({
        data: {
          name: data.name,
          description: data.description || null,
          farmerId: g.actor.id,
          farmerSeq,
          providerName: g.actor.name,
          photoUrl: data.photoUrl || null,
          unit: data.unit,
          quantity: data.quantity,
          originalPriceCents: priceCents,
          discountPriceCents: priceCents,
          pickupPointId: data.pickupPointId,
          isActive: data.isActive,
        },
      });
    }),
  );

  revalidatePath("/agricultor/productos");
  return { ok: true, productId: product.id };
}

export async function updateOwnProduct(
  _prev: FarmerProductResult | null,
  formData: FormData,
): Promise<FarmerProductResult> {
  const g = await guard();
  if (!g.ok) return g;

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Falta el id del producto" };

  const parsed = parse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;
  const priceCents = Math.round(data.priceColones * 100);

  // updateMany con el dueño en el where: si no es suyo, no actualiza nada
  // (en vez de un update directo que ignoraría la propiedad).
  const result = await prisma.product.updateMany({
    where: { id, farmerId: g.actor.id },
    data: {
      name: data.name,
      description: data.description || null,
      photoUrl: data.photoUrl || null,
      unit: data.unit,
      quantity: data.quantity,
      originalPriceCents: priceCents,
      discountPriceCents: priceCents,
      pickupPointId: data.pickupPointId,
      isActive: data.isActive,
    },
  });

  if (result.count === 0) {
    return { ok: false, error: "Este producto no te pertenece" };
  }

  revalidatePath("/agricultor/productos");
  return { ok: true, productId: id };
}

export async function deleteOwnProduct(
  _prev: FarmerProductResult | null,
  formData: FormData,
): Promise<FarmerProductResult> {
  const g = await guard();
  if (!g.ok) return g;

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Falta el id del producto" };

  const result = await prisma.product.deleteMany({ where: { id, farmerId: g.actor.id } });
  if (result.count === 0) {
    return { ok: false, error: "Este producto no te pertenece" };
  }

  revalidatePath("/agricultor/productos");
  return { ok: true, productId: id };
}
