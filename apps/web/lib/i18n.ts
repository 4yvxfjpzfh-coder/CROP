import { cache } from "react";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { prisma } from "@crop/prisma";
import { DEFAULT_LANG, LANG_COOKIE, isLang, type Lang } from "./i18n-shared";

export * from "./i18n-shared";

/** Idioma elegido por el visitante. Por request (React cache). */
export const getLang = cache(async (): Promise<Lang> => {
  try {
    const v = (await cookies()).get(LANG_COOKIE)?.value;
    return isLang(v) ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
});

export function hashSource(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

/**
 * Traduce varios textos de una vez.
 *
 * 1. Busca en la memoria (tabla Translation) con una sola consulta.
 * 2. Lo que falte lo manda en UNA sola llamada a la IA y lo guarda.
 * 3. Si no hay API key, si falla o si tarda demasiado, devuelve el original.
 *    La app nunca se queda sin texto ni se cae por una traducción.
 */
export async function translateMany(texts: string[], lang: Lang): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (lang === DEFAULT_LANG) return out;

  // Únicos, sin vacíos y sin cosas que no vale la pena traducir (números, símbolos).
  const unique = [...new Set(texts.map((t) => t?.trim()).filter((t): t is string => !!t && /\p{L}/u.test(t)))];
  if (!unique.length) return out;

  const byHash = new Map(unique.map((t) => [hashSource(t), t]));
  try {
    const rows = await prisma.translation.findMany({
      where: { lang, sourceHash: { in: [...byHash.keys()] } },
      select: { sourceHash: true, value: true },
    });
    for (const r of rows) {
      const src = byHash.get(r.sourceHash);
      // Si en algún momento quedó guardada una "traducción" idéntica al
      // original (ej. una respuesta de la IA mal recortada, o un pedido de
      // varios textos a la vez donde se mezclaron las líneas), confiar en
      // esa fila para siempre dejaba el texto sin traducir de por vida: acá
      // nunca se volvía a pedir porque la memoria ya "tenía" una respuesta.
      // Si coincide con el original, se trata como si no estuviera cacheada
      // y se reintenta abajo.
      if (src && r.value.trim() !== src) out.set(src, r.value);
    }
  } catch (err) {
    console.error("[i18n] no se pudo leer la memoria de traducciones:", err);
    return out; // sin memoria, se muestra el original
  }

  const missing = unique.filter((t) => !out.has(t));
  if (!missing.length) return out;

  const fresh = await machineTranslate(missing, lang);
  for (const [src, value] of fresh) out.set(src, value);

  if (fresh.size) {
    // upsert en vez de createMany+skipDuplicates: si ya había una fila vieja
    // para este (lang, sourceHash) -- ej. una traducción idéntica al
    // original que se vuelve a intentar, ver el filtro de arriba -- hay que
    // PISARLA con la nueva, no dejarla como estaba (skipDuplicates nunca la
    // hubiera actualizado). Dos requests que traducen lo mismo a la vez
    // simplemente se pisan entre sí, sin tirar error.
    try {
      await prisma.$transaction(
        [...fresh].map(([source, value]) =>
          prisma.translation.upsert({
            where: { lang_sourceHash: { lang, sourceHash: hashSource(source) } },
            update: { value },
            create: { lang, source, sourceHash: hashSource(source), value },
          }),
        ),
      );
    } catch (err) {
      console.error("[i18n] no se pudo guardar la traducción:", err);
    }
  }
  return out;
}

/** Traduce un texto suelto. Para listas, usar translateMany (una sola llamada). */
export async function translateOne(text: string | null | undefined, lang: Lang): Promise<string> {
  if (!text || lang === DEFAULT_LANG) return text ?? "";
  const m = await translateMany([text], lang);
  return m.get(text.trim()) ?? text;
}

const LANG_NAME: Record<Lang, string> = { es: "Spanish (Costa Rica)", en: "English" };

/**
 * Traducción automática. Un solo pedido con todos los textos pendientes,
 * numerados, y la respuesta vuelve numerada igual.
 */
async function machineTranslate(texts: string[], lang: Lang): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return out; // sin key: se muestra el original, sin romper nada

  const rules = `Rules:
- Translate the meaning, not word by word. Use natural, everyday ${LANG_NAME[lang]}.
- Keep the register friendly and plain, as a neighbourhood market would speak.
- Keep placeholders, {braces}, HTML/markdown, emoji, URLs, emails and numbers exactly as they are.
- Keep produce and dish names recognizable; do not invent ingredients.
- Keep it about the same length: these are buttons and labels in a small layout.
- If the text is already in ${LANG_NAME[lang]}, or has no translatable words, return it unchanged.`;

  // Un solo texto: se le pide la traducción sola, sin el protocolo de
  // líneas numeradas de abajo. Se agregó porque un texto de un solo
  // elemento (ej. el subtítulo del home) a veces hacía que la IA
  // respondiera con una aclaración o explicación en vez del formato
  // "1|traducción" esperado, y entonces el parseo de abajo no encontraba
  // ninguna línea válida y el texto se quedaba sin traducir para siempre.
  // Acá no hay nada que parsear: toda la respuesta (recortada) ES la
  // traducción.
  if (texts.length === 1) {
    const system = `You translate interface text for Crop, a Costa Rican farmers market app, from Spanish into ${LANG_NAME[lang]}.
${rules}
Reply with ONLY the translation. No quotes, no notes, no explanations, no "Translation:" prefix -- just the translated text, nothing else.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: process.env.AI_MODEL?.trim() || "claude-sonnet-5-5",
          max_tokens: Math.min(8000, 400 + texts[0].length * 2),
          system,
          messages: [{ role: "user", content: texts[0] }],
        }),
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        console.error("[i18n] la IA respondió", res.status, (await res.text()).slice(0, 200));
        return out;
      }
      const data = (await res.json()) as { content: { type: string; text?: string }[] };
      const reply = data.content.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim();
      if (reply) out.set(texts[0], reply);
      else console.error("[i18n] la IA devolvió una respuesta vacía para:", texts[0].slice(0, 80));
    } catch (err) {
      console.error("[i18n] falló la traducción automática:", err);
    }
    return out;
  }

  const system = `You translate interface text for Crop, a Costa Rican farmers market app, from Spanish into ${LANG_NAME[lang]}.
${rules}
- Do not add quotes, notes or explanations.
Reply with one line per item, in the SAME order, each line formatted exactly as: <number>|<translation>`;

  const numbered = texts.map((t, i) => `${i + 1}|${t.replace(/\n/g, " ")}`).join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.AI_MODEL?.trim() || "claude-sonnet-5-5",
        max_tokens: Math.min(8000, 400 + texts.join("").length * 2),
        system,
        messages: [{ role: "user", content: numbered }],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.error("[i18n] la IA respondió", res.status, (await res.text()).slice(0, 200));
      return out;
    }
    const data = (await res.json()) as { content: { type: string; text?: string }[] };
    const reply = data.content.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n");
    for (const line of reply.split("\n")) {
      const m = /^\s*(\d+)\s*\|([\s\S]*)$/.exec(line);
      if (!m) continue;
      const src = texts[Number(m[1]) - 1];
      const value = m[2].trim();
      if (src && value) out.set(src, value);
    }
    if (out.size === 0) {
      console.error("[i18n] no se pudo parsear ninguna línea de la respuesta:", reply.slice(0, 300));
    }
  } catch (err) {
    console.error("[i18n] falló la traducción automática:", err);
  }
  return out;
}

export function isAutoTranslateConfigured() {
  return !!process.env.ANTHROPIC_API_KEY?.trim();
}

/**
 * Traduce ciertos campos de una lista de objetos con UNA sola llamada.
 * Devuelve copias; no toca los originales.
 *
 * Ojo: no pasarle nombres de personas ni de fincas — los nombres propios no
 * se traducen (ver translateProductFields más abajo).
 */
export async function translateFields<T extends Record<string, unknown>>(
  rows: T[],
  fields: (keyof T & string)[],
  lang: Lang,
): Promise<T[]> {
  if (lang === DEFAULT_LANG || rows.length === 0) return rows;
  const values: string[] = [];
  for (const row of rows) {
    for (const f of fields) {
      const v = row[f];
      if (typeof v === "string" && v.trim()) values.push(v);
    }
  }
  const map = await translateMany(values, lang);
  if (map.size === 0) return rows;
  return rows.map((row) => {
    const copy = { ...row };
    for (const f of fields) {
      const v = row[f];
      if (typeof v === "string" && v.trim()) {
        const t = map.get(v.trim());
        if (t) (copy as Record<string, unknown>)[f] = t;
      }
    }
    return copy;
  });
}
