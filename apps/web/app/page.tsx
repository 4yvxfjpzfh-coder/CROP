import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center gap-6 px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
        Crop
      </h1>
      <p className="text-sm leading-relaxed text-neutral-600">
        Rescate de comida y excedente agrícola —cacao, café, banano, piña y más—.
        Apartás lo que necesitás y lo recogés en la feria del agricultor. Sin
        pagos en línea.
      </p>
      <div className="flex gap-4 text-sm">
        <Link
          href="/catalogo"
          className="bg-neutral-900 px-4 py-2 text-white hover:opacity-90"
        >
          Ver catálogo
        </Link>
        <Link
          href="/signin"
          className="px-4 py-2 text-neutral-700 underline underline-offset-4"
        >
          Entrar
        </Link>
      </div>
    </main>
  );
}
