"use client";

import dynamic from "next/dynamic";
import type { CatalogProduct } from "./catalog-types";

// three.js necesita WebGL/window: sin SSR.
const GalleryScene = dynamic(() => import("./gallery-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-dvh items-center justify-center bg-[#F6F1E7]">
      <p className="font-sans text-sm text-[#6B6459]">Cargando galería…</p>
    </div>
  ),
});

export function Catalog3D({ products }: { products: CatalogProduct[] }) {
  return <GalleryScene products={products} />;
}
