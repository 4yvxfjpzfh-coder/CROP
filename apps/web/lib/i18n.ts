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
      if (src) out.set(src, r.value);
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
    // createMany + skipDuplicates: dos requests simultáneos pueden traducir lo
    // mismo a la vez; el unique (lang, sourceHash) lo resuelve sin tirar error.
    try {
      await prisma.translation.createMany({
        data: [...fresh].map(([source, value]) => ({ lang, source, sourceHash: hashSource(source), value })),
        skipDuplicates: true,
      });
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

  const system = `You translate interface text for Crop, a Costa Rican farmers market app, from Spanish into ${LANG_NAME[lang]}.
Rules:
- Translate the meaning, not word by word. Use natural, everyday ${LANG_NAME[lang]}.
- Keep the register friendly and plain, as a neighbourhood market would speak.
- Keep placeholders, {braces}, HTML/markdown, emoji, URLs, emails and numbers exactly as they are.
- Keep produce and dish names recognizable; do not invent ingredients.
- Keep it about the same length: these are buttons and labels in a small layout.
- Do not add quotes, notes or explanations.
Reply with one line per item, in the SAME order, each line formatted exactly as: <number>|<translation>`;

  const numbered = texts.map((t, i) => `${i + 1}|${t.replace(/\n/g, "\n")}`).join("\n");

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
      const value = m[2].trim().replace(/\n/g, "\n");
      if (src && value) out.set(src, value);
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
