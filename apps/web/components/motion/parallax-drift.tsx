"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Variante 2 de scroll-3D: en vez de inclinar (rotar), el elemento se
 * desplaza verticalmente más lento que el scroll (parallax clásico) y gira
 * levemente sobre su propio eje — sensación de "flotar" más que de "caer".
 */
export function ParallaxDrift({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-3, 0, 3]);

  return (
    <div ref={ref}>
      <motion.div className={className} style={{ y, rotate }}>
        {children}
      </motion.div>
    </div>
  );
}
