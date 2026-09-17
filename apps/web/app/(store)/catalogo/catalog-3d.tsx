"use client";

import dynamic from "next/dynamic";
import type { CatalogProduct } from "./catalog-types";
import { SITE_TEXT_DEFAULTS } from "@/lib/site-text-defaults";

// three.js necesita WebGL/window: sin SSR.
const GalleryScene = dynamic(() => import("./gallery-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-dvh items-center justify-center bg-[#F6F1E7]">
      <p className="font-sans text-sm text-[#6B6459]">{SITE_TEXT_DEFAULTS["catalogo.gallery.loading"]}</p>
    </div>
  ),
});

export function Catalog3D({
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
  return (
    <GalleryScene
      products={products}
      backgroundUrl={backgroundUrl}
      feriaName={feriaName}
      backHref={backHref}
      texts={texts}
    />
  );
}
