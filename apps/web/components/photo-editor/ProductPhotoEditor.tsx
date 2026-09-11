"use client";

/**
 * Editor de fotos de producto: react-konva sobre un <canvas>.
 *  - Filtros de imagen: brillo, contraste, saturación (Konva.Filters).
 * - Capas de texto: doble clic para editar (overlay <textarea>), arrastrables,
 *   Transformer para rotar.
 * - Badges reutilizables: uno por BadgeTemplate, se agregan como Label+Tag+Text,
 *   arrastrables.
 * - Exporta PNG (blob + dataUrl) vía Stage.toDataURL().
 */

import { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Label, Tag, Transformer } from "react-konva";
import useImage from "use-image";
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
  /** Tamaño máximo del lienzo en px (se ajusta al aspect ratio de la foto). */
  width?: number;
  height?: number;
};

type TextNode = {
  id: string;
  kind: "text";
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
};

type BadgeNode = {
  id: string;
  kind: "badge";
  label: string;
  x: number;
  y: number;
  bg: string;
  color: string;
};

type CanvasNode = TextNode | BadgeNode;

const TEXT_COLORS = ["#1F2A22", "#F6F1E7", "#C89B3C", "#B5562B", "#8B8378"];

let nodeCounter = 0;
const nextId = () => `n${++nodeCounter}-${Date.now().toString(36)}`;

export default function ProductPhotoEditor({
  initialImageUrl,
  badgeTemplates,
  onExport,
  fileName = "producto-editado.png",
  width = 640,
  height = 640,
}: ProductPhotoEditorProps) {
  const [image, imageStatus] = useImage(initialImageUrl, "anonymous");

  const stageRef = useRef<Konva.Stage>(null);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Record<string, Konva.Node | null>>({});

  const [brightness, setBrightness] = useState(0); // -1..1
  const [contrast, setContrast] = useState(0); // -100..100
  const [saturation, setSaturation] = useState(0); // -5..5

  const [canvasSize, setCanvasSize] = useState({ w: width, h: height });
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Ajusta el lienzo al aspect ratio real de la foto (sin pasarse del máximo).
  useEffect(() => {
    if (!image) return;
    const scale = Math.min(width / image.width, height / image.height, 1);
    setCanvasSize({
      w: Math.max(1, Math.round(image.width * scale)),
      h: Math.max(1, Math.round(image.height * scale)),
    });
  }, [image, width, height]);

  // Los filtros de Konva corren sobre un canvas cacheado: hay que re-cachear
  // cada vez que cambian la imagen, el tamaño o los sliders.
  useEffect(() => {
    const node = imageRef.current;
    if (!node || !image) return;
    node.cache();
    node.getLayer()?.batchDraw();
  }, [image, brightness, contrast, saturation, canvasSize]);

  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    const target = selectedId ? nodeRefs.current[selectedId] : null;
    tr.nodes(target ? [target] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, nodes]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const active = document.activeElement;
      const typing = active instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(active.tagName);
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !typing) {
        removeSelected();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  function addText() {
    const id = nextId();
    setNodes((prev) => [
      ...prev,
      {
        id,
        kind: "text",
        text: "Texto",
        x: canvasSize.w / 2 - 40,
        y: canvasSize.h / 2,
        fontSize: 28,
        fill: TEXT_COLORS[0],
      },
    ]);
    setSelectedId(id);
  }

  function addBadge(badge: BadgeTemplate) {
    const id = nextId();
    setNodes((prev) => [
      ...prev,
      { id, kind: "badge", label: badge.label, x: 20, y: 20, bg: badge.bg, color: badge.color },
    ]);
    setSelectedId(id);
  }

  function removeSelected() {
    if (!selectedId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedId));
    setSelectedId(null);
  }

  function setSelectedTextColor(color: string) {
    if (!selectedId) return;
    setNodes((prev) =>
      prev.map((n) => (n.id === selectedId && n.kind === "text" ? { ...n, fill: color } : n)),
    );
  }

  function startEditingText(node: TextNode) {
    setEditingTextId(node.id);
    setEditingValue(node.text);
  }

  function commitEditingText() {
    if (!editingTextId) return;
    const id = editingTextId;
    setNodes((prev) =>
      prev.map((n) => (n.id === id && n.kind === "text" ? { ...n, text: editingValue.trim() || "Texto" } : n)),
    );
    setEditingTextId(null);
  }

  async function handleExport() {
    const stage = stageRef.current;
    if (!stage) return;
    // Saca el recuadro del Transformer antes de exportar, para no hornearlo en el PNG.
    transformerRef.current?.nodes([]);
    transformerRef.current?.getLayer()?.batchDraw();

    const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
    const blob = await (await fetch(dataUrl)).blob();
    setSelectedId(null);
    onExport({ blob, dataUrl, fileName });
  }

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  if (imageStatus === "failed") {
    return (
      <p className="border-l-2 border-sienna bg-sienna/10 px-3 py-2 font-[family-name:var(--font-form)] text-sm text-sienna">
        No se pudo cargar la imagen para editar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 border border-cream-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 font-[family-name:var(--font-form)] text-xs text-stone">
          Brillo
          <input
            type="range"
            min={-1}
            max={1}
            step={0.05}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-2 font-[family-name:var(--font-form)] text-xs text-stone">
          Contraste
          <input
            type="range"
            min={-100}
            max={100}
            step={5}
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-2 font-[family-name:var(--font-form)] text-xs text-stone">
          Saturación
          <input
            type="range"
            min={-5}
            max={5}
            step={0.25}
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
          />
        </label>

        <button
          type="button"
          onClick={addText}
          className="bg-olive px-3 py-1.5 font-[family-name:var(--font-form)] text-xs text-cream"
        >
          + Texto
        </button>

        {badgeTemplates.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => addBadge(b)}
            className="px-3 py-1.5 font-[family-name:var(--font-form)] text-xs"
            style={{ background: b.bg, color: b.color }}
          >
            {b.label}
          </button>
        ))}

        <button
          type="button"
          onClick={handleExport}
          disabled={imageStatus !== "loaded"}
          className="ml-auto bg-gold px-4 py-1.5 font-[family-name:var(--font-form)] text-xs text-olive disabled:opacity-50"
        >
          Exportar PNG
        </button>
      </div>

      {selectedNode?.kind === "text" && (
        <div className="flex items-center gap-2">
          <span className="font-[family-name:var(--font-form)] text-xs text-stone">Color del texto:</span>
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => setSelectedTextColor(c)}
              className="size-5 rounded-full border border-cream-200"
              style={{ background: c }}
            />
          ))}
          <button
            type="button"
            onClick={removeSelected}
            className="ml-2 font-[family-name:var(--font-form)] text-xs text-sienna underline underline-offset-4"
          >
            Quitar
          </button>
        </div>
      )}
      {selectedNode?.kind === "badge" && (
        <button
          type="button"
          onClick={removeSelected}
          className="self-start font-[family-name:var(--font-form)] text-xs text-sienna underline underline-offset-4"
        >
          Quitar badge
        </button>
      )}

      <div className="relative" style={{ width: canvasSize.w, height: canvasSize.h }}>
        {imageStatus === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream/60">
            <p className="font-[family-name:var(--font-form)] text-sm text-stone">Cargando imagen…</p>
          </div>
        )}

        <Stage
          ref={stageRef}
          width={canvasSize.w}
          height={canvasSize.h}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) setSelectedId(null);
          }}
        >
          <Layer>
            {image && (
              <KonvaImage
                ref={imageRef}
                image={image}
                width={canvasSize.w}
                height={canvasSize.h}
                filters={[Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL]}
                {...({ brightness, contrast, hue: 0, saturation, luminance: 0 } as Record<string, number>)}
              />
            )}
          </Layer>

          <Layer>
            {nodes.map((n) =>
              n.kind === "text" ? (
                <KonvaText
                  key={n.id}
                  ref={(node) => {
                    nodeRefs.current[n.id] = node;
                  }}
                  text={n.text}
                  x={n.x}
                  y={n.y}
                  fontSize={n.fontSize}
                  fill={n.fill}
                  visible={editingTextId !== n.id}
                  draggable
                  onClick={() => setSelectedId(n.id)}
                  onTap={() => setSelectedId(n.id)}
                  onDblClick={() => startEditingText(n)}
                  onDblTap={() => startEditingText(n)}
                  onDragEnd={(e) => {
                    const { x, y } = e.target.position();
                    setNodes((prev) => prev.map((m) => (m.id === n.id ? { ...m, x, y } : m)));
                  }}
                />
              ) : (
                <Label
                  key={n.id}
                  ref={(node) => {
                    nodeRefs.current[n.id] = node;
                  }}
                  x={n.x}
                  y={n.y}
                  draggable
                  onClick={() => setSelectedId(n.id)}
                  onTap={() => setSelectedId(n.id)}
                  onDragEnd={(e) => {
                    const { x, y } = e.target.position();
                    setNodes((prev) => prev.map((m) => (m.id === n.id ? { ...m, x, y } : m)));
                  }}
                >
                  <Tag fill={n.bg} cornerRadius={4} />
                  <KonvaText text={n.label} padding={6} fontSize={16} fill={n.color} />
                </Label>
              ),
            )}
            <Transformer ref={transformerRef} rotateEnabled resizeEnabled={false} />
          </Layer>
        </Stage>

        {editingTextId &&
          (() => {
            const editing = nodes.find((n) => n.id === editingTextId);
            if (!editing || editing.kind !== "text") return null;
            return (
              <textarea
                autoFocus
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={commitEditingText}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    commitEditingText();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setEditingTextId(null);
                  }
                }}
                style={{
                  position: "absolute",
                  top: editing.y,
                  left: editing.x,
                  fontSize: editing.fontSize,
                  color: editing.fill,
                  lineHeight: 1.1,
                  border: "1px dashed #C89B3C",
                  background: "rgba(255,255,255,0.85)",
                  padding: 0,
                  margin: 0,
                  minWidth: 60,
                  resize: "none",
                }}
              />
            );
          })()}
      </div>

      <p className="font-[family-name:var(--font-form)] text-xs text-stone">
        Doble clic en un texto para editarlo · arrastrá textos y badges · Supr para quitar el seleccionado.
      </p>
    </div>
  );
}
