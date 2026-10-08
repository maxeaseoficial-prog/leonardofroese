import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const PURCHASE_URL = "https://pay.kiwify.com.br/AFc4KI8";
const SOURCE_COMMIT = "2336b5516d8b02039e30298a089397ef18386b63";
const HERO_IMAGE = `https://raw.githubusercontent.com/maxeaseoficial-prog/caliber-summit-forge/${SOURCE_COMMIT}/public/images/leonardo-hero.jpg`;
const LEONARDO_IMAGE = "/images/hero-leonardo-final.webp";

const TITLE = "RPM Summit | Leonardo Froese";
const DESCRIPTION =
  "Um encontro para empresários e líderes que buscam clareza, estrutura, conexões estratégicas e crescimento consistente.";

export const Route = createFileRoute("/rpm")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RpmPage,
});

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform,filter] duration-[900ms]",
        shown ? "translate-y-0 opacity-100 blur-0" : "translate-y-6 opacity-0 blur-[2px]",
        className,
      )}
      style={{ transitionDelay: `${delay}ms`, transitionTimingFunction: "var(--rpm-ease)" }}
    >
      {children}
    </div>
  );
}

function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[78rem] px-6 md:px-10", className)}>{children}</div>;
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.36em] text-[var(--rpm-copper)]">
      <span aria-hidden className="h-px w-8 bg-[var(--rpm-copper)]/60" />
      {children}
    </span>
  );
}

function RpmLogo({ className }: { className?: string }) {
  return (
    <div className={cn("select-none", className)} aria-label="RPM Summit">
      <div className="rpm-display text-[2rem] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[2.35rem]">RPM</div>
      <div className="mt-1 flex items-center gap-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d97945] to-transparent" />
        <span className="text-[0.56rem] font-semibold uppercase tracking-[0.42em] text-[#d97945]">Summit</span>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d97945] to-transparent" />
      </div>
    </div>
  );
}

function PrimaryCTA({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <a
      href={PURCHASE_URL}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-9 py-4 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-white transition-[filter,transform] duration-300 hover:brightness-110 active:translate-y-px",
        className,
      )}
      style={{ background: "linear-gradient(135deg,#004d00 0%,#008000 52%,#16a016 100%)" }}
    >
      {children}
    </a>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled ? "border-b border-white/10 bg-[#211f1d]/95 backdrop-blur-md" : "bg-transparent")}>
      <div className="border-b border-white/10 px-2 text-center" style={{ background: "var(--rpm-gradient)" }}>
        <p className="mx-auto max-w-[78rem] px-6 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white sm:text-[0.68rem] sm:tracking-[0.26em]">
          <span aria-hidden className="mr-2 text-white/90">◆</span>
          Exclusivo para donos de empresa com 10 a 1000 funcionários
        </p>
      </div>
      <div className="mx-auto grid w-full max-w-[78rem] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6 md:px-10 md:py-4">
        <a href="#topo" aria-label="Ir para o início do RPM Summit" className="justify-self-start"><RpmLogo className="w-24 sm:w-28 md:w-32" /></a>
        <p className="flex max-w-[48vw] flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[0.58rem] font-bold uppercase leading-tight tracking-[0.08em] text-white sm:max-w-none sm:flex-nowrap sm:text-[0.72rem] md:text-[0.82rem] lg:text-[0.88rem]">
          <span className="whitespace-nowrap">10 de Dezembro</span><span className="text-[#b8734d]">•</span><span className="whitespace-nowrap">Cuiabá</span><span className="text-[#b8734d]">•</span><span className="whitespace-nowrap">3 horas presenciais</span>
        </p>
        <a href={PURCHASE_URL} className="justify-self-end rounded-full px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-white transition-[filter,transform] duration-300 hover:brightness-110 sm:px-7 sm:py-3 sm:text-[0.72rem] md:min-w-40 md:text-center" style={{ background: "linear-gradient(135deg,#004d00 0%,#008000 52%,#16a016 100%)" }}>Ingressos</a>
      </div>
    </header>
  );
}

function Hero() {
  const [entered, setEntered] = useState(false);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setEntered(true), 60);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return () => window.clearTimeout(timer);
    const onScroll = () => setOffset(Math.min(window.scrollY, 600));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, []);
  const enterClass = entered ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-[3px]";

  return (
    <section id="topo" className="relative min-h-[100svh] overflow-hidden bg-[var(--rpm-bg)]">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(90%_75%_at_78%_72%,rgba(158,67,37,0.26),transparent_66%),radial-gradient(70%_52%_at_18%_16%,rgba(161,110,61,0.14),transparent_64%)]" />
      <div aria-hidden className="rpm-hero-portrait absolute overflow-hidden">
        <img src={HERO_IMAGE} alt="" width={1920} height={2880} className="h-full w-full object-cover object-top will-change-transform" style={{ transform: `translate3d(0, ${offset * 0.03}px, 0) scale(1.03)` }} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(25,22,20,0.86)_0%,rgba(25,22,20,0.48)_42%,rgba(25,22,20,0.08)_70%)]" />
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[var(--rpm-bg)]" />
      <div className="relative z-10 mx-auto grid w-full max-w-[78rem] grid-cols-1 px-6 pb-16 pt-[54svh] md:px-10 md:pb-20 md:pt-[58svh] lg:min-h-[100svh] lg:grid-cols-[minmax(0,56%)_minmax(0,44%)] lg:items-center lg:pb-20 lg:pt-44">
        <div className="max-w-[46rem] text-left lg:pr-8 xl:pr-10">
          <p className={cn("rpm-display text-4xl leading-[1.05] tracking-tight text-white transition-[opacity,transform,filter] duration-[900ms] sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] 2xl:text-[5rem]", enterClass)} style={{ transitionTimingFunction: "var(--rpm-ease)" }}>
            Sua empresa cresceu.<span className="block rpm-gradient-text">Agora ela precisa ficar mais forte.</span>
          </p>
          <p className={cn("mt-7 max-w-xl text-lg font-medium leading-relaxed text-white transition-[opacity,transform,filter] duration-[900ms] sm:text-xl lg:mt-8", enterClass)} style={{ transitionDelay: "440ms", transitionTimingFunction: "var(--rpm-ease)" }}>
            Descubra onde Pessoas, Finanças e Vendas estão travando lucro, autonomia e crescimento, e <span className="text-[#D97945]">qual prioridade precisa ganhar estrutura primeiro.</span>
          </p>
          <div className={cn("mt-9 flex justify-center transition-[opacity,transform,filter] duration-[900ms] lg:mt-10", enterClass)} style={{ transitionDelay: "580ms", transitionTimingFunction: "var(--rpm-ease)" }}><PrimaryCTA className="w-full sm:w-auto sm:min-w-56">Quero participar</PrimaryCTA></div>
        </div>
      </div>
    </section>
  );
}

function ScarcityTicker() {
  const items = Array.from({ length: 6 }, (_, index) => index);
  return (
    <section aria-label="Vagas limitadas" className="relative z-20 overflow-hidden border-y border-white/10">
      <div className="py-2 sm:py-2.5" style={{ background: "var(--rpm-gradient)" }}>
        <div className="rpm-marquee flex w-max min-w-full items-center will-change-transform">
          {[0, 1].map((group) => <div key={group} className="flex shrink-0 items-center gap-7 pr-7 sm:gap-10 sm:pr-10">{items.map((item) => <div key={item} className="flex shrink-0 items-center gap-7 sm:gap-10"><span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white sm:text-[0.82rem] sm:tracking-[0.18em]">Vagas limitadas</span><span className="h-1 w-1 rounded-full bg-white/60" /></div>)}</div>)}
        </div>
      </div>
    </section>
  );
}

const PAINS = [
  ["Minha empresa vende, mas o lucro não aparece", "Você trabalha, vende, gira a operação, mas no fim do mês a sensação é a mesma: entrou dinheiro, mas sobrou menos do que deveria."],
  ["Se eu sair, a empresa desacelera", "A operação continua exigindo sua presença para decidir, cobrar, resolver e destravar. A empresa cresce, mas ainda depende demais de você."],
  ["Tenho equipe, mas tudo ainda passa por mim", "Você contratou, delegou parte da rotina, mas as decisões importantes continuam voltando para a sua mesa."],
  ["Não sei qual problema atacar primeiro", "Existe muita urgência, muita demanda e pouco foco. Sem clareza de prioridade, a empresa gira, mas não avança com força."],
  ["Vendo mais, mas sinto a empresa mais pesada", "O faturamento cresce, mas junto vêm retrabalho, desorganização, mais custo e mais pressão sobre o dono."],
  ["Meu comercial gera movimento, mas perde dinheiro na execução", "Entram oportunidades, saem propostas, mas falta acompanhamento, conversão e processo para transformar esforço em resultado."],
] as const;

function PainPoints() {
  return <section className="relative overflow-hidden border-y border-white/10 py-20 sm:py-24 lg:py-28"><Container><Reveal className="mx-auto max-w-4xl text-center"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[var(--rpm-copper)] sm:text-[0.72rem]">Dores reais de quem está crescendo</p><h2 className="rpm-display mt-5 text-3xl leading-[1.06] tracking-tight text-white sm:text-4xl lg:text-5xl">No Summit, vamos colocar na mesa as principais dores que travam crescimento, lucro e clareza de gestão!</h2></Reveal><div className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">{PAINS.map(([title, description], index) => <Reveal key={title} delay={index * 70}><article className="h-full min-h-[13rem] rounded-sm border border-[#b8734d]/25 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#b8734d]/50 hover:bg-[#b8734d]/[0.045] sm:p-7"><div className="flex items-start justify-between gap-5"><p className="max-w-[17rem] text-lg font-semibold leading-[1.12] text-white sm:text-xl">“{title}”</p><span className="rpm-display text-3xl leading-none text-[#b8734d]/40">{String(index + 1).padStart(2, "0")}</span></div><p className="mt-5 text-sm leading-relaxed text-[var(--rpm-muted)] sm:text-[0.95rem]">{description}</p></article></Reveal>)}</div></Container></section>;
}

function Audience() {
  const profiles = ["Empresários", "Sócios", "Gestores", "Líderes", "Empreendedores em expansão"];
  return <section id="para-quem" className="py-24 md:py-36"><Container><div className="grid gap-14 lg:grid-cols-2 lg:gap-24"><div><Reveal><Eyebrow>Para quem é</Eyebrow></Reveal><Reveal delay={120}><p className="rpm-display mt-8 text-4xl leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">Para quem não quer<span className="block rpm-gradient-text">construir pequeno.</span></p></Reveal></div><div><Reveal delay={160}><p className="max-w-xl text-base leading-relaxed text-[var(--rpm-muted)]">O Cáliber Summit foi criado para empresários e líderes que entenderam que crescer exige mais do que trabalhar mais. É preciso pensar melhor, estruturar melhor e decidir melhor.</p></Reveal><ul className="mt-12">{profiles.map((profile, index) => <li key={profile} className="border-b border-white/10 py-4"><Reveal delay={200 + index * 80}><div className="flex items-center gap-5"><span className="h-1 w-1 rotate-45 bg-[#d97945]" /><span className="text-sm uppercase tracking-[0.22em] text-white/85">{profile}</span></div></Reveal></li>)}</ul></div></div></Container></section>;
}

function Guide() {
  const metrics = [["19 anos", "de atuação prática"], ["+450 empresas", "estruturadas"], ["10 estados", "atendidos"], ["+R$ 100 milhões", "em lucro gerado"]] as const;
  return <section id="quem-vai-guiar" className="relative isolate min-h-[760px] overflow-hidden bg-[var(--rpm-bg)] sm:min-h-[780px] lg:min-h-[680px]"><img src={LEONARDO_IMAGE} alt="Leonardo Froese" className="absolute inset-0 h-full w-full object-cover object-[72%_35%]" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.91)_28%,rgba(0,0,0,0.75)_43%,rgba(0,0,0,0.42)_57%,rgba(0,0,0,0.13)_72%,rgba(0,0,0,0.02)_100%)]" /><div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.04)_58%,rgba(0,0,0,0.42)_82%,#211f1d_100%)]" /><Container className="relative z-10 flex min-h-[760px] items-end pb-16 pt-[300px] sm:min-h-[780px] sm:pb-20 sm:pt-[340px] lg:min-h-[680px] lg:items-center lg:py-16"><div className="max-w-[610px]"><Reveal><Eyebrow>Quem vai guiar você?</Eyebrow></Reveal><Reveal delay={100}><h2 className="rpm-display mt-5 text-4xl leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-[3.75rem]"><span className="block">LEONARDO</span><span className="block">FROESE</span></h2></Reveal><div className="mt-6 space-y-4 text-[0.95rem] leading-relaxed text-white/90 sm:text-base lg:mt-7"><Reveal delay={180}><p>Leonardo Froese é fundador da Cáliber e do Grupo Froese. Há <span className="text-[#D97945]">19 anos</span> atua dentro de empresas, estruturando gestão ao lado do dono e transformando problemas de operação em decisões práticas.</p></Reveal><Reveal delay={240}><p>Ao longo dessa trajetória, já participou da estruturação de <span className="text-[#D97945]">mais de 450 empresas</span> em <span className="text-[#D97945]">10 estados</span>, atendendo negócios de diferentes portes e acumulando <span className="text-[#D97945]">mais de R$ 100 milhões em lucro gerado para clientes</span>.</p></Reveal><Reveal delay={300}><p>No RPM Summit, Leonardo vai colocar Pessoas, Finanças e Vendas sob uma visão construída dentro de operações reais, para ajudar você a identificar o que está travando resultado, qual prioridade precisa vir primeiro e onde sua empresa precisa ganhar estrutura para crescer com mais força e menos dependência do dono.</p></Reveal></div><div className="mt-7 grid grid-cols-2 gap-5 border-y border-[#b8734d]/20 py-5 lg:grid-cols-4">{metrics.map(([value, label], index) => <Reveal key={value} delay={340 + index * 50}><p className="rpm-display text-2xl leading-none text-[#D97945] lg:text-[1.7rem]">{value}</p><p className="mt-2 text-[0.6rem] uppercase tracking-[0.16em] text-[var(--rpm-muted)]">{label}</p></Reveal>)}</div><Reveal delay={580}><p className="rpm-display mt-6 text-xl italic leading-tight text-white/90 sm:text-2xl">Validado no caixa, não na teoria.</p></Reveal></div></Container></section>;
}

function MidCTA() { return <div className="px-6 py-10 sm:px-10 sm:py-12"><div className="mx-auto flex w-full max-w-[78rem] justify-center"><PrimaryCTA className="w-full sm:w-auto sm:min-w-56">Quero participar</PrimaryCTA></div></div>; }

function Pillars() {
  const pillars = [["01", "RAIZ", "Antes de acelerar, você precisa entender o que realmente está travando a empresa."], ["02", "PRIORIDADE", "Nem tudo precisa ser resolvido agora. Gestão é saber o que vem primeiro."], ["03", "MÉTRICA", "O que não é medido vira opinião. Números claros transformam decisão em direção."]] as const;
  return <section id="pilares" className="py-24 md:py-36"><Container><Reveal><p className="text-center text-sm font-semibold uppercase tracking-[0.32em] text-[var(--rpm-copper)] sm:text-base md:text-lg">Os três pilares</p></Reveal><ul className="mt-14 grid gap-px border-t border-white/10 md:grid-cols-3">{pillars.map(([number, title, text], index) => <li key={number} className="border-b border-white/10 py-12 md:border-b-0 md:border-r md:px-8 md:last:border-r-0"><Reveal delay={index * 140}><span className="rpm-display block text-6xl leading-none text-white/10 md:text-7xl">{number}</span><h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-white">{title}</h3><p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-[var(--rpm-muted)]">{text}</p></Reveal></li>)}</ul></Container></section>;
}

function Experience() {
  const items = [["Conteúdo de alto nível", "Discussões densas, aplicáveis e alinhadas à realidade de quem conduz uma empresa."], ["Networking estratégico", "Um ambiente desenhado para aproximar pessoas que constroem em escala."], ["Experiência premium", "Cada detalhe pensado para sustentar o nível da conversa que acontece ali."], ["Aplicação prática", "Sair com direção: o que decidir, o que estruturar e por onde começar."]] as const;
  return <section id="experiencia" className="py-24 md:py-36"><Container><div className="rpm-rule mb-20" /><div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20"><div className="lg:sticky lg:top-32 lg:self-start"><Reveal><Eyebrow>A experiência</Eyebrow></Reveal><Reveal delay={120}><p className="rpm-display mt-8 text-4xl leading-[1.08] tracking-tight text-white sm:text-5xl">Um ambiente construído<span className="block rpm-gradient-text">para gerar movimento.</span></p></Reveal><Reveal delay={220}><figure className="mt-12 hidden h-72 overflow-hidden rounded-sm border border-white/10 lg:block"><img src={LEONARDO_IMAGE} alt="Leonardo Froese em ambiente executivo" className="h-full w-full object-cover object-center brightness-[0.72] saturate-[0.55]" /></figure></Reveal></div><ul className="divide-y divide-white/10 border-y border-white/10">{items.map(([title, text], index) => <li key={title}><Reveal delay={index * 120}><div className="grid grid-cols-[auto_minmax(0,1fr)] gap-6 py-10"><span className="pt-1 text-[0.7rem] tracking-[0.25em] text-[#b8734d]/70">{String(index + 1).padStart(2, "0")}</span><div><h3 className="rpm-display text-2xl tracking-tight text-white sm:text-3xl">{title}</h3><p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-[var(--rpm-muted)]">{text}</p></div></div></Reveal></li>)}</ul></div></Container></section>;
}

function Testimonials() {
  const [active, setActive] = useState<string | null>(null);
  const videos = [["depoimento-01", "Depoimento 01", "s5Xw05eyuOM"], ["depoimento-02", "Depoimento 02", "nGj5NN4XvyM"], ["depoimento-03", "Depoimento 03", "odkL-rQqsC8"]] as const;
  return <section id="depoimentos" className="border-t border-white/10 py-24 md:py-32"><Container><Reveal delay={120} className="mx-auto mb-12 max-w-4xl text-center md:mb-16"><h2 className="rpm-display text-4xl leading-[1.08] tracking-tight text-white sm:text-5xl">Experiências que<span className="block rpm-gradient-text">merecem ser ouvidas.</span></h2></Reveal><div className="grid grid-cols-1 gap-6 lg:grid-cols-3">{videos.map(([id, title, videoId], index) => <Reveal key={id} delay={160 + index * 100}><article className="overflow-hidden rounded-sm border border-[#b8734d]/30 bg-[#292623]"><div className="relative aspect-video min-h-[202px] w-full overflow-hidden bg-black">{active === id ? <iframe className="absolute inset-0 h-full w-full border-0" src={`https://www.youtube-nocookie.com/embed/${videoId}?controls=1&playsinline=1&autoplay=1`} title={`${title} do RPM Summit`} referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /> : <button type="button" onClick={() => setActive(id)} aria-label={`Reproduzir ${title.toLowerCase()}`} className="group absolute inset-0 w-full"><img src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" /><span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#b8734d]/60 bg-black/70 text-[#d97945]"><Play className="ml-1 h-6 w-6" fill="currentColor" /></span></button>}</div><div className="flex items-center justify-between border-t border-white/10 px-5 py-4"><h3 className="text-xs font-medium uppercase tracking-[0.18em] text-white/85">{title}</h3><span className="text-xs text-[var(--rpm-muted)]">YouTube</span></div></article></Reveal>)}</div></Container></section>;
}

function EventInfo() {
  return <section id="informacoes" className="relative overflow-hidden border-t border-[#b8734d]/10 py-24 md:py-32"><Container className="max-w-4xl text-center"><Reveal><p className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--rpm-copper)] sm:text-base">Informações do evento</p></Reveal><Reveal delay={90}><div className="mt-7"><h2 className="rpm-display text-4xl leading-[0.98] tracking-tight text-white sm:text-5xl lg:text-6xl">RPM SUMMIT</h2><p className="mt-3 text-sm font-medium uppercase tracking-[0.28em] text-white/80">Cuiabá - MT</p><p className="mt-4 text-[0.68rem] font-medium uppercase tracking-[0.3em] text-[#D97945]">Raiz <span className="mx-2 text-[#b8734d]/45">•</span> Prioridade <span className="mx-2 text-[#b8734d]/45">•</span> Métrica</p></div></Reveal><div className="mt-10 border-y border-[#b8734d]/20"><div className="border-b border-[#b8734d]/15 py-6"><p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#D97945]">Data</p><p className="rpm-display mt-3 text-2xl text-white sm:text-3xl">10 de Dezembro</p></div><div className="border-b border-[#b8734d]/15 py-6"><p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#D97945]">Horário</p><p className="rpm-display mt-3 text-2xl text-white sm:text-3xl">19:30 → 22:30</p></div><div className="py-6"><p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#D97945]">Local</p><address className="mt-3 not-italic text-base leading-relaxed text-white/85 sm:text-lg">Av. Miguel Sutil, 2974<br />Pico do Amor, Cuiabá - MT<br />CEP 78065-120</address></div></div><Reveal delay={330}><p className="rpm-display mx-auto mt-8 max-w-2xl text-2xl italic leading-snug text-white sm:text-3xl">3 horas para olhar sua empresa pela raiz, definir a prioridade e decidir com base em métricas.</p></Reveal><div className="mx-auto mt-8 max-w-2xl space-y-3 border-t border-[#b8734d]/15 pt-6 text-sm leading-relaxed text-[var(--rpm-muted)]"><p>A programação e os horários poderão sofrer pequenos ajustes para garantir a melhor experiência durante o evento.</p><p className="font-medium text-white/85">Todos os detalhes e orientações para sua participação no RPM Summit serão enviados com antecedência.</p></div></Container></section>;
}

function FinalCTA() {
  return <section id="participar" className="relative overflow-hidden py-32 md:py-48"><div aria-hidden className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_110%,rgba(173,70,35,0.55),transparent_62%),radial-gradient(70%_50%_at_50%_-10%,rgba(88,60,38,0.6),transparent_70%)]" /><Container className="relative text-center"><Reveal><h2 className="rpm-display mx-auto max-w-4xl text-4xl leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-7xl">O seu próximo nível<span className="block rpm-gradient-text">não acontece por acaso.</span></h2></Reveal><Reveal delay={160}><p className="mt-8 text-base text-[var(--rpm-muted)]">Ele começa com uma decisão.</p></Reveal><Reveal delay={280}><div className="mt-12"><PrimaryCTA className="px-10 py-5 text-[0.8rem]">Quero Participar</PrimaryCTA></div></Reveal></Container></section>;
}

function Footer() {
  const links = [["Experiência", "#experiencia"], ["Para quem é", "#para-quem"], ["Pilares", "#pilares"]] as const;
  return <footer className="border-t border-white/10 py-14"><Container><div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"><div><RpmLogo className="w-32" /><p className="mt-5 text-[0.62rem] uppercase tracking-[0.38em] text-[#9f815e]">Mentalidade • Estrutura • Prosperidade</p></div><nav aria-label="Rodapé"><ul className="flex flex-wrap gap-x-8 gap-y-3 text-[0.7rem] uppercase tracking-[0.2em] text-white/65">{links.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}</ul></nav></div><div className="rpm-rule my-10 opacity-60" /><p className="text-center text-xs tracking-wide text-[var(--rpm-muted)] md:text-left">© {new Date().getFullYear()} RPM Summit. Todos os direitos reservados.</p></Container></footer>;
}

function RpmPage() {
  return (
    <div className="rpm-page min-h-screen overflow-x-hidden bg-[var(--rpm-bg)] text-white">
      <style>{`
        .rpm-page {
          --rpm-bg: #211f1d;
          --rpm-surface: #292623;
          --rpm-muted: #b8aaa0;
          --rpm-copper: #b8734d;
          --rpm-ease: cubic-bezier(0.16, 1, 0.3, 1);
          --rpm-gradient: linear-gradient(135deg, #7b3527, #b35535 55%, #c8874b);
          font-family: "Barlow", ui-sans-serif, system-ui, sans-serif;
          background: var(--rpm-bg);
        }
        .rpm-display { font-family: "Cormorant Garamond", Georgia, serif; }
        .rpm-gradient-text { color: transparent; background: linear-gradient(180deg, #f0b36f 0%, #d97945 48%, #9d4f35 100%); -webkit-background-clip: text; background-clip: text; }
        .rpm-rule { height: 1px; width: 100%; background: linear-gradient(90deg, transparent, rgba(184,115,77,.7), transparent); }
        .rpm-hero-portrait { inset: 0; }
        @media (min-width: 1024px) { .rpm-hero-portrait { inset: 0 0 0 42%; } }
        @keyframes rpm-marquee { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
        .rpm-marquee { animation: rpm-marquee 22s linear infinite; }
        @media (max-width: 640px) { .rpm-marquee { animation-duration: 18s; } }
        @media (prefers-reduced-motion: reduce) { .rpm-marquee { animation: none !important; } }
        .rpm-page a { text-decoration: none; }
      `}</style>
      <Header />
      <main>
        <Hero />
        <ScarcityTicker />
        <PainPoints />
        <Audience />
        <Guide />
        <MidCTA />
        <Pillars />
        <Experience />
        <MidCTA />
        <Testimonials />
        <EventInfo />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
