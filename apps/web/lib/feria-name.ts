// Renombre de ferias pedido por el dueño. El nombre real sigue guardado en
// la base (no hay pantalla de admin para editar el nombre de una feria y no
// se tocó la base); acá se mapea al nombre nuevo solo al mostrarlo. Si algún
// día se renombra en la base, basta con sacar la entrada de este mapa.
const FERIA_RENAMES: Record<string, string> = {
  "Santa Ana": "Mercado de Abastos Solidario de Santa Ana",
  "Feria del Agricultor de Santa Ana": "Mercado de Abastos Solidario de Santa Ana",
};

export function displayFeriaName(raw: string | null | undefined): string {
  if (!raw) return raw ?? "";
  return FERIA_RENAMES[raw.trim()] ?? raw;
}

// Rebranding en capa de presentación: lo que el cliente llamaba "feria del
// agricultor" / "farmers market" ahora se muestra como "Mercado de Abastos
// Solidario". Igual que displayFeriaName, corrige al vuelo los textos que ya
// están guardados en la base (ej. el titular del home "Costa Rican Farmers
// Market" que escribió el admin) sin tener que editarlos a mano. Conviene
// aplicarlo DESPUÉS de traducir, así el nombre propio en español queda igual
// en cualquier idioma. El orden importa: primero la variante con artículo
// ("la feria...") para que no quede "la Mercado".
const MARKET_RENAMES: Array<[RegExp, string]> = [
  [/\blas?\s+ferias?\s+del\s+agricultor\b/gi, "el Mercado de Abastos Solidario"],
  [/\bferias?\s+del\s+agricultor\b/gi, "Mercado de Abastos Solidario"],
  [/\bcosta\s+rican\s+farmers['’]?\s*markets?\b/gi, "Mercado de Abastos Solidario"],
  [/\bfarmers['’]?\s*markets?\b/gi, "Mercado de Abastos Solidario"],
];

export function renameMarket(text: string | null | undefined): string {
  if (!text) return text ?? "";
  let out = text;
  for (const [re, replacement] of MARKET_RENAMES) out = out.replace(re, replacement);
  return out;
}
