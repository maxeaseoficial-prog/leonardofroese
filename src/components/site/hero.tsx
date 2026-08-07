import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { CountUp, MagneticButton, Reveal } from "./primitives";
import heroBg from "@/assets/hero-bg.png.asset.json";

const stats = [
  { label: "de mercado", value: 16, prefix: "+", suffix: " anos" },
  { label: "estruturadas", value: 400, prefix: "+", suffix: " empresas" },
  { label: "gerados para clientes", value: 100, prefix: "+R$ ", suffix: " milhões" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      {/* Imagem de fundo com degrade cinematográfico */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0">
          <img
            src={heroBg.url}
            alt=""
            className="h-full w-full object-cover object-center opacity-70 grayscale-[0.2]"
          />
          {/* Degrade sobre a imagem */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        </div>
        {/* overlay cinematográfico + blur nas bordas */}
        <div className="absolute inset-0 bg-background/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,oklch(0.145_0_0/0.95)_100%)]" />
        <div className="absolute inset-0 backdrop-blur-[3px] [mask-image:radial-gradient(ellipse_at_center,transparent_45%,black_95%)]" />
      </motion.div>

      <div className="mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-6 pb-24 pt-36 lg:px-10">
        <motion.div style={{ y: yContent, opacity }} className="max-w-3xl">
          <Reveal delay={0.05}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
              Gestão • Financeiro • Vendas • Escala
            </p>
          </Reveal>

          <Reveal delay={0.15} y={34}>
            <h1 className="text-balance-tight mt-7 text-4xl font-extrabold leading-[1.03] sm:text-6xl lg:text-7xl">
              Empresas lucrativas não dependem de{" "}
              <span className="text-primary">donos-heróis.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.28}>
            <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
              Há mais de 16 anos ajudando empresários a estruturarem empresas lucrativas
              através de gestão, processos, financeiro e estratégia comercial.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton href="#contato">
                Agendar Diagnóstico Estratégico
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </MagneticButton>
              <MagneticButton href="#metodologia" variant="ghost">
                <Play className="size-3.5" />
                Conhecer a Metodologia
              </MagneticButton>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={0.55 + i * 0.12}>
                <div className="card-premium h-full px-6 py-6">
                  <p className="text-2xl font-bold tracking-tight text-primary sm:text-[1.7rem]">
                    <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} />
                  </p>
                  <p className="mt-1.5 text-sm font-light text-subtle">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 lg:block"
      >
        <motion.span
          animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="block h-10 w-px bg-gradient-to-b from-transparent via-primary/70 to-transparent"
        />
      </motion.div>
    </section>
  );
}
