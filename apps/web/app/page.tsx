import Link from "next/link";
import { auth } from "@/auth";
import { getSiteSettings, getHomeFruits } from "@/lib/site-settings";
import { getSiteTexts } from "@/lib/site-text";
import { Reveal } from "@/components/motion/reveal";
import { Press } from "@/components/motion/press";
import { FruitCarousel, type FruitSlide } from "@/components/fruit-carousel";
import { TiltOnScroll } from "@/components/motion/tilt-on-scroll";
import { ParallaxDrift } from "@/components/motion/parallax-drift";
import { FlipReveal } from "@/components/motion/flip-reveal";
import { SiteBackground } from "@/components/site-background";

export const dynamic = "force-dynamic";

const DEFAULT_HEADLINE = "El excedente de la feria, antes de que se pierda.";
const DEFAULT_SUBTEXT =
  "Cacao, café, banano, piña y más — directo de agricultores de Costa Rica. Apartás lo que necesitás en línea y lo recogés en la feria del agricultor. Sin pagos en línea.";

const DEFAULT_FRUITS: FruitSlide[] = [
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
  const [session, settings, dbFruits, t] = await Promise.all([
    auth(),
    getSiteSettings(),
    getHomeFruits(),
    getSiteTexts(),
  ]);

  const headline = settings.homeHeadline || DEFAULT_HEADLINE;
  const subtext = settings.homeSubtext || DEFAULT_SUBTEXT;
  const fruits: FruitSlide[] =
    dbFruits.length > 0
      ? dbFruits.map((f) => ({ name: f.name, img: f.imageUrl, blurb: f.blurb }))
      : DEFAULT_FRUITS;

  const steps = [
    { n: "1", title: t["home.how.step1.title"], text: t["home.how.step1.text"] },
    { n: "2", title: t["home.how.step2.title"], text: t["home.how.step2.text"] },
    { n: "3", title: t["home.how.step3.title"], text: t["home.how.step3.text"] },
  ];

  return (
    <div className="min-h-dvh text-paper">
      <SiteBackground url={settings.homeBackgroundUrl} />
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="flex flex-col leading-tight">
          <span className="font-[family-name:var(--font-display)] text-2xl uppercase text-paper">
            {t["brand.name"]}
          </span>
          {t["brand.tagline"] && (
            <span className="font-[family-name:var(--font-form)] text-[10px] uppercase tracking-wide text-metal">
              {t["brand.tagline"]}
            </span>
          )}
        </span>
        <nav className="flex items-center gap-5 font-[family-name:var(--font-form)] text-sm">
          <Link href="/catalogo" className="text-metal hover:text-paper">
            {t["nav.catalogo"]}
          </Link>
          {session?.user ? (
            <>
              <Link href="/mis-apartados" className="text-metal hover:text-paper">
                {t["nav.mis_apartados"]}
              </Link>
              <Press>
                <Link
                  href="/perfil"
                  className="block bg-emerald px-4 py-2 text-paper hover:opacity-90"
                >
                  {t["nav.mi_perfil"]}
                </Link>
              </Press>
            </>
          ) : (
            <Press>
              <Link
                href="/signin"
                className="block bg-emerald px-4 py-2 text-paper hover:opacity-90"
              >
                {t["nav.entrar"]}
              </Link>
            </Press>
          )}
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 py-10 md:grid-cols-2 md:py-20">
          <div>
            <Reveal>
              <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-paper md:text-5xl">
                {headline}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 font-[family-name:var(--font-form)] text-base leading-relaxed text-metal">
                {subtext}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap gap-4 font-[family-name:var(--font-form)] text-sm">
                <Press>
                  <Link
                    href="/catalogo"
                    className="block bg-emerald px-6 py-3 text-paper hover:opacity-90"
                  >
                    {t["nav.ver_catalogo"]}
                  </Link>
                </Press>
                {!session?.user && (
                  <Press>
                    <Link
                      href="/registro"
                      className="block border border-metal px-6 py-3 text-paper hover:bg-ink-200"
                    >
                      {t["nav.crear_cuenta"]}
                    </Link>
                  </Press>
                )}
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15} y={24} className="w-full max-w-md justify-self-center">
            <TiltOnScroll>
              <div className="rounded-sm bg-ink-200 p-6 shadow-[0_0_60px_-15px_rgba(45,122,74,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/demo/hero-cosecha.svg"
                  alt={t["home.hero.image_alt"]}
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
              {t["home.fruits.heading"]}
            </h2>
            <p className="mt-1 font-[family-name:var(--font-form)] text-sm text-metal">
              {t["home.fruits.subtext"]}
            </p>
          </Reveal>
          <ParallaxDrift className="mt-8">
            <FruitCarousel items={fruits} ctaLabel={t["carousel.cta"]} />
          </ParallaxDrift>
        </section>
      </main>

      <footer className="border-t border-ink-200">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 font-[family-name:var(--font-form)] text-xs text-metal">
          <span>© {new Date().getFullYear()} <span className="uppercase">{t["brand.name"]}</span> — {t["footer.copyright_suffix"]}</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-paper">
              {t["footer.privacidad"]}
            </Link>
            <Link href="/terms" className="hover:text-paper">
              {t["footer.terminos"]}
            </Link>
            <Link href="/reembolsos" className="hover:text-paper">
              {t["footer.cancelaciones"]}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
