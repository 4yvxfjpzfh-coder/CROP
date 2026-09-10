"use client";

/* =============================================================================
 *  ⚠️  PLACEHOLDER — REEMPLAZAR CON TU COMPONENTE REAL
 * =============================================================================
 *  El mensaje que enviaste terminaba con:
 *      [PEGA AQUÍ EL CONTENIDO COMPLETO DE ProductPhotoEditor.tsx]
 *  ...pero el archivo no venía adjunto, así que este es un stub tipado con la
 *  MISMA firma de props que describiste. Cuando pegues tu componente real
 *  (react-konva + konva + use-image: sube foto, filtros brillo/contraste/
 *  saturación, capas de texto, badges tipo "30% OFF" con plantillas, export PNG),
 *  sobreescribe este archivo conservando el contrato de `ProductPhotoEditorProps`
 *  para que la integración (photo-editor-launcher.tsx) siga compilando.
 *
 *  Dependencias ya instaladas: react-konva, konva, use-image.
 * ========================================================================== */

export type BadgeTemplate = {
  id: string;
  label: string; // "30% OFF", "Producto del día"
  variant?: "discount" | "highlight" | "neutral";
};

export const DEFAULT_BADGE_TEMPLATES: BadgeTemplate[] = [
  { id: "discount-30", label: "30% OFF", variant: "discount" },
  { id: "discount-50", label: "50% OFF", variant: "discount" },
  { id: "product-of-day", label: "Producto del día", variant: "highlight" },
  { id: "fresh-today", label: "Cosechado hoy", variant: "highlight" },
];

export type ProductPhotoEditorProps = {
  /** Nombre del producto, para títulos y nombre de archivo al exportar. */
  productName: string;
  /** Foto de partida (si el producto ya tiene una). El usuario puede subir otra. */
  initialImageUrl?: string | null;
  /** Plantillas de badge reutilizables. */
  badgeTemplates?: BadgeTemplate[];
  /** Se llama con el PNG final. `blob` para subir, `dataUrl` para previsualizar. */
  onExport: (result: { blob: Blob; dataUrl: string; fileName: string }) => void;
  /** Cerrar el editor sin exportar. */
  onCancel?: () => void;
};

export default function ProductPhotoEditor({
  productName,
  initialImageUrl,
  onCancel,
}: ProductPhotoEditorProps) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-3 border border-cream-200 bg-cream p-8 text-center">
      <p className="font-[family-name:var(--font-display)] text-lg text-olive">
        Editor de fotos pendiente
      </p>
      <p className="max-w-sm font-[family-name:var(--font-form)] text-sm text-stone">
        Pegá el contenido real de <code>ProductPhotoEditor.tsx</code> en{" "}
        <code>apps/web/components/photo-editor/</code>. Este stub mantiene la
        firma de props para {productName}
        {initialImageUrl ? " (con foto de partida)" : ""}.
      </p>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="font-[family-name:var(--font-form)] text-sm text-stone underline underline-offset-4"
        >
          Cerrar
        </button>
      )}
    </div>
  );
}
