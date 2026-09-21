export type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  providerName: string | null;
  photoUrl: string | null;
  harvestedAt: string | null;
  ripenessNote: string | null;
  unit: "UNIDAD" | "KG";
  quantity: number;
  originalPriceCents: number;
  discountPriceCents: number;
  pickupShortName: string | null;
  // "Manzana — Juan García #1", null si no hay agricultor vinculado con código.
  code: string | null;
};

// Tope por producto dentro de un mismo pedido: 10 unidades o 10 kg. Se
// valida acá (UI) y de nuevo en el server action — la UI solo evita que se
// intente mandar algo que el server va a rechazar igual.
export const MAX_QUANTITY_PER_ITEM = 10;

export const colones = (cents: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(Math.round(cents) / 100);
