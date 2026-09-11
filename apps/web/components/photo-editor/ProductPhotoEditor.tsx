"use client";

/* =============================================================================
 *  ⚠️  PLACEHOLDER — el componente real todavía NO está en disco.
 * =============================================================================
 *  Dijiste que lo pegaste acá, pero `git status` sigue limpio y este archivo no
 *  cambió. Cuando pegues tu componente real (react-konva Stage/Layer/Image/Text/
 *  Transformer + use-image, export vía stage.toDataURL() / stage.toBlob()),
 *  sobreescribí SOLO este archivo: la firma de props de abajo ya coincide con la
 *  que describiste, así que photo-editor-launcher.tsx y /api/admin/product-photo
 *  seguirán funcionando sin cambios.
 *
 *  Deps instaladas: react-konva, konva, use-image.
 * ========================================================================== */

import type { BadgeTemplate } from "./badge-templates";

export type { BadgeTemplate };

export type ProductPhotoEditorProps = {
  /** Imagen de partida. Requerida: el editor siempre arranca desde una foto. */
  initialImageUrl: string;
  /** Plantillas de badge disponibles en la barra de herramientas. */
  badgeTemplates: BadgeTemplate[];
  /** Recibe el PNG final. `blob` para subir, `dataUrl` para previsualizar. */
  onExport: (result: { blob: Blob; dataUrl: string; fileName: string }) => void;
  /** Nombre de archivo sugerido al exportar. */
  fileName?: string;
  /** Tamaño del lienzo en px. */
  width?: number;
  height?: number;
};

export default function ProductPhotoEditor({
  initialImageUrl,
  badgeTemplates,
  width = 640,
  height = 640,
}: ProductPhotoEditorProps) {
  return (
    <div
      style={{ maxWidth: width, minHeight: Math.min(height, 320) }}
      className="flex flex-col items-center justify-center gap-3 border border-cream-200 bg-cream p-8 text-center"
    >
      <p className="font-[family-name:var(--font-display)] text-lg text-olive">
        Editor de fotos pendiente
      </p>
      <p className="max-w-sm font-[family-name:var(--font-form)] text-sm text-stone">
        Pegá el contenido real de <code>ProductPhotoEditor.tsx</code>. Este stub
        ya recibe la foto de partida y {badgeTemplates.length} plantillas de badge.
      </p>
      {initialImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={initialImageUrl}
          alt="Foto de partida"
          className="max-h-40 w-auto border border-cream-200 object-contain"
        />
      ) : null}
    </div>
  );
}
