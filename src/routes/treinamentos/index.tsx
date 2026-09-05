import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Cog, Target } from "lucide-react";
import { motion } from "motion/react";
import { Footer, Nav } from "@/components/site/chrome";
import { AmbientBackground, Reveal, ScrollProgress } from "@/components/site/primitives";

const title = "Treinamentos | Leonardo Froese";
const description =
  "Programas de Leonardo Froese para estruturar empresas, processos, gestão e resultado.";
const url = "https://leonardofroese.lovable.app/treinamentos";

export const Route = createFileRoute("/treinamentos/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "theme-color", content: "#0A0A0A" },
    ],
    links: [{ rel: "canonical", href: url }],
  }),
  component: TrainingsPage,
});

const foundations = [
  { icon: BarChart3, label: "Diagnóstico estratégico" },
  { icon: Cog, label: "Processos que funcionam" },
  { icon: Target, label: "Lucro com sistema" },
];

function TrainingsPage() {
  return (
    <main id="top" className="relative overflow-x-clip bg-background">
      <ScrollProgress />
      <Nav />

      <section className="relative px-6 pb-24 pt-36 lg:px-10 lg:pb-36 lg:pt-44">
        <AmbientBackground />
        <div className="relative mx-auto w-full max-w-7xl">
          <Reveal>
            <p className="max-w-5xl text-balance-tight text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl lg:text-7xl">
              Conhecimento aplicado para construir empresas mais fortes e lucrativas.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-10 grid gap-8 border-t border-border pt-8 md:grid-cols-[1fr_1fr] md:items-start">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Treinamentos
              </p>
              <p className="max-w-2xl text-base font-light leading-8 text-muted-foreground lg:text-lg">
                Programas desenvolvidos a partir da experiência prática de Leonardo Froese
                estruturando empresas, processos, gestão e resultado.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative border-y border-border bg-surface/35">
        <div className="mx-auto grid min-h-[760px] w-full max-w-[1600px] lg:grid-cols-[minmax(0,1.03fr)_minmax(480px,0.97fr)]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex min-h-[560px] items-center justify-center overflow-hidden bg-[#080808] p-5 sm:p-10 lg:min-h-[760px] lg:p-14"
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_35%_45%,oklch(0.83_0.121_82.5/0.12),transparent_52%)]"
            />
            <img
              src="/images/treinamentos/caliber-lucro-2x.png"
              alt="Arte oficial do Cáliber Lucro 2X com Leonardo Froese"
              width={1122}
              height={1402}
              className="relative h-auto max-h-[680px] w-full max-w-[545px] object-contain shadow-[0_30px_100px_-50px_rgba(244,190,98,0.42)]"
            />
          </motion.div>

          <div className="flex items-center px-6 py-20 sm:px-10 lg:px-16 xl:px-24">
            <div className="max-w-xl">
              <Reveal>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Estratégia · Processos · Lucro real
                </p>
                <h1 className="mt-7 text-balance-tight text-5xl font-extrabold uppercase leading-[0.9] text-foreground sm:text-6xl xl:text-[5.4rem]">
                  Cáliber
                  <span className="mt-2 block text-primary">Lucro 2X</span>
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-8 max-w-lg text-xl font-light leading-8 text-foreground/85">
                  Diagnóstico e Plano de Estruturação Empresarial
                </p>
                <p className="mt-3 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  com Leonardo Froese
                </p>
              </Reveal>

              <div className="mt-12 divide-y divide-border border-y border-border">
                {foundations.map((item, index) => (
                  <Reveal key={item.label} delay={0.14 + index * 0.06}>
                    <div className="flex items-center gap-4 py-5">
                      <item.icon
                        className="size-5 shrink-0 text-primary"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <span className="text-sm font-medium tracking-wide text-foreground/80">
                        {item.label}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.3}>
                <Link
                  to="/treinamentos/lucro-2x/raio-x"
                  className="group mt-12 inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Fazer meu Raio-X
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
