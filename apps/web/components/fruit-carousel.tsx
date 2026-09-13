"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export type FruitSlide = {
  name: string;
  img: string;
  blurb: string;
};

/**
 * Galería tipo carrusel: una imagen grande por vez, flechas para avanzar/
 * retroceder, y la información (nombre + descripción) cambia junto con la
 * imagen, como una presentación paso a paso.
 */
export function FruitCarousel({ items }: { items: FruitSlide[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  function go(delta: number) {
    setDirection(delta);
    setIndex((i) => (i + delta + items.length) % items.length);
  }

  const current = items[index];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="relative aspect-[3/2] w-full overflow-hidden border border-cream-200 bg-white">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={current.name}
            src={current.img}
            alt={current.name}
            custom={direction}
            initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="absolute inset-0 size-full object-cover"
          />
        </AnimatePresence>

        <button
          type="button"
          aria-label="Anterior"
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center bg-cream/90 text-olive shadow hover:bg-cream"
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Siguiente"
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center bg-cream/90 text-olive shadow hover:bg-cream"
        >
          →
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mt-5 text-center"
        >
          <h3 className="font-[family-name:var(--font-display)] text-2xl text-olive">
            {current.name}
          </h3>
          <p className="mx-auto mt-1 max-w-md font-[family-name:var(--font-form)] text-sm text-stone">
            {current.blurb}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex gap-2">
          {items.map((item, i) => (
            <button
              key={item.name}
              type="button"
              aria-label={`Ir a ${item.name}`}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={
                i === index
                  ? "size-2 rounded-full bg-olive"
                  : "size-2 rounded-full bg-cream-200"
              }
            />
          ))}
        </div>
        <span className="font-[family-name:var(--font-form)] text-xs text-stone">
          {index + 1} / {items.length}
        </span>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/catalogo"
          className="inline-block bg-olive px-6 py-3 font-[family-name:var(--font-form)] text-sm text-cream hover:opacity-90"
        >
          Ver en el catálogo
        </Link>
      </div>
    </div>
  );
}
