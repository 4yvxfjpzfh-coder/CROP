"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-cream hover:opacity-90"
    >
      {label}
    </button>
  );
}
