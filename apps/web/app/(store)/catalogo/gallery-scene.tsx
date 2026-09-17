"use client";

import {
  Component,
  type ReactNode,
  Suspense,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Image, ScrollControls, Scroll, useScroll, Text, useCursor } from "@react-three/drei";
import { type CatalogProduct, colones } from "./catalog-types";
import { ReserveButton } from "./reserve-button";
import { SiteBackground } from "@/components/site-background";

const SPACING = 5.2; // deja aire entre tarjetas, ahora más anchas (CARD_W)
// Formato horizontal (3:2, igual que las fotos de producto), no vertical.
const CARD_W = 3.9;
const CARD_H = 2.6;
const OLIVE = "#1F2A22";
const CREAM = "#F6F1E7";
// #C89B3C (dorado de marca) sobre crema da ~2.3:1, falla WCAG AA como texto;
// esta versión oscurecida sí pasa, se usa en vez del dorado plano para texto.
const GOLD_TEXT = "#8A6E24";
const SIENNA = "#B5562B";
const STONE = "#6B6459"; // antes #6B6459 (~3.3:1 sobre crema, falla WCAG AA)

/* -------------------------------------------------------------------------- */

/** Plano olivo + nombre — se usa cuando no hay foto o cuando la foto falló al cargar. */
function CardPlaceholder({ name }: { name: string }) {
  return (
    <>
      <mesh>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial color={OLIVE} />
      </mesh>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.28}
        maxWidth={CARD_W * 0.8}
        textAlign="center"
        color={CREAM}
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </>
  );
}

/**
 * Aísla el fallo de UNA foto para que no tire abajo el catálogo entero.
 * Pasa esto con imágenes externas pegadas a mano en el admin: algunos sitios
 * (Freepik, Pinterest, etc.) bloquean el uso de sus fotos en un <canvas> por
 * protección anti-hotlink, y el loader de texturas de Three.js tira error.
 */
class CardImageBoundary extends Component<
  { name: string; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <CardPlaceholder name={this.props.name} />
    ) : (
      this.props.children
    );
  }
}

function Card({
  product,
  x,
  onSelect,
}: {
  product: CatalogProduct;
  x: number;
  onSelect: (p: CatalogProduct) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = hovered ? 1.07 : 1;
    const s = THREE.MathUtils.damp(group.current.scale.x, target, 8, delta);
    group.current.scale.setScalar(s);
    // gira levemente hacia el centro de la escena
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      -x * 0.03,
      6,
      delta,
    );
  });

  const discounted = product.discountPriceCents < product.originalPriceCents;

  return (
    <group
      ref={group}
      position={[x, 0, 0]}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(product);
      }}
    >
      {product.photoUrl ? (
        <CardImageBoundary name={product.name}>
          <Suspense fallback={<CardPlaceholder name={product.name} />}>
            <Image
              url={product.photoUrl}
              scale={[CARD_W, CARD_H]}
              radius={0.12}
              transparent
            />
          </Suspense>
        </CardImageBoundary>
      ) : (
        <CardPlaceholder name={product.name} />
      )}

      <Text
        position={[0, -CARD_H / 2 - 0.35, 0]}
        fontSize={0.26}
        maxWidth={CARD_W * 1.2}
        textAlign="center"
        color={OLIVE}
        anchorX="center"
        anchorY="top"
      >
        {product.name}
      </Text>
      <Text
        position={[0, -CARD_H / 2 - 0.78, 0]}
        fontSize={0.2}
        color={discounted ? SIENNA : GOLD_TEXT}
        anchorX="center"
        anchorY="top"
      >
        {colones(product.discountPriceCents)}
        {product.pickupShortName ? `  ·  ${product.pickupShortName}` : ""}
      </Text>
    </group>
  );
}

function Row({
  products,
  onSelect,
}: {
  products: CatalogProduct[];
  onSelect: (p: CatalogProduct) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const travel = (products.length - 1) * SPACING;

  useFrame((state, delta) => {
    if (!group.current) return;
    // offset 0 -> primera tarjeta centrada bajo la cámara; offset 1 -> la
    // última. (Antes arrancaba desplazado +SPACING y la primera tarjeta
    // quedaba casi entera fuera de cuadro al cargar la página.)
    const targetX = -scroll.offset * travel;
    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      targetX,
      6,
      delta,
    );
    // parallax con el puntero
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      state.pointer.x * 0.12,
      4,
      delta,
    );
    state.camera.position.y = THREE.MathUtils.damp(
      state.camera.position.y,
      state.pointer.y * 0.4,
      4,
      delta,
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      {products.map((p, i) => (
        <Card key={p.id} product={p} x={i * SPACING} onSelect={onSelect} />
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */

class SceneErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function DomFallbackGrid({ products }: { products: CatalogProduct[] }) {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 py-16 sm:grid-cols-3">
      {products.map((p) => (
        <div key={p.id} className="border border-[#ece3d2] p-3">
          <p className="font-serif text-lg text-[#1F2A22]">{p.name}</p>
          <p className="text-sm text-[#8A6E24]">{colones(p.discountPriceCents)}</p>
          {p.pickupShortName && (
            <p className="text-xs text-[#6B6459]">{p.pickupShortName}</p>
          )}
          {p.ripenessNote && (
            <p className="text-xs text-[#8A6E24]">{p.ripenessNote}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function GalleryScene({
  products,
  backgroundUrl,
  feriaName,
  backHref = "/",
  texts,
}: {
  products: CatalogProduct[];
  backgroundUrl: string | null;
  feriaName?: string;
  backHref?: string;
  texts: Record<string, string>;
}) {
  const [selected, setSelected] = useState<CatalogProduct | null>(null);
  const pages = useMemo(() => Math.max(2, products.length * 0.55), [products.length]);

  return (
    <div className="relative min-h-dvh w-full">
      {backgroundUrl && <SiteBackground url={backgroundUrl} />}
      <SceneErrorBoundary fallback={<DomFallbackGrid products={products} />}>
        <div className="h-dvh w-full">
          <Canvas
            camera={{ position: [0, 0, 6], fov: 45 }}
            dpr={[1, 2]}
            gl={{ alpha: true }}
          >
            {!backgroundUrl && <color attach="background" args={[CREAM]} />}
            <Suspense fallback={null}>
              <ScrollControls horizontal pages={pages} damping={0.18}>
                <Scroll>
                  <Row products={products} onSelect={setSelected} />
                </Scroll>
              </ScrollControls>
            </Suspense>
          </Canvas>
        </div>
      </SceneErrorBoundary>

      {/* Instrucciones */}
      <div className="pointer-events-none absolute left-0 top-0 p-6">
        <Link
          href={backHref}
          className={
            "pointer-events-auto inline-flex items-center gap-2 font-serif text-xl uppercase hover:opacity-80 " +
            (backgroundUrl ? "text-[#F6F1E7]" : "text-[#1F2A22]")
          }
        >
          <span aria-hidden>←</span> {feriaName ?? texts["brand.name"]}
        </Link>
        <p
          className={
            "mt-1 max-w-xs text-xs leading-relaxed " +
            (backgroundUrl ? "text-[#D8D3C8]" : "text-[#6B6459]")
          }
        >
          {texts["catalogo.gallery.instructions"]}
        </p>
      </div>

      {/* Panel de detalle */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="absolute inset-x-0 bottom-0 border-t border-[#ece3d2] bg-[#F6F1E7]/95 p-6 backdrop-blur"
          >
          <div className="mx-auto flex max-w-3xl items-start justify-between gap-6">
            <div>
              <h2 className="font-serif text-2xl text-[#1F2A22]">{selected.name}</h2>
              {selected.description && (
                <p className="mt-1 max-w-xl text-sm text-[#6B6459]">
                  {selected.description}
                </p>
              )}
              <p className="mt-2 text-sm text-[#1F2A22]">
                <span className="text-[#8A6E24]">
                  {colones(selected.discountPriceCents)}
                </span>
                {selected.discountPriceCents < selected.originalPriceCents && (
                  <span className="ml-2 text-[#B5562B] line-through">
                    {colones(selected.originalPriceCents)}
                  </span>
                )}
                <span className="ml-3 text-[#6B6459]">
                  {selected.quantity} {texts["catalogo.gallery.disponibles_suffix"]}
                  {selected.pickupShortName ? ` · ${selected.pickupShortName}` : ""}
                </span>
              </p>
              {selected.providerName && (
                <p className="mt-1 text-xs text-[#6B6459]">
                  {texts["catalogo.gallery.cultivado_por_prefix"]} {selected.providerName}
                </p>
              )}
              {(selected.harvestedAt || selected.ripenessNote) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selected.harvestedAt && (
                    <span className="border border-[#ece3d2] bg-white px-2 py-0.5 text-[11px] text-[#6B6459]">
                      {texts["catalogo.gallery.cosechado_el_prefix"]}{" "}
                      {new Date(selected.harvestedAt).toLocaleDateString("es-CR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                  {selected.ripenessNote && (
                    <span className="border border-[#C89B3C]/40 bg-[#C89B3C]/10 px-2 py-0.5 text-[11px] text-[#8A6E24]">
                      {selected.ripenessNote}
                    </span>
                  )}
                </div>
              )}
              <ReserveButton productId={selected.id} texts={texts} />
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-sm text-[#6B6459] underline underline-offset-4"
            >
              {texts["catalogo.gallery.cerrar"]}
            </button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
