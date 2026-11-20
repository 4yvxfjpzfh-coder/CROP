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
