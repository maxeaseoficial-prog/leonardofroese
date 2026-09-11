import {
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Gauge,
  Layers3,
  Play,
  Settings2,
  Target,
  WalletCards,
  Workflow,
} from "lucide-react";
import {
  checkoutUrl,
  liveAreas,
  liveFaqs,
  liveIntro,
  liveTimeline,
  testimonialVideos,
  transitionCopy,
  vslYoutubeUrl,
  youtubeId,
} from "./live-content";
import faqPhotoOne from "@/assets/leonardo-DSC00683.jpg.asset.json";
import faqPhotoTwo from "@/assets/leonardo-DSC01026.jpg.asset.json";
import faqPhotoThree from "@/assets/leonardo-DSC00784.jpg.asset.json";
import "./live.css";

const timelineIcons = [Play, Layers3, BarChart3, Target, Workflow, Gauge, Settings2, WalletCards, Clock3];

export function LiveExperience() {
  const reduceMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);

  const goTimeline = (index: number) => {
    const clamped = Math.max(0, Math.min(liveTimeline.length - 1, index));
    setTimelineIndex(clamped);
    const node = timelineRef.current?.querySelector<HTMLElement>(`[data-timeline-index="${clamped}"]`);
    node?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  };

  const goTestimonial = (index: number) => {
    const clamped = Math.max(0, Math.min(testimonialVideos.length - 1, index));
    setTestimonialIndex(clamped);
    const node = testimonialRef.current?.querySelector<HTMLElement>(`[data-testimonial-index="${clamped}"]`);
    node?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  };

  return (
    <div className="live-experience">
      <div className="live-ambient live-ambient-a" aria-hidden="true" />
      <div className="live-ambient live-ambient-b" aria-hidden="true" />

      <RevealBlock className="live-transition">
        <div className="live-eyebrow">{transitionCopy.kicker}</div>
        <h2 className="live-display">{transitionCopy.title}</h2>
        <p>{transitionCopy.subtitle}</p>
        <div className="live-transition-line" aria-hidden="true" />
      </RevealBlock>

      <RevealBlock className="live-section live-vsl-section">
        <SectionHeading
          eyebrow="Live Lucro 2X"
          title="Descubra onde o lucro vaza — e o que fazer com essa informação."
          copy="O Raio-X mostrou a percepção. Agora entram os números reais da sua empresa para identificar os drenos, entender a causa e tomar uma decisão prática."
          centered
        />
        <VideoFrame url={vslYoutubeUrl} label="VSL da Live Lucro 2X" featured />
        <ParticipationCta />
      </RevealBlock>

      <RevealBlock className="live-section live-section-framed">
        <SectionHeading eyebrow={liveIntro.kicker} title={liveIntro.title} copy={liveIntro.copy} centered />
        <div className="live-areas">
          {liveAreas.map((area, index) => {
            const Icon = iconForArea(area.icon);
            return (
              <motion.article
                key={area.title}
                className="live-area live-glow-card"
                onMouseMove={trackPointer}
                initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={reduceMotion ? undefined : { y: -8, scale: 1.012 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : index * 0.07 }}
              >
                <div className="live-icon-box"><Icon size={26} strokeWidth={1.55} /></div>
                <h3 className="live-card-title">{area.title}</h3>
                <span className="live-gold-dash" aria-hidden="true" />
                <p>{area.description}</p>
              </motion.article>
            );
          })}
        </div>
      </RevealBlock>

      <RevealBlock className="live-section live-timeline-section">
        <SectionHeading
          eyebrow="Roteiro da Live"
          title="Cerca de 2 horas para sair da percepção e chegar a uma decisão."
          copy="Você entra com faturamento, lucro e caixa do último mês e percorre o Mapa de Drenagem até identificar a causa dominante e definir uma decisão para os próximos 7 dias."
          centered
        />

        <div className="live-carousel-wrap live-timeline-wrap">
          <button
            className="live-carousel-arrow live-carousel-arrow-left"
            onClick={() => goTimeline(timelineIndex - 1)}
            disabled={timelineIndex === 0}
            aria-label="Etapa anterior"
          >
            <ChevronLeft />
          </button>
          <div className="live-timeline-scroll" ref={timelineRef}>
            {liveTimeline.map((item, index) => {
              const Icon = timelineIcons[index % timelineIcons.length];
              return (
                <motion.article
                  key={`${item.step}-${item.title}`}
                  data-timeline-index={index}
                  className={`live-timeline-card live-glow-card ${timelineIndex === index ? "is-active" : ""}`}
                  onMouseMove={trackPointer}
                  onClick={() => setTimelineIndex(index)}
                  initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : Math.min(index, 4) * 0.05 }}
                >
                  <span className="live-timeline-number">{index + 1}</span>
                  <div className="live-timeline-icon"><Icon size={36} strokeWidth={1.45} /></div>
                  <div className="live-timeline-time"><Clock3 size={15} /> {item.step}</div>
                  <span className="live-timeline-rule" />
                  <h3 className="live-card-title">{item.title}</h3>
                  <p>{item.description}</p>
                </motion.article>
              );
            })}
          </div>
          <button
            className="live-carousel-arrow live-carousel-arrow-right"
            onClick={() => goTimeline(timelineIndex + 1)}
            disabled={timelineIndex === liveTimeline.length - 1}
            aria-label="Próxima etapa"
          >
            <ChevronRight />
          </button>
        </div>
        <div className="live-carousel-status" aria-label="Navegação do roteiro">
          <div className="live-dots">
            {liveTimeline.map((item, index) => (
              <button
                key={`${item.step}-${index}`}
                className={timelineIndex === index ? "is-active" : ""}
                onClick={() => goTimeline(index)}
                aria-label={`Ir para etapa ${index + 1}`}
              />
            ))}
          </div>
          <span>{timelineIndex + 1} / {liveTimeline.length}</span>
        </div>
      </RevealBlock>

      <RevealBlock className="live-section live-proof-section">
        <div className="live-proof-heading-row">
          <SectionHeading
            eyebrow="Prova real"
            title="Resultados construídos na prática."
            copy="Os depoimentos reais em vídeo entram aqui assim que os links e autorizações forem definidos."
          />
          <span className="live-proof-side-note">Empresários reais.<br />Resultados reais.</span>
        </div>

        <div className="live-carousel-wrap live-proof-wrap">
          <button
            className="live-carousel-arrow live-carousel-arrow-left"
            onClick={() => goTestimonial(testimonialIndex - 1)}
            disabled={testimonialIndex === 0}
            aria-label="Depoimento anterior"
          >
            <ChevronLeft />
          </button>
          <div className="live-testimonial-scroll" ref={testimonialRef}>
            {testimonialVideos.map((video, index) => (
              <motion.article
                key={video.label}
                data-testimonial-index={index}
                className={`live-proof-card live-glow-card ${testimonialIndex === index ? "is-active" : ""}`}
                onMouseMove={trackPointer}
                onClick={() => setTestimonialIndex(index)}
                whileHover={reduceMotion ? undefined : { y: -5 }}
              >
                <VideoFrame url={video.url} label={video.label} compact />
                <div className="live-proof-copy">
                  <div className="live-proof-index">0{index + 1}<span /></div>
                  <h3>Depoimento em vídeo</h3>
                  <p>Espaço preparado para um case real da Cáliber, sem inserir números ou promessas antes da validação do material.</p>
                  <small>{video.label}</small>
                </div>
              </motion.article>
            ))}
          </div>
          <button
            className="live-carousel-arrow live-carousel-arrow-right"
            onClick={() => goTestimonial(testimonialIndex + 1)}
            disabled={testimonialIndex === testimonialVideos.length - 1}
            aria-label="Próximo depoimento"
          >
            <ChevronRight />
          </button>
        </div>
        <div className="live-dots live-proof-dots">
          {testimonialVideos.map((video, index) => (
            <button
              key={`${video.label}-dot`}
              className={testimonialIndex === index ? "is-active" : ""}
              onClick={() => goTestimonial(index)}
              aria-label={`Ir para depoimento ${index + 1}`}
            />
          ))}
        </div>
      </RevealBlock>

      <RevealBlock className="live-section live-faq-section">
        <div className="live-faq-layout">
          <div className="live-faq-collage" aria-label="Fotos de Leonardo Froese">
            <motion.img
              src={faqPhotoOne.url}
              alt="Leonardo Froese"
              className="live-faq-photo live-faq-photo-a"
              whileHover={reduceMotion ? undefined : { scale: 1.025, y: -4 }}
            />
            <motion.img
              src={faqPhotoTwo.url}
              alt="Leonardo Froese"
              className="live-faq-photo live-faq-photo-b"
              whileHover={reduceMotion ? undefined : { scale: 1.025, y: -4 }}
            />
            <motion.img
              src={faqPhotoThree.url}
              alt="Leonardo Froese"
              className="live-faq-photo live-faq-photo-c"
              whileHover={reduceMotion ? undefined : { scale: 1.025, y: -4 }}
            />
          </div>

          <div className="live-faq-panel">
            <SectionHeading eyebrow="Dúvidas frequentes" title="Antes de participar." />
            <div className="live-faq">
              {liveFaqs.map((faq, index) => {
                const isOpen = openFaq === index;
                const answerId = `live-faq-answer-${index}`;
                return (
                  <article className="live-faq-item" data-open={isOpen} key={faq.question}>
                    <button
                      className="live-faq-q"
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown size={20} strokeWidth={1.7} />
                    </button>
                    <motion.div
                      id={answerId}
                      initial={false}
                      animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.26 }}
                      className="live-faq-answer-wrap"
                    >
                      <p className="live-faq-a">{faq.answer}</p>
                    </motion.div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
        <ParticipationCta final />
      </RevealBlock>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  centered?: boolean;
}) {
  return (
    <div className={`live-heading ${centered ? "is-centered" : ""}`}>
      <div className="live-eyebrow"><span />{eyebrow}<span /></div>
      <h2 className="live-display">{highlightTitle(title)}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

function highlightTitle(title: string) {
  const highlights = ["sem ser o herói dela.", "2 horas", "na prática.", "participar."];
  const highlight = highlights.find((piece) => title.includes(piece));
  if (!highlight) return title;
  const [before, after = ""] = title.split(highlight);
  return <>{before}<em>{highlight}</em>{after}</>;
}

function ParticipationCta({ final = false }: { final?: boolean }) {
  const content = (
    <>
      <span>Quero participar</span>
      <ArrowRight size={21} strokeWidth={1.8} />
    </>
  );
  return (
    <div className={`live-cta-wrap ${final ? "is-final" : ""}`}>
      {checkoutUrl ? (
        <motion.a
          className={`live-cta ${final ? "live-cta-gold" : "live-cta-green"}`}
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
        >
          {content}
        </motion.a>
      ) : (
        <button className={`live-cta ${final ? "live-cta-gold" : "live-cta-green"}`} type="button" disabled>
          {content}
        </button>
      )}
      {!checkoutUrl && !final ? (
        <p className="live-cta-note">Investimento da Live: R$ 97. O link de inscrição será liberado em breve.</p>
      ) : null}
    </div>
  );
}

function VideoFrame({
  url,
  label,
  featured = false,
  compact = false,
}: {
  url: string;
  label: string;
  featured?: boolean;
  compact?: boolean;
}) {
  const id = youtubeId(url);
  const className = `live-frame ${featured ? "live-frame-vsl" : ""} ${compact ? "live-frame-compact" : ""}`;
  return (
    <div className={className}>
      {id ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
          title={label}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <div className="live-placeholder">
          <div className="live-play"><Play size={featured ? 28 : 22} fill="currentColor" strokeWidth={1.3} /></div>
          <strong>{label}</strong>
          <span>Vídeo será adicionado aqui</span>
        </div>
      )}
    </div>
  );
}

function RevealBlock({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 34, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

function iconForArea(icon: string) {
  switch (icon) {
    case "wallet":
      return WalletCards;
    case "target":
      return Target;
    case "workflow":
      return Workflow;
    case "gauge":
      return Gauge;
    default:
      return Gauge;
  }
}

function trackPointer(event: ReactMouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
}
