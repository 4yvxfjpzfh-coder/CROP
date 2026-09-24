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

// Cargo por servicio: 11% del subtotal del pedido, se cobra en efectivo al
// recoger junto con el producto (Crop no cobra en línea). Es solo
// informativo acá -- no se guarda en Order/OrderItem, se calcula nada más
// al mostrar el total, para no mezclarlo con el precio real de los
// productos (lo que le corresponde al agricultor).
export const SERVICE_FEE_RATE = 0.11;

export function serviceFeeCents(subtotalCents: number): number {
  return Math.round(subtotalCents * SERVICE_FEE_RATE);
}

// Mínimo de compra: el subtotal de productos (sin contar el cargo por
// servicio) tiene que llegar a esto antes de poder mandar el pedido.
export const MIN_ORDER_CENTS = 300000;

export const colones = (cents: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(Math.round(cents) / 100);
