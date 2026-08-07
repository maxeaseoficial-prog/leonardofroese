import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { CountUp, MagneticButton, Reveal } from "./primitives";
import heroBg from "@/assets/hero-bg-v2.png.asset.json";

const stats = [
  { label: "de mercado", value: 16, prefix: "+", suffix: " anos" },
  { label: "estruturadas", value: 400, prefix: "+", suffix: " empresas" },
  { label: "gerados para clientes", value: 100, prefix: "+R$ ", suffix: " milhões" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      ref={ref} 
      className="relative min-h-[100svh] overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Cinematic Overlays */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(
            90deg,
            rgba(8,8,8,0.82) 0%,
            rgba(8,8,8,0.60) 35%,
            rgba(8,8,8,0.35) 65%,
            rgba(8,8,8,0.20) 100%
          )`
        }}
      />
      {/* Subtle vignette and bottom darkening */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(8,8,8,0.4)_100%)]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-transparent to-transparent" />


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
