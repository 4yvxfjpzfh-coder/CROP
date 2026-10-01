"use client";

export function RefreshButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="border border-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-olive hover:bg-cream-200"
    >
      Actualizar
    </button>
  );
}
