export type AdminProduct = {
  id: string;
  name: string;
  description: string | null;
  providerName: string | null;
  photoUrl: string | null;
  quantity: number;
  originalPriceCents: number;
  discountPriceCents: number;
  pickupPointId: string | null;
  pickupShortName: string | null;
  isActive: boolean;
};

export type AdminPickupPoint = {
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

/** Haversine en km entre dos coordenadas. */
export function distanceKm(
  a: { latitude: number | null; longitude: number | null },
  b: { lat: number; lng: number },
): number | null {
  if (a.latitude == null || a.longitude == null) return null;
  const R = 6371;
  const dLat = ((b.lat - a.latitude) * Math.PI) / 180;
  const dLng = ((b.lng - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

/** Referencia para el badge de distancia: Catedral Metropolitana, San José centro. */
export const SAN_JOSE_CENTRO = { lat: 9.9333, lng: -84.0793 };
