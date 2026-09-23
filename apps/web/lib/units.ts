import type { Prisma } from "@crop/prisma";

export type ProductUnit = "UNIDAD" | "KG";

/** Paso del selector de cantidad: kilos se venden fraccionados, unidades no. */
export const QUANTITY_STEP: Record<ProductUnit, number> = {
  UNIDAD: 1,
  KG: 0.25,
};

/** Forma corta para etiquetas chicas (el stepper del carrito): "kg" o "u". */
export function unitSuffix(unit: ProductUnit): string {
  return unit === "KG" ? "kg" : "u";
}

export function formatQuantity(quantity: number, unit: ProductUnit): string {
  if (unit === "KG") {
    const rounded = Math.round(quantity * 100) / 100;
    return `${rounded} kg`;
  }
  const rounded = Math.round(quantity);
  return `${rounded} ${rounded === 1 ? "unidad" : "unidades"}`;
}

/** Precio unitario mostrado junto al nombre del producto: "₡500" o "₡500 / kg". */
export function formatUnitPrice(colones: string, unit: ProductUnit): string {
  return unit === "KG" ? `${colones} / kg` : colones;
}

/**
 * Siguiente número consecutivo para un agricultor (1, 2, 3...). Usa el MAX
 * actual + 1 en vez de contar filas: si se borra un producto de en medio
 * (ej. el #2 de 3), el próximo sigue siendo #4, no un #3 repetido que
 * confundiría con el que ya existe. Tiene que llamarse dentro de un
 * prisma.$transaction para que la lectura y el create/update que le sigue
 * queden juntos.
 */
export async function nextFarmerSeq(
  tx: Prisma.TransactionClient,
  farmerId: string,
): Promise<number> {
  const { _max } = await tx.product.aggregate({
    where: { farmerId },
    _max: { farmerSeq: true },
  });
  return (_max.farmerSeq ?? 0) + 1;
}

/**
 * El MAX+1 de arriba no es atómico: dos creaciones al mismo tiempo para el
 * mismo agricultor podrían leer el mismo máximo y calcular el mismo
 * farmerSeq. La restricción única (farmerId, farmerSeq) en la base evita que
 * eso quede guardado en silencio -- la segunda tira P2002. Esto envuelve el
 * intento entero (lectura + create/update, ambos dentro del mismo
 * $transaction) y lo reintenta con un farmerSeq nuevo si eso pasa. En la
 * práctica es rarísimo (dos altas del mismo agricultor en el mismo
 * instante), así que 3 intentos sobran.
 */
export async function retryOnUniqueConflict<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isUniqueConflict =
        typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === "P2002";
      if (!isUniqueConflict || attempt === attempts) throw err;
    }
  }
  // Inalcanzable: el loop siempre retorna o tira en el último intento.
  throw new Error("retryOnUniqueConflict: no debería llegar acá");
}

/**
 * Código corto para identificar de qué producto y agricultor se trata,
 * ej. "Manzana — Juan García #1". null si el producto no tiene agricultor
 * vinculado (nada que numerar todavía).
 */
export function productCode({
  name,
  farmerName,
  farmerSeq,
}: {
  name: string;
  farmerName: string | null;
  farmerSeq: number | null;
}): string | null {
  if (!farmerName || !farmerSeq) return null;
  return `${name} — ${farmerName} #${farmerSeq}`;
}
