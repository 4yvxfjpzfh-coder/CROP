/**
 * Plantillas de badge reutilizables para ProductPhotoEditor.
 * Colores alineados con la identidad del panel (sienna para descuentos,
 * dorado y olivo para destacados).
 */
export type BadgeTemplate = {
  id: string;
  label: string;
  bg: string;
  color: string;
};

export const BADGE_TEMPLATES: BadgeTemplate[] = [
  { id: "off-30", label: "30% OFF", bg: "#B5562B", color: "#F6F1E7" },
  { id: "off-50", label: "50% OFF", bg: "#B5562B", color: "#F6F1E7" },
  { id: "product-of-day", label: "Producto del día", bg: "#C89B3C", color: "#1F2A22" },
  { id: "harvested-today", label: "Cosechado hoy", bg: "#1F2A22", color: "#F6F1E7" },
  { id: "last-units", label: "Últimas unidades", bg: "#B5562B", color: "#F6F1E7" },
];
