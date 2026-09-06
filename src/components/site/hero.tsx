import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { MagneticButton, Reveal } from "./primitives";
import heroBg from "@/assets/hero-bg-v2.png.asset.json";

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
      id="hero"
      className="relative min-h-[100svh] overflow-hidden"

      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.65)), url(${heroBg.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Cinematic Overlays */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(
            90deg,
            rgba(8,8,8,0.82) 0%,
            rgba(8,8,8,0.60) 35%,
            rgba(8,8,8,0.35) 65%,
            rgba(8,8,8,0.20) 100%
          )`,
        }}
      />
      {/* Subtle vignette and bottom darkening */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(8,8,8,0.4)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-6 pb-24 pt-36 lg:px-10">
        <motion.div style={{ y: yContent, opacity }} className="max-w-3xl">
          <Reveal delay={0.05}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
              Estratégia · Processos · Lucro real
            </p>
          </Reveal>

          <Reveal delay={0.15} y={34}>
            <h1 className="text-balance-tight mt-7 text-4xl font-extrabold leading-[1.03] sm:text-6xl lg:text-7xl">
              Sua empresa fatura.
              <span className="mt-2 block">
                Mas <span className="text-primary">quanto lucro</span> está deixando na mesa?
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.28}>
            <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
              Descubra os gargalos que travam sua operação, seus processos e sua lucratividade com
              um diagnóstico estratégico da sua empresa.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton href="/treinamentos/lucro-2x/raio-x" className="bg-emerald-500 text-white hover:bg-emerald-600">
                Fazer meu Raio-X
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </MagneticButton>
              <MagneticButton href="/treinamentos#caliber-lucro-2x" variant="ghost">
                Conhecer o Cáliber Lucro 2X
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </MagneticButton>
            </div>
          </Reveal>
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
