import { motion, useScroll, useTransform } from "motion/react";
import founderImg from "@/assets/leonardo-founder.png.asset.json";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  BarChart3,
  Compass,
  Crown,
  Gauge,
  Handshake,
  Landmark,
  LineChart,
  Play,
  Quote,
  Repeat,
  Rocket,
  Scroll,
  Target,
  TrendingUp,
  User,
  Wallet,
  Workflow,
} from "lucide-react";
import { CountUp, MagneticButton, Reveal, SectionLabel, TiltCard } from "./primitives";

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative px-6 py-28 lg:px-10 lg:py-40 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

/* ---------------- Sessão 2: Obstáculos ---------------- */

const problems = [
  {
    icon: Crown,
    title: "Empresa dependente do dono",
    text: "Todas as decisões passam por você. A operação para quando você para.",
  },
  {
    icon: Wallet,
    title: "Financeiro desorganizado",
    text: "Faturamento alto, caixa apertado e nenhuma clareza sobre margem real.",
  },
  {
    icon: Workflow,
    title: "Processos ineficientes",
    text: "Retrabalho, gargalos e times sem padrão de execução definido.",
  },
  {
    icon: LineChart,
    title: "Vendas sem previsibilidade",
    text: "Meses bons e meses ruins, sem funil, sem meta e sem gestão comercial.",
  },
];

export function Problems() {
  return (
    <Section id="obstaculos">
      <SectionLabel>O diagnóstico</SectionLabel>
      <Reveal delay={0.1}>
        <h2 className="text-balance-tight mt-6 max-w-3xl text-3xl font-bold leading-[1.1] sm:text-5xl">
          O maior obstáculo para o crescimento da sua empresa pode ser a{" "}
          <span className="text-primary">falta de gestão.</span>
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-5 md:grid-cols-2">
        {problems.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <TiltCard className="group h-full p-8 lg:p-10">
              <p.icon className="size-6 text-primary" strokeWidth={1.6} />
              <h3 className="mt-8 text-xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-muted-foreground">
                {p.text}
              </p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Sessão 3: Timeline ---------------- */

const steps = [
  { title: "Diagnóstico", text: "Raio-x completo da operação, números e time." },
  { title: "Planejamento", text: "Metas, prioridades e plano de ação por trimestre." },
  { title: "Financeiro", text: "Fluxo de caixa, margem, precificação e DRE." },
  { title: "Processos", text: "Padronização, rotinas e delegação estruturada." },
  { title: "Comercial", text: "Funil, cadência e previsibilidade de receita." },
  { title: "Indicadores", text: "Painel de gestão e ritmo de reuniões." },
  { title: "Escala", text: "Crescimento sustentado sem depender do dono." },
];

export function Methodology() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <Section id="metodologia" className="bg-surface/40">
      <SectionLabel>Metodologia</SectionLabel>
      <Reveal delay={0.1}>
        <h2 className="text-balance-tight mt-6 max-w-3xl text-3xl font-bold leading-[1.1] sm:text-5xl">
          Como transformamos empresas em operações lucrativas.
        </h2>
      </Reveal>

      <div ref={ref} className="relative mt-20">
        {/* linha desenhada: horizontal (desktop) */}
        <div className="absolute left-0 right-0 top-[9px] hidden h-px bg-border lg:block">
          <motion.div style={{ width }} className="h-px origin-left bg-primary" />
        </div>
        {/* linha desenhada: vertical (mobile) */}
        <div className="absolute bottom-0 left-[9px] top-0 w-px bg-border lg:hidden">
          <motion.div style={{ height }} className="w-px origin-top bg-primary" />
        </div>

        <ol className="grid gap-10 pl-10 lg:grid-cols-7 lg:gap-6 lg:pl-0">
          {steps.map((s, i) => (
            <li key={s.title} className="group/step relative">
              <motion.span
                initial={{ scale: 0.5, opacity: 0.2 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="absolute -left-10 top-1 block size-[19px] rounded-full border border-primary/60 bg-background shadow-[0_0_22px_-4px_oklch(0.83_0.121_82.5/0.7)] transition-transform duration-500 group-hover/step:scale-125 group-hover/step:border-primary lg:relative lg:left-0 lg:top-0"
              >
                <span className="absolute inset-[5px] rounded-full bg-primary transition-transform duration-500 group-hover/step:scale-110" />
              </motion.span>
              <Reveal delay={i * 0.05} className="transition-transform duration-500 group-hover/step:translate-x-1 lg:mt-6 lg:group-hover/step:translate-x-0 lg:group-hover/step:translate-y-[-4px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-subtle">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                  {s.text}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/* ---------------- Sessão 4: Pilares ---------------- */

const pillars = [
  {
    icon: Compass,
    title: "Gestão Estratégica",
    text: "Direção clara, prioridades definidas e um time que executa sem depender do dono.",
  },
  {
    icon: BarChart3,
    title: "Financeiro",
    text: "Margem, caixa e precificação sob controle: decisões guiadas por números reais.",
  },
  {
    icon: Handshake,
    title: "Comercial",
    text: "Máquina de vendas com funil, metas e previsibilidade mês após mês.",
  },
  {
    icon: Rocket,
    title: "Escala",
    text: "Estrutura, indicadores e cultura para crescer com lucro e consistência.",
  },
];

export function Pillars() {
  return (
    <Section id="pilares">
      <SectionLabel>Fundamentos</SectionLabel>
      <Reveal delay={0.1}>
        <h2 className="text-balance-tight mt-6 text-3xl font-bold leading-[1.1] sm:text-5xl">
          Os pilares da Cáliber.
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <TiltCard className="group h-full p-8">
              <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-background/50 transition-colors duration-500 group-hover:border-primary/40">
                <p.icon className="size-5 text-primary" strokeWidth={1.6} />
              </div>
              <h3 className="mt-8 text-lg font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                {p.text}
              </p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Sessão 5: Resultados (Transformações) ---------------- */

const transformations = [
  {
    id: "01",
    icon: Workflow,
    title: "Empresa Organizada",
    text: "Processos claros, responsabilidades definidas e uma operação que funciona de forma previsível.",
  },
  {
    id: "02",
    icon: Landmark,
    title: "Financeiro sob Controle",
    text: "Indicadores confiáveis, fluxo de caixa estruturado e decisões baseadas em dados.",
  },
  {
    id: "03",
    icon: TrendingUp,
    title: "Comercial Previsível",
    text: "Processo comercial estruturado para gerar crescimento consistente e aumento da lucratividade.",
  },
  {
    id: "04",
    icon: User,
    title: "Dono com Liberdade",
    text: "Uma empresa preparada para crescer sem depender do empresário em todas as decisões.",
  },
];

const indicators = [
  { value: 16, suffix: "+", label: "Anos estruturando empresas" },
  { value: 450, suffix: "+", label: "Empresas transformadas" },
  { value: 100, prefix: "R$", suffix: " milhões+", label: "Em lucro gerado" },
  { value: 12000, suffix: "+", label: "Pessoas treinadas" },
];

export function Results() {
  return (
    <Section id="resultados" className="overflow-hidden">
      <div className="flex flex-col items-center text-center">
        <SectionLabel>Resultados</SectionLabel>
        <Reveal delay={0.1}>
          <h2 className="text-balance-tight mt-6 text-4xl font-bold leading-[1.05] sm:text-6xl">
            Transformações construídas na prática.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground sm:text-xl">
            Mais do que aumentar faturamento, o objetivo é construir empresas que crescem com gestão, processos e previsibilidade.
          </p>
        </Reveal>
      </div>

      {/* Primeira parte: Blocos Premium */}
      <div className="mt-24 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {transformations.map((t, i) => (
          <Reveal key={t.id} delay={0.1 + i * 0.1}>
            <TiltCard className="group flex h-full flex-col p-10 glass border-white/5 bg-gradient-to-b from-surface/50 to-background/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.3em] text-primary/40">
                  {t.id}
                </span>
                <t.icon className="size-5 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="mt-12 text-xl font-semibold tracking-tight">{t.title}</h3>
              <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground">
                {t.text}
              </p>
              
              {/* Detalhe dourado discreto no hover */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {/* Segunda parte: Faixa Premium com Indicadores */}
      <div className="relative mt-32">
        {/* Linha horizontal dourada */}
        <div className="absolute -top-12 left-0 right-0 h-px">
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-full w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" 
          />
        </div>

        <div className="grid gap-12 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {indicators.map((ind, i) => (
            <Reveal key={ind.label} delay={0.4 + i * 0.1}>
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <p className="text-4xl font-bold tracking-tighter text-primary sm:text-5xl">
                  <CountUp 
                    to={ind.value} 
                    prefix={ind.prefix || ""} 
                    suffix={ind.suffix}
                    duration={2.5}
                  />
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-subtle">
                  {ind.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="absolute -bottom-12 left-0 right-0 h-px">
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
            className="h-full w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" 
          />
        </div>
      </div>
    </Section>
  );
}

/* ---------------- Sessão 6: Leonardo ---------------- */

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <Section id="leonardo">
      <div ref={ref} className="grid items-center gap-16 lg:grid-cols-12 lg:gap-24">
        <Reveal className="lg:col-span-5">
          {/* PLACEHOLDER: foto do Leonardo */}
          <motion.div
            style={{ y }}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border bg-surface"
          >
            <img
              src={founderImg.url}
              alt="Leonardo Froese"
              className="h-full w-full object-cover grayscale-[0.2] transition-all duration-700 hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </motion.div>
        </Reveal>

        <div className="lg:col-span-7">
          <SectionLabel>Fundador</SectionLabel>
          <Reveal delay={0.1}>
            <h2 className="text-balance-tight mt-6 text-3xl font-bold leading-[1.1] sm:text-5xl">
              Quem é Leonardo Froese.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-2xl text-base font-light leading-[1.85] text-muted-foreground">
              Fundador da Cáliber Gestão Empresarial, Leonardo atua há mais de 16 anos ao
              lado de empresários que querem sair da operação e construir empresas que se
              sustentam sozinhas. Sua atuação combina gestão estratégica, disciplina
              financeira e estruturação comercial.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-6 max-w-2xl text-base font-light leading-[1.85] text-muted-foreground">
              Ao longo da carreira, participou da estruturação de mais de 400 empresas de
              diferentes segmentos e portes, sempre com o mesmo princípio: método antes de
              esforço, clareza antes de velocidade e lucro como consequência de gestão.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="mt-10 h-px w-full hairline" />
            <p className="mt-6 text-sm font-light text-subtle">
              Cáliber Gestão Empresarial: consultoria para empresas que querem crescer com
              estrutura.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- Sessão Apresentação: Vídeo ---------------- */

export function PresentationVideo() {
  return (
    <Section id="apresentacao" className="bg-surface/20">
      <div className="flex flex-col items-center text-center">
        <SectionLabel>Apresentação</SectionLabel>
        <Reveal delay={0.1}>
          <h2 className="text-balance-tight mt-6 max-w-3xl text-3xl font-bold leading-[1.1] sm:text-5xl">
            Conheça a visão por trás da <span className="text-primary">Cáliber.</span>
          </h2>
        </Reveal>
        
        <Reveal delay={0.3} className="mt-16 w-full max-w-5xl">
          <div className="group relative aspect-video w-full overflow-hidden rounded-3xl border border-border/50 bg-surface shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/QQop_A9TSWw?si=Uv9688vCskvVn-C8"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 h-full w-full grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0"
            />
            {/* Overlay para dar um toque premium */}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------------- Sessão Storytelling: Narrativa ---------------- */

const chapters = [
  {
    id: "01",
    label: "Capítulo 01",
    title: "SOBRE MIM",
    content: [
      "Prazer, sou Leonardo Froese.",
      "Sou CEO da Cáliber Transformadoria, empresa especializada em transformar negócios na prática, construída a partir da vivência real dentro das empresas.",
      "Ao longo da minha trajetória participei da estruturação de centenas de operações empresariais e acompanhei milhares de decisões estratégicas que impactaram diretamente o crescimento dos negócios.",
      "Hoje nosso trabalho já contribuiu para mais de R$ 100 milhões em lucro gerado e centenas de empresas estruturadas.",
    ],
  },
  {
    id: "02",
    label: "Capítulo 02",
    title: "O PROBLEMA",
    content: [
      "Durante muitos anos acompanhei consultorias entregando soluções excelentes no papel, mas completamente desconectadas da realidade do empresário.",
      "Planilhas perfeitas. Métodos sofisticados. Processos impecáveis.",
      "Mas nada funcionava na prática.",
      "Quem realmente conhece uma empresa é quem vive seus desafios todos os dias. Foi ali que percebi que o mercado precisava de algo diferente.",
    ],
  },
  {
    id: "03",
    label: "Capítulo 03",
    title: "O DESAFIO",
    content: [
      "Decidi construir uma metodologia baseada na prática.",
      "Passei anos identificando os principais fatores que impedem empresas de crescer.",
      "Mapeei processos. Financeiro. Comercial. Gestão. Operação.",
      "Foi assim que nasceu uma metodologia capaz de organizar empresas, aumentar o lucro e reduzir a dependência do empresário nas operações do dia a dia.",
    ],
  },
  {
    id: "04",
    label: "Capítulo 04",
    title: "O SUCESSO",
    content: [
      "Com o passar dos anos a metodologia foi sendo validada.",
      "A equipe cresceu. A atuação se expandiu. Centenas de empresas passaram pela transformação.",
      "Hoje a Cáliber atua em diversos segmentos e estados brasileiros.",
      "Meu trabalho deixou de depender exclusivamente da minha agenda. Criamos uma empresa capaz de transformar negócios em escala.",
    ],
  },
  {
    id: "05",
    label: "Capítulo 05",
    title: "O PROPÓSITO",
    content: [
      "Mesmo depois de tantos resultados, uma pergunta continuava me acompanhando.",
      "Quantos empresários ainda enfrentam os mesmos problemas que eu enfrentei?",
      "Foi por isso que decidi compartilhar esse conhecimento.",
      "Meu propósito não é apenas organizar empresas. É ajudar empresários a construírem negócios lucrativos, estruturados e independentes do dono.",
      "Esse é o trabalho que escolhi realizar.",
    ],
  },
];

export function Storytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  return (
    <div ref={containerRef} className="relative">
      {/* Linha dourada conectora */}
      <div className="absolute left-1/2 top-[10%] bottom-[10%] hidden w-px -translate-x-1/2 bg-border/40 lg:block">
        <motion.div
          style={{ height: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
          className="w-px origin-top bg-gradient-to-b from-primary/20 via-primary to-primary/20 shadow-[0_0_15px_oklch(0.83_0.121_82.5/0.4)]"
        />
      </div>

      {chapters.map((chapter, i) => (
        <ChapterItem key={chapter.id} chapter={chapter} index={i} />
      ))}
    </div>
  );
}

function ChapterItem({ chapter, index }: { chapter: (typeof chapters)[0]; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <section className="relative flex min-h-[90vh] items-center px-6 py-20 lg:px-10">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-24">
        {/* Texto */}
        <div className={cn("relative z-10", !isEven && "lg:order-2")}>
          <Reveal delay={0.1} y={20}>
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.3em] text-primary/80">
              {chapter.label}
            </span>
          </Reveal>
          <Reveal delay={0.2} y={30} blur={true}>
            <h3 className="text-balance-tight text-4xl font-bold leading-none tracking-tighter sm:text-6xl lg:text-7xl">
              {chapter.title}
            </h3>
          </Reveal>
          <div className="mt-8 space-y-6">
            {chapter.content.map((text, j) => (
              <Reveal key={j} delay={0.3 + j * 0.1} y={20} blur={true}>
                <p className="max-w-xl text-lg font-light leading-relaxed text-muted-foreground sm:text-xl">
                  {text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Placeholder visual */}
        <div className={cn("relative", isEven ? "lg:order-2" : "lg:order-1")}>
          <Reveal delay={0.4} y={40} className="w-full">
            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-surface-2 to-surface transition-all duration-700 hover:border-primary/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.83_0.121_82.5/0.05),transparent_70%)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-subtle/40 transition-colors duration-500 group-hover:text-subtle/60">
                <Scroll className="size-10" strokeWidth={1} />
                <span className="text-[10px] uppercase tracking-[0.3em]">
                  Asset Placeholder {chapter.id}
                </span>
              </div>
              {/* Efeito de luz acompanhando o card */}
              <div className="absolute -inset-px rounded-3xl border border-primary/0 transition-colors duration-700 group-hover:border-primary/10" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Sessão 7: Depoimentos ---------------- */

const cases = [
  { name: "Indústria: 120 colaboradores", result: "Margem líquida reestruturada" },
  { name: "Varejo: 8 lojas", result: "Operação independente do dono" },
  { name: "Serviços B2B", result: "Previsibilidade comercial" },
];

export function Testimonials() {
  return (
    <Section id="cases" className="bg-surface/40">
      <SectionLabel>Cases</SectionLabel>
      <Reveal delay={0.1}>
        <h2 className="text-balance-tight mt-6 max-w-2xl text-3xl font-bold leading-[1.1] sm:text-5xl">
          Depoimentos de quem mudou o jogo.
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-5 lg:grid-cols-3">
        {cases.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.1}>
            <div className="card-premium group h-full overflow-hidden">
              {/* PLACEHOLDER: vídeo de depoimento */}
              <div
                data-video-placeholder={`depoimento-${i + 1}`}
                className="relative aspect-video w-full border-b border-border bg-gradient-to-br from-surface-2 to-background"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-14 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_40px_-10px_oklch(0.83_0.121_82.5/0.7)]">
                    <Play className="size-5 text-primary" strokeWidth={1.6} />
                  </span>
                </div>
                <span className="absolute bottom-3 left-4 text-[10px] uppercase tracking-[0.22em] text-subtle">
                  Espaço para vídeo
                </span>
              </div>
              <div className="p-8">
                <Quote className="size-4 text-primary" strokeWidth={1.8} />
                <p className="mt-5 text-lg font-medium tracking-tight">{c.result}</p>
                <p className="mt-2 text-sm font-light text-subtle">{c.name}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Sessão 8: Faixa de impacto ---------------- */

export function ImpactBand() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-background px-6 py-32 lg:py-48">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,oklch(0.83_0.121_82.5/0.07),transparent_70%)]" />
      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal y={40}>
          <p className="text-balance-tight text-3xl font-bold leading-[1.15] sm:text-5xl lg:text-6xl">
            Sua empresa trabalha para você?
          </p>
        </Reveal>
        <Reveal y={40} delay={0.18}>
          <p className="text-balance-tight mt-4 text-3xl font-bold leading-[1.15] text-primary sm:text-5xl lg:text-6xl">
            Ou você trabalha para sua empresa?
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- CTA Final ---------------- */

export function FinalCta() {
  return (
    <section
      id="contato"
      className="relative flex min-h-[90svh] items-center overflow-hidden px-6 py-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_100%,oklch(0.83_0.121_82.5/0.10),transparent_70%)]" />
      <div className="relative mx-auto max-w-4xl text-center">
        <SectionLabel>Próximo passo</SectionLabel>
        <Reveal delay={0.1} y={36}>
          <h2 className="text-balance-tight mt-8 text-4xl font-extrabold leading-[1.06] sm:text-6xl lg:text-7xl">
            Sua empresa pode crescer muito mais.
          </h2>
        </Reveal>
        <Reveal delay={0.22} y={36}>
          <p className="text-balance-tight mt-5 text-2xl font-light leading-tight text-muted-foreground sm:text-4xl">
            Ela só precisa deixar de depender de você.
          </p>
        </Reveal>
        <Reveal delay={0.36}>
          <div className="mt-14 flex justify-center">
            <MagneticButton href="#contato" className="px-9 py-4 text-base">
              Agendar Diagnóstico Estratégico
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
