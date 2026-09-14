"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Variante 3 de scroll-3D: el elemento entra "girando" en el eje Y, como si
 * se volteara una tarjeta hacia la pantalla, y queda plano al llegar al
 * centro. Efecto más dramático que las otras dos variantes.
 */
export function FlipReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const rotateY = useTransform(scrollYProgress, [0, 1], [70, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0.6, 1]);

  return (
    <div ref={ref} style={{ perspective: 1400 }}>
      <motion.div
        className={className}
        style={{ rotateY, opacity, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
