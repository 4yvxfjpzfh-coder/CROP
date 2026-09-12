import Link from "next/link";

const steps = [
  {
    n: "1",
    title: "Explorá el catálogo",
    text: "Recorré en 3D el excedente disponible hoy en la feria: fotos, precios y cantidades reales.",
  },
  {
    n: "2",
    title: "Apartá sin pagar en línea",
    text: "Reservás lo que necesitás con un clic. El pago, si aplica, se hace al recoger.",
  },
  {
    n: "3",
    title: "Recogé en la feria",
    text: "Tenés una ventana de tiempo para pasar a buscarlo en el punto de recogida del agricultor.",
  },
];

const products = [
  { name: "Cacao", img: "/demo/cacao.svg" },
  { name: "Café", img: "/demo/cafe.svg" },
  { name: "Piña", img: "/demo/pina.svg" },
];

export default function Home() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-[family-name:var(--font-display)] text-2xl text-olive">
          Crop
        </span>
        <nav className="flex items-center gap-5 font-[family-name:var(--font-form)] text-sm">
          <Link href="/catalogo" className="text-olive hover:text-stone">
            Catálogo
          </Link>
          <Link
            href="/signin"
            className="bg-olive px-4 py-2 text-cream hover:opacity-90"
          >
            Entrar
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 py-10 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-olive md:text-5xl">
              El excedente de la feria, antes de que se pierda.
            </h1>
            <p className="mt-5 font-[family-name:var(--font-form)] text-base leading-relaxed text-stone">
              Cacao, café, banano, piña y más — directo de agricultores de
              Costa Rica. Apartás lo que necesitás en línea y lo recogés en la
              feria del agricultor. Sin pagos en línea.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 font-[family-name:var(--font-form)] text-sm">
              <Link
                href="/catalogo"
                className="bg-olive px-6 py-3 text-cream hover:opacity-90"
              >
                Ver catálogo
              </Link>
              <Link
                href="/signin"
                className="border border-olive px-6 py-3 text-olive hover:bg-cream-200"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
          <div className="w-full max-w-md justify-self-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/demo/hero-cosecha.svg"
              alt="Canasta con cacao, café y piña"
              className="aspect-square w-full object-contain"
            />
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="border-y border-cream-200 bg-white">
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-14 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="font-[family-name:var(--font-display)] text-3xl text-gold">
                  {s.n}
                </span>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl text-olive">
                  {s.title}
                </h2>
                <p className="mt-2 font-[family-name:var(--font-form)] text-sm leading-relaxed text-stone">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Qué vas a encontrar */}
        <section className="mx-auto w-full max-w-5xl px-6 py-14">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-olive">
            Lo que encontrás hoy
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.name}
                href="/catalogo"
                className="group block overflow-hidden border border-cream-200 bg-white"
              >
                <div className="aspect-[3/2] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.img}
                    alt={p.name}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <p className="px-4 py-3 font-[family-name:var(--font-display)] text-base text-olive">
                  {p.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-cream-200">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 font-[family-name:var(--font-form)] text-xs text-stone">
          <span>© {new Date().getFullYear()} Crop — Costa Rica</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-olive">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-olive">
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
