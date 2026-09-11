import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { MagneticButton, Reveal } from "./primitives";

const heroBackground =
  "/__l5e/assets-v1/679f22e6-7822-4aa5-baa3-c025b5f120ef/hero-bg-v2.png";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-[100svh] overflow-hidden bg-[#080808]"
    >
      {/* Fundo original em alta qualidade servido pelo asset nativo da Lovable. */}
      <div aria-hidden className="absolute inset-0">
        <img
          src={heroBackground}
          alt=""
          className="h-full w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* Overlay mínimo: a própria imagem já contém a composição escura à esquerda. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,5,.12) 0%, rgba(5,5,5,.08) 34%, rgba(5,5,5,.02) 64%, rgba(5,5,5,.04) 100%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background/45 via-transparent to-black/5" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-6 pb-24 pt-36 lg:px-10">
        <motion.div style={{ y: yContent, opacity }} className="max-w-[760px]">
          <Reveal delay={0.05}>
            <div className="flex items-center gap-4">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.32em] text-primary">
                Estratégia · Processos · Lucro real
              </p>
              <span className="hidden h-px w-32 bg-gradient-to-r from-primary/80 to-transparent sm:block" />
            </div>
          </Reveal>

          <Reveal delay={0.15} y={34}>
            <h1 className="mt-7 max-w-[760px] text-balance-tight text-[2.65rem] font-extrabold leading-[1.02] text-white sm:text-6xl lg:text-[4.45rem] xl:text-[4.75rem]">
              <span className="block">Sua empresa fatura.</span>
              <span className="mt-2 block">
                Mas <span className="text-primary">quanto lucro</span> está
              </span>
              <span className="block">deixando na mesa?</span>
            </h1>
          </Reveal>

          <Reveal delay={0.28}>
            <p className="mt-8 max-w-xl text-base font-light leading-7 text-white/72 sm:text-lg sm:leading-8">
              Descubra os gargalos que travam sua operação, seus processos e sua lucratividade com
              um diagnóstico estratégico da sua empresa.
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <MagneticButton
                href="/raiox"
                className="rounded-[16px] bg-emerald-500 px-8 py-4 text-white shadow-[0_14px_38px_-18px_rgba(16,185,129,.9)] hover:bg-emerald-600"
              >
                Fazer meu Raio-X
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </MagneticButton>
              <MagneticButton
                href="/treinamentos#caliber-lucro-2x"
                variant="ghost"
                className="rounded-[16px] border border-primary/65 bg-black/25 px-8 py-4 text-white backdrop-blur-md hover:border-primary hover:bg-primary/10 hover:text-white"
              >
                Conhecer o Cáliber Lucro 2X
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </MagneticButton>
            </div>
          </Reveal>
        </motion.div>
      </div>

      <motion.aside
        style={{ opacity }}
        aria-hidden
        className="absolute right-[4.5%] top-[34%] z-10 hidden w-44 xl:block"
      >
        <p className="text-[11px] font-semibold uppercase leading-[1.9] tracking-[0.32em] text-white/75">
          Estratégia
          <br />
          que transforma
          <br />
          resultados
        </p>
        <span className="mt-5 block h-px w-16 bg-primary/75" />
      </motion.aside>

      <motion.div
        style={{ opacity }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 lg:block"
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
