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

      <section className="relative px-6 pb-14 pt-32 sm:pb-16 lg:px-10 lg:pb-20 lg:pt-36">
        <AmbientBackground />
        <div className="relative mx-auto w-full max-w-7xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Treinamentos
            </p>
            <h1 className="mt-5 max-w-4xl text-balance-tight text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              Estrutura para transformar gestão em resultado.
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-2xl text-base font-light leading-8 text-muted-foreground lg:text-lg">
              Programas desenvolvidos para empresários que querem organizar a operação, fortalecer
              processos e construir lucro com método.
            </p>
          </Reveal>
        </div>
      </section>

      <section
        id="caliber-lucro-2x"
        className="relative scroll-mt-24 border-y border-border bg-surface/35 px-6 py-16 sm:py-20 lg:px-10 lg:py-24"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_78%_44%,oklch(0.83_0.121_82.5/0.08),transparent_38%)]"
        />
        <div className="relative mx-auto grid w-full max-w-7xl gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(480px,1.12fr)] lg:items-center xl:gap-x-20">
          <div className="max-w-xl lg:col-start-1 lg:row-start-1">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Estratégia · Processos · Lucro real
              </p>
              <h2 className="mt-6 text-balance-tight text-5xl font-extrabold uppercase leading-[0.9] text-foreground sm:text-6xl xl:text-[5.2rem]">
                Cáliber
                <span className="mt-2 block text-primary">Lucro 2X</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-7 max-w-lg text-xl font-light leading-8 text-foreground/90">
                Diagnóstico e Plano de Estruturação Empresarial
              </p>
              <p className="mt-5 max-w-xl text-base font-light leading-8 text-muted-foreground">
                Descubra onde sua empresa perde eficiência, margem e capacidade de crescer — e dê o
                primeiro passo para construir uma operação mais estruturada e lucrativa.
              </p>
            </Reveal>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[620px] lg:col-start-2 lg:row-span-2 lg:row-start-1"
          >
            <div
              aria-hidden
              className="absolute inset-[8%] -z-10 rounded-full bg-primary/10 blur-3xl"
            />
            <img
              src="/images/treinamentos/caliber-lucro-2x.png"
              alt="Arte oficial do Cáliber Lucro 2X com Leonardo Froese"
              width={1122}
              height={1402}
              className="h-auto w-full rounded-3xl border border-white/10 object-contain shadow-[0_32px_90px_-48px_rgba(244,190,98,0.35)]"
            />
          </motion.div>

          <div className="max-w-xl lg:col-start-1 lg:row-start-2">
            <div className="grid border-y border-border sm:grid-cols-3">
              {foundations.map((item, index) => (
                <Reveal key={item.label} delay={0.14 + index * 0.06}>
                  <div className="flex h-full items-center gap-3 border-b border-border py-5 last:border-b-0 sm:block sm:border-b-0 sm:border-l sm:px-5 sm:first:border-l-0 sm:first:pl-0 sm:last:pr-0">
                    <item.icon
                      className="size-5 shrink-0 text-primary"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <span className="text-sm font-medium leading-5 text-foreground/85 sm:mt-3 sm:block">
                      {item.label}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <Link
                to="/treinamentos/lucro-2x/raio-x"
                className="group mt-9 inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-emerald-500 px-7 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500"
              >
                Fazer meu Raio-X
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                12 perguntas · aproximadamente 2 minutos · resultado na hora
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
