"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { ProductPhotoEditorProps } from "@/components/photo-editor/ProductPhotoEditor";
import { BADGE_TEMPLATES } from "@/components/photo-editor/badge-templates";

// react-konva necesita `window`: sin SSR y solo al abrir el editor.
const ProductPhotoEditor = dynamic<ProductPhotoEditorProps>(
  () => import("@/components/photo-editor/ProductPhotoEditor"),
  { ssr: false, loading: () => <p className="text-sm text-stone">Cargando editor…</p> },
);

function slugFileName(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "producto"}-editado.png`;
}

export function PhotoEditorLauncher({
  productName,
  sourceUrl,
  onSaved,
}: {
  productName: string;
  sourceUrl: string | null;
  onSaved: (photoUrl: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = Boolean(sourceUrl && sourceUrl.trim());

  async function handleExport(result: {
    blob: Blob;
    dataUrl: string;
    fileName: string;
  }) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", result.blob, result.fileName || slugFileName(productName));
      const res = await fetch("/api/admin/product-photo", { method: "POST", body });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.error ?? `Subida falló (${res.status})`);
      }
      const json = (await res.json()) as { url: string };
      onSaved(json.url);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!canEdit}
        className="font-[family-name:var(--font-form)] text-sm text-olive underline underline-offset-4 disabled:no-underline disabled:text-stone"
      >
        {!canEdit
          ? "Pegá una URL de foto para poder editarla"
          : open
            ? "Ocultar editor de foto"
            : "Abrir editor de foto"}
      </button>

      {error && (
        <p className="mt-1 font-[family-name:var(--font-form)] text-sm text-sienna">
          {error}
        </p>
      )}

      {open && canEdit && (
        <div className="mt-3">
          {uploading && (
            <p className="mb-2 font-[family-name:var(--font-form)] text-sm text-stone">
              Subiendo imagen editada…
            </p>
          )}
          <ProductPhotoEditor
            initialImageUrl={sourceUrl!}
            badgeTemplates={BADGE_TEMPLATES}
            fileName={slugFileName(productName)}
            onExport={handleExport}
          />
        </div>
      )}
    </div>
  );
}
