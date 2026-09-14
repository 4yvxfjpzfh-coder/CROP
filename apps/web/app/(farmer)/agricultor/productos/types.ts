export type FarmerProduct = {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  quantity: number;
  originalPriceCents: number;
  discountPriceCents: number;
  pickupPointId: string | null;
  pickupShortName: string | null;
  isActive: boolean;
};

export type FarmerPickupPoint = {
  id: string;
  name: string;
  shortName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

export const colones = (cents: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(Math.round(cents) / 100);
