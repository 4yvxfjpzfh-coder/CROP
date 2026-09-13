"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Microinteracción de botones/links: leve elevación al pasar el mouse,
 * leve compresión al hacer clic. Envolvé el elemento clickeable con esto.
 */
export function Press({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
