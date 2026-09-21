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
  const [error, setError] = useState<string | null>(null);
  const [native, setNative] = useState(false);

  useEffect(() => {
    setNative(isNativeApp());
  }, []);

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
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
    if (!file) return;
    await uploadFile(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleNativeCapture() {
    const file = await captureNativePhoto();
    if (file) await uploadFile(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {native ? (
          <button
            type="button"
            onClick={handleNativeCapture}
            disabled={uploading}
            className="bg-olive px-3 py-2 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
          >
            {uploading ? "Subiendo…" : "Tomar foto"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-olive px-3 py-2 font-[family-name:var(--font-form)] text-sm text-cream disabled:opacity-60"
            >
              {uploading ? "Subiendo…" : "Subir foto"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={uploading}
            />
          </>
        )}
      </div>
      {error && (
        <p className="font-[family-name:var(--font-form)] text-sm text-sienna">
          {error}
        </p>
      )}
    </div>
  );
}
