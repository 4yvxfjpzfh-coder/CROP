export type ProductUnit = "UNIDAD" | "KG";

/** Paso del selector de cantidad: kilos se venden fraccionados, unidades no. */
export const QUANTITY_STEP: Record<ProductUnit, number> = {
  UNIDAD: 1,
  KG: 0.25,
};

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
