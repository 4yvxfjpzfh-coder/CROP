import Link from "next/link";
import { getHomeBackgroundUrl } from "@/lib/site-settings";
import { Reveal } from "@/components/motion/reveal";
import { Press } from "@/components/motion/press";
import { FruitCarousel } from "@/components/fruit-carousel";
import { TiltOnScroll } from "@/components/motion/tilt-on-scroll";
import { ParallaxDrift } from "@/components/motion/parallax-drift";
import { FlipReveal } from "@/components/motion/flip-reveal";
import { SiteBackground } from "@/components/site-background";

export const dynamic = "force-dynamic";

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

const fruits = [
  {
    name: "Cacao",
    img: "/demo/cacao.svg",
    blurb: "Cacao molido, recién procesado en la finca — excedente de la última recolección.",
  },
  {
    name: "Café",
    img: "/demo/cafe.svg",
    blurb: "Café de altura, lotes pequeños que sobraron del último despacho.",
  },
  {
    name: "Banano",
    img: "/demo/banano.svg",
    blurb: "Banano maduro, listo para consumir hoy — precio de excedente.",
  },
  {
    name: "Piña",
    img: "/demo/pina.svg",
    blurb: "Piñas extra dulces de la cosecha de esta semana.",
  },
];

export default async function Home() {
  const backgroundUrl = await getHomeBackgroundUrl();

  return (
    <div className="min-h-dvh text-paper">
      <SiteBackground url={backgroundUrl} />
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-[family-name:var(--font-display)] text-2xl uppercase text-paper">
          Crop
        </span>
        <nav className="flex items-center gap-5 font-[family-name:var(--font-form)] text-sm">
          <Link href="/catalogo" className="text-metal hover:text-paper">
            Catálogo
          </Link>
          <Press>
            <Link
              href="/signin"
              className="block bg-emerald px-4 py-2 text-paper hover:opacity-90"
            >
              Entrar
            </Link>
          </Press>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 py-10 md:grid-cols-2 md:py-20">
          <div>
            <Reveal>
              <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-paper md:text-5xl">
                El excedente de la feria, antes de que se pierda.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 font-[family-name:var(--font-form)] text-base leading-relaxed text-metal">
                Cacao, café, banano, piña y más — directo de agricultores de
                Costa Rica. Apartás lo que necesitás en línea y lo recogés en
                la feria del agricultor. Sin pagos en línea.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap gap-4 font-[family-name:var(--font-form)] text-sm">
                <Press>
                  <Link
                    href="/catalogo"
                    className="block bg-emerald px-6 py-3 text-paper hover:opacity-90"
                  >
                    Ver catálogo
                  </Link>
                </Press>
                <Press>
                  <Link
                    href="/signin"
                    className="block border border-metal px-6 py-3 text-paper hover:bg-ink-200"
                  >
                    Crear cuenta
                  </Link>
                </Press>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15} y={24} className="w-full max-w-md justify-self-center">
            <TiltOnScroll>
              <div className="rounded-sm bg-ink-200 p-6 shadow-[0_0_60px_-15px_rgba(45,122,74,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/demo/hero-cosecha.svg"
                  alt="Canasta con cacao, café y piña"
                  className="aspect-square w-full object-contain"
                />
              </div>
            </TiltOnScroll>
          </Reveal>
        </section>

        {/* Cómo funciona — variante B de scroll-3D: flip en eje Y */}
        <section className="border-y border-ink-200 bg-ink-200/40">
          <FlipReveal className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-14 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <span className="font-[family-name:var(--font-display)] text-3xl text-emerald">
                  {s.n}
                </span>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl text-paper">
                  {s.title}
                </h2>
                <p className="mt-2 font-[family-name:var(--font-form)] text-sm leading-relaxed text-metal">
                  {s.text}
                </p>
              </Reveal>
            ))}
          </FlipReveal>
        </section>

        {/* Qué vas a encontrar — variante C de scroll-3D: parallax vertical */}
        <section className="mx-auto w-full max-w-5xl px-6 py-14">
          <Reveal className="text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-paper">
              Lo que encontrás hoy
            </h2>
            <p className="mt-1 font-[family-name:var(--font-form)] text-sm text-metal">
              Recorré las frutas con las flechas.
            </p>
          </Reveal>
          <ParallaxDrift className="mt-8">
            <FruitCarousel items={fruits} />
          </ParallaxDrift>
        </section>
      </main>

      <footer className="border-t border-ink-200">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 font-[family-name:var(--font-form)] text-xs text-metal">
          <span>© {new Date().getFullYear()} <span className="uppercase">Crop</span> — Costa Rica</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-paper">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-paper">
              Términos
            </Link>
            <Link href="/reembolsos" className="hover:text-paper">
              Cancelaciones
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
