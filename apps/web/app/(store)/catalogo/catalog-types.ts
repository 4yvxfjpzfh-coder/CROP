export type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  quantity: number;
  originalPriceCents: number;
  discountPriceCents: number;
  pickupShortName: string | null;
};

export const colones = (cents: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(Math.round(cents) / 100);
