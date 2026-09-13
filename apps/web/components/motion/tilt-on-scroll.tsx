"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Inclina el elemento en perspectiva 3D a medida que entra/sale de pantalla
 * con el scroll (efecto "3D scroll" típico de sitios modernos).
 */
export function TiltOnScroll({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [12, 0, -12]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-8, 0, 8]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.92]);

  return (
    <div ref={ref} style={{ perspective: 1200 }} className={className}>
      <motion.div style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}
