"use client";

import { useEffect, useRef, useState } from "react";
import { captureNativePhoto, isNativeApp } from "@/lib/native";

export function PhotoUpload({
  onPhotoUrl,
}: {
  onPhotoUrl: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [native, setNative] = useState(false);

  // No se puede leer isNativeApp() directo en el render inicial: en el
  // servidor (sin window) siempre da false, así que si el cliente nativo lo
  // usara ya en el primer render, el HTML de hidratación no coincidiría con
  // el del servidor. Se difiere a un efecto, que sí puede correr solo del
  // lado del cliente.
  useEffect(() => {
    setNative(isNativeApp());
  }, []);

  const busy = uploading || capturing;

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/product-photo", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.error ?? `Error ${res.status}`);
      }
      const data = (await res.json()) as { url: string };
      onPhotoUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto");
    } finally {
      setUploading(false);
    }
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    // Se limpia ya mismo (no solo si sale bien) para poder reintentar con el
    // mismo archivo si la subida falla — si no, el navegador no vuelve a
    // disparar "change" al elegir el mismo archivo dos veces seguidas.
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    setError(null);
    await uploadFile(file);
  }

  async function handleNativeCapture() {
    setError(null);
    setCapturing(true);
    try {
      const result = await captureNativePhoto();
      if (result.status === "captured") {
        await uploadFile(result.file);
      } else if (result.status === "error") {
        setError(result.message);
      }
      // "cancelled": el usuario cerró el picker sin elegir nada, no hay
      // nada que mostrar.
    } finally {
      setCapturing(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {native && (
          <button
            type="button"
            onClick={handleNativeCapture}
            disabled={busy}
            className="bg-olive px-3 py-2 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
          >
            {busy ? "Subiendo…" : "Tomar foto"}
          </button>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className={
            native
              ? "border border-cream-200 px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive disabled:opacity-60"
              : "bg-olive px-3 py-2 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
          }
        >
          {native ? "Elegir archivo" : busy ? "Subiendo…" : "Subir foto"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={busy}
        />
      </div>
      {error && (
        <p className="font-[family-name:var(--font-form)] text-sm text-sienna">
          {error}
        </p>
      )}
    </div>
  );
}
