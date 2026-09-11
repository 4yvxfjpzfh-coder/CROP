"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@crop/prisma";
import { requireAdmin, AdminAccessError, type AdminActor } from "@/lib/admin-guard";
import { recordAdminAudit } from "@/lib/audit";

async function guard(): Promise<{ ok: true; actor: AdminActor } | { ok: false }> {
  try {
    return { ok: true, actor: await requireAdmin("throw") };
  } catch (err) {
    if (err instanceof AdminAccessError) return { ok: false };
    throw err;
  }
}

function refresh() {
  revalidatePath("/admin/catalogo");
  revalidatePath("/catalogo");
}

export async function addToCatalog(formData: FormData): Promise<void> {
  const g = await guard();
  if (!g.ok) return;

  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;

  const agg = await prisma.product.aggregate({ _max: { catalogPosition: true } });
  const nextPosition = (agg._max.catalogPosition ?? 0) + 1;

  const product = await prisma.product.update({
    where: { id: productId },
    data: { catalogPosition: nextPosition },
  });

  await recordAdminAudit({
    actor: g.actor,
    action: "PRODUCT_UPDATE",
    entityType: "Product",
    entityId: productId,
    summary: `Agregó "${product.name}" al catálogo 3D (posición ${nextPosition})`,
  });

  refresh();
}

export async function removeFromCatalog(formData: FormData): Promise<void> {
  const g = await guard();
  if (!g.ok) return;

  const productId = String(formData.get("productId") ?? "");
  if (!productId) return;

  const product = await prisma.product.update({
    where: { id: productId },
    data: { catalogPosition: null },
  });

  await recordAdminAudit({
    actor: g.actor,
    action: "PRODUCT_UPDATE",
    entityType: "Product",
    entityId: productId,
    summary: `Quitó "${product.name}" del catálogo 3D`,
  });

  refresh();
}

async function swap(productId: string, direction: "up" | "down") {
  const g = await guard();
  if (!g.ok) return;

  const current = await prisma.product.findUnique({ where: { id: productId } });
  if (!current || current.catalogPosition === null) return;

  const neighbor = await prisma.product.findFirst({
    where: {
      catalogPosition:
        direction === "up"
          ? { lt: current.catalogPosition }
          : { gt: current.catalogPosition },
    },
    orderBy: { catalogPosition: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor || neighbor.catalogPosition === null) return;

  await prisma.$transaction([
    prisma.product.update({
      where: { id: current.id },
      data: { catalogPosition: neighbor.catalogPosition },
    }),
    prisma.product.update({
      where: { id: neighbor.id },
      data: { catalogPosition: current.catalogPosition },
    }),
  ]);

  await recordAdminAudit({
    actor: g.actor,
    action: "PRODUCT_UPDATE",
    entityType: "Product",
    entityId: productId,
    summary: `Reordenó "${current.name}" en el catálogo 3D`,
  });

  refresh();
}

export async function moveUp(formData: FormData): Promise<void> {
  await swap(String(formData.get("productId") ?? ""), "up");
}

export async function moveDown(formData: FormData): Promise<void> {
  await swap(String(formData.get("productId") ?? ""), "down");
}
