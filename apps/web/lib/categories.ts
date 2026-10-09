/**
 * Secciones del catálogo. `category` en Product es opcional: si el admin o el
 * agricultor no la eligió, se adivina por el nombre del producto, así los
 * productos viejos quedan ordenados sin tener que editarlos uno por uno.
 */
export const CATEGORIES = [
  { id: "frutas", label: "Frutas", labelEn: "Fruit", image: "/categorias/frutas.svg" },
  { id: "verduras", label: "Verduras", labelEn: "Vegetables", image: "/categorias/verduras.svg" },
  { id: "lacteos", label: "Lácteos", labelEn: "Dairy", image: "/categorias/lacteos.svg" },
  { id: "reposteria", label: "Repostería", labelEn: "Baked goods", image: "/categorias/reposteria.svg" },
  { id: "manualidades", label: "Manualidades", labelEn: "Crafts", image: "/categorias/manualidades.svg" },
  { id: "otros", label: "Otros", labelEn: "Other", image: "/categorias/otros.svg" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as CategoryId[];

export function isCategoryId(v: unknown): v is CategoryId {
  return typeof v === "string" && (CATEGORY_IDS as string[]).includes(v);
}

// Palabras clave en minúscula y sin tildes.
const KEYWORDS: Record<Exclude<CategoryId, "otros">, string[]> = {
  lacteos: ["queso", "leche", "yogur", "natilla", "mantequilla", "crema", "cuajada", "lacteo", "requeson"],
  reposteria: [
    "pan", "queque", "pastel", "galleta", "reposteria", "bizcocho", "empanada", "cajeta",
    "tamal", "rosquilla", "tosteles", "tosteles", "dulce", "mermelada", "miel", "brownie", "torta",
  ],
  manualidades: [
    "artesania", "manualidad", "tejido", "canasta", "jabon", "vela", "bolso", "collar", "pulsera",
    "madera", "ceramica", "bordado", "macrame",
  ],
  frutas: [
    "fresa", "mora", "banano", "platano", "pina", "mango", "papaya", "sandia", "melon", "naranja",
    "limon", "mandarina", "manzana", "uva", "aguacate", "guayaba", "cas", "maracuya", "granadilla",
    "fruta", "coco", "cacao", "rambutan", "mamon", "carambola", "guanabana", "pitahaya", "frambuesa", "arandano",
  ],
  verduras: [
    "lechuga", "tomate", "zanahoria", "papa", "cebolla", "chile", "pepino", "repollo", "brocoli",
    "coliflor", "ayote", "chayote", "yuca", "camote", "remolacha", "culantro", "apio", "espinaca",
    "vainica", "elote", "maiz", "frijol", "verdura", "hortaliza", "rabano", "ajo", "zucchini", "tiquisque", "nampi",
  ],
};

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function categoryOf(p: { category?: string | null; name: string }): CategoryId {
  if (isCategoryId(p.category)) return p.category;
  const words = normalize(p.name).split(/[^a-z]+/).filter(Boolean);
  // Orden: lo procesado primero ("queque de fresa" es repostería, no fruta).
  for (const cat of ["lacteos", "reposteria", "manualidades", "frutas", "verduras"] as const) {
    if (words.some((w) => KEYWORDS[cat].some((k) => w === k || w === k + "s" || w === k + "es"))) return cat;
  }
  return "otros";
}
