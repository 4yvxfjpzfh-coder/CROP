"use client";

import { useActionState, useState } from "react";
import { enviarLanzamiento, type CorreoState } from "./actions";

const boton = "border border-olive px-4 py-2 font-[family-name:var(--font-form)] text-sm text-olive hover:bg-cream-200 disabled:opacity-50";
const campo = "border border-cream-200 bg-white px-3 py-2 font-[family-name:var(--font-form)] text-sm text-olive outline-none focus:border-olive";

export function LaunchEmailForm({ destinatarios, configurado }: { destinatarios: number; configurado: boolean }) {
  const [state, action, pending] = useActionState<CorreoState | null, FormData>(enviarLanzamiento, null);
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="flex max-w-xl flex-col gap-4">
      {/* 1. Prueba en seco: no manda nada */}
      <form action={action} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="modo" value="seco" />
        <button disabled={pending} className={boton}>Probar en seco</button>
        <span className="font-[family-name:var(--font-form)] text-xs text-stone">Cuenta a cuánta gente le llegaría. No manda nada.</span>
      </form>

      {/* 2. Prueba a una dirección */}
      <form action={action} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="modo" value="prueba" />
        <label className="flex flex-col gap-1">
          <span className="font-[family-name:var(--font-form)] text-xs uppercase tracking-wide text-stone">Mandarme una prueba a</span>
          <input name="prueba" type="email" placeholder="vos@ejemplo.com" className={campo} />
        </label>
        <button disabled={pending || !configurado} className={boton}>Mandar prueba</button>
      </form>

      {/* 3. Envío real, detrás de una confirmación escrita */}
      {!abierto ? (
        <button onClick={() => setAbierto(true)} className={`${boton} self-start border-sienna text-sienna`}>
          Mandar a las {destinatarios} personas…
        </button>
      ) : (
        <form action={action} className="flex flex-col gap-3 border border-sienna/40 bg-cream-200/40 p-4">
          <p className="font-[family-name:var(--font-form)] text-sm text-olive">
            Esto le manda el correo a <strong>{destinatarios}</strong> persona{destinatarios === 1 ? "" : "s"} y
            <strong> no se puede deshacer</strong>. Escribí <code>ENVIAR</code> para confirmar.
          </p>
          <input type="hidden" name="modo" value="real" />
          <div className="flex flex-wrap items-end gap-3">
            <input name="confirmacion" placeholder="ENVIAR" className={campo} autoComplete="off" />
            <button disabled={pending || !configurado} className={`${boton} border-sienna text-sienna`}>
              {pending ? "Mandando…" : "Confirmar envío"}
            </button>
            <button type="button" onClick={() => setAbierto(false)} className={boton}>Cancelar</button>
          </div>
        </form>
      )}

      {state?.error && (
        <p role="alert" className="border-l-4 border-sienna bg-cream-200/60 px-4 py-3 font-[family-name:var(--font-form)] text-sm text-olive">
          {state.error}
        </p>
      )}
      {state?.mensaje && (
        <p role="status" className="border-l-4 border-olive bg-cream-200/60 px-4 py-3 font-[family-name:var(--font-form)] text-sm text-olive">
          {state.mensaje}
        </p>
      )}
    </div>
  );
}
