import {
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Play,
  ShieldCheck,
  Target,
  Workflow,
  X,
} from "lucide-react";
import {
  audienceFit,
  checkoutUrl,
  conductor,
  finalCta,
  liveFaqs,
  liveIntro,
  liveOutcome,
  liveTimeline,
  offer,
  proofCopy,
  structuralDebt,
  testimonialVideos,
  transitionCopy,
  vslYoutubeUrl,
  youtubeId,
} from "./live-content";
import faqPhotoOne from "@/assets/leonardo-DSC00683.jpg.asset.json";
import faqPhotoTwo from "@/assets/leonardo-DSC01026.jpg.asset.json";
import faqPhotoThree from "@/assets/leonardo-DSC00784.jpg.asset.json";
import "./live.css";
import "./live-fixes.css";

const timelineIcons = [BarChart3, Target, Workflow];

export function LiveExperience() {
  const reduceMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
          eyebrow={liveIntro.kicker}
          title={liveIntro.title}
          copy={liveIntro.copy}
          centered
        />
        <VideoFrame url={vslYoutubeUrl} label="VSL da Live Lucro 2X" featured />
        <div className="live-meta-row">
          <span>{liveIntro.meta}</span>
          <span>{liveIntro.payment}</span>
        </div>
        <ParticipationCta />
      </RevealBlock>

      <RevealBlock className="live-section live-fit-section">
        <SectionHeading
          eyebrow="Antes de participar"
          title={audienceFit.title}
          copy="A Live foi desenhada para empresários que já têm equipe e precisam transformar crescimento em estrutura, lucro e autonomia."
        />
        <div className="live-fit-grid">
          <article className="live-fit-card is-yes">
            <h3>{audienceFit.yesTitle}</h3>
            <ul>
              {audienceFit.yes.map((item) => (
                <li key={item}><Check size={17} /> <span>{item}</span></li>
              ))}
            </ul>
          </article>
          <article className="live-fit-card is-no">
            <h3>{audienceFit.noTitle}</h3>
            <ul>
              {audienceFit.no.map((item) => (
                <li key={item}><X size={17} /> <span>{item}</span></li>
              ))}
            </ul>
          </article>
        </div>
      </RevealBlock>

      <RevealBlock className="live-section live-debt-section">
        <SectionHeading
          eyebrow={structuralDebt.kicker}
          title={structuralDebt.title}
          copy={structuralDebt.copy}
          centered
        />
        <div className="live-debt-flow" aria-hidden="true">
          <span>Faturamento</span>
          <div className="live-debt-pipe"><i /><i /><i /><i /></div>
          <span>Lucro que fica</span>
        </div>
        <div className="live-debt-grid">
          {structuralDebt.scenarios.map((scenario) => (
            <motion.article
              key={scenario.title}
              className="live-debt-card live-glow-card"
              onMouseMove={trackPointer}
              whileHover={reduceMotion ? undefined : { y: -5 }}
            >
              <h3>{scenario.title}</h3>
              <p>{scenario.description}</p>
            </motion.article>
          ))}
        </div>
        <p className="live-debt-closing">{structuralDebt.closing}</p>
      </RevealBlock>

      <RevealBlock className="live-section live-timeline-section">
        <SectionHeading
          eyebrow="O que acontece nas 2 horas"
          title="Você trabalha nos seus próprios números e sai sabendo onde agir primeiro."
          copy="A sequência é prática: entender o número, localizar o vazamento e identificar a causa."
          centered
        />

        <div
          style={{
            width: "min(100%, 1120px)",
            margin: "48px auto 0",
            paddingTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          {liveTimeline.map((item, index) => {
            const Icon = timelineIcons[index % timelineIcons.length];
            return (
              <motion.article
                key={`${item.step}-${item.title}`}
                className="live-timeline-card live-glow-card"
                onMouseMove={trackPointer}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: reduceMotion ? 0 : 0.36, delay: reduceMotion ? 0 : index * 0.05 }}
              >
                <span className="live-timeline-number">{index + 1}</span>
                <div className="live-timeline-icon"><Icon size={36} strokeWidth={1.45} /></div>
                <div className="live-timeline-time">{item.step}</div>
                <span className="live-timeline-rule" />
                <h3 className="live-card-title">{item.title}</h3>
                <p>{item.description}</p>
              </motion.article>
            );
          })}
        </div>
        <div className="live-outcome-card">
          <strong>{liveOutcome.title}</strong>
          <span>{liveOutcome.note}</span>
        </div>
        <ParticipationCta />
      </RevealBlock>

      <RevealBlock className="live-section live-conductor-section">
        <div className="live-conductor-grid">
          <motion.img
            src={faqPhotoThree.url}
            alt="Leonardo Froese"
            className="live-conductor-photo"
            whileHover={reduceMotion ? undefined : { scale: 1.015 }}
          />
          <div>
            <SectionHeading eyebrow={conductor.kicker} title={conductor.title} copy={conductor.copy} />
            <div className="live-stats-grid">
              {conductor.stats.map((stat) => (
                <div className="live-stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealBlock>

      <RevealBlock className="live-section live-proof-section">
        <div className="live-proof-heading-row">
          <SectionHeading eyebrow={proofCopy.kicker} title={proofCopy.title} copy={proofCopy.copy} />
          <span className="live-proof-side-note">Empresários reais.<br />Resultados reais.</span>
        </div>

        <div className="live-testimonial-grid">
          {testimonialVideos.map((video, index) => (
            <motion.article
              key={video.label}
              className="live-proof-card live-glow-card"
              onMouseMove={trackPointer}
              whileHover={reduceMotion ? undefined : { y: -5 }}
            >
              <VideoFrame url={video.url} label={video.label} compact />
              <div className="live-proof-copy">
                <div className="live-proof-index">0{index + 1}<span /></div>
                <h3>Depoimento em vídeo</h3>
                <p>Espaço reservado para um caso real autorizado, com contexto, empresa e o que mudou na prática.</p>
                <small>{video.label}</small>
              </div>
            </motion.article>
          ))}
        </div>
      </RevealBlock>

      <RevealBlock className="live-section live-offer-section">
        <SectionHeading eyebrow={offer.kicker} title={offer.title} centered />
        <div className="live-offer-grid">
          <div className="live-offer-includes">
            <h3>O que está incluído</h3>
            <ul>
              {offer.includes.map((item) => (
                <li key={item}><Check size={18} /><span>{item}</span></li>
              ))}
            </ul>
          </div>
          <div className="live-offer-price">
            <small>Investimento</small>
            <strong>{offer.price}</strong>
            <span>{offer.payment}</span>
            <ParticipationCta />
          </div>
        </div>
        <div className="live-guarantee">
          <ShieldCheck size={30} />
          <div>
            <strong>{offer.guaranteeTitle}</strong>
            <p>{offer.guaranteeCopy}</p>
          </div>
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
                    {isOpen ? (
                      <motion.div
                        id={answerId}
                        initial={reduceMotion ? false : { opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.08 }}
                        className="live-faq-answer-wrap"
                      >
                        <p className="live-faq-a">{faq.answer}</p>
                      </motion.div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </RevealBlock>

      <RevealBlock className="live-section live-final-section">
        <SectionHeading eyebrow={finalCta.kicker} title={finalCta.title} copy={finalCta.copy} centered />
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
  const highlights = ["sem ser o herói dela", "dívida estrutural.", "nos próximos 7 dias", "estrutura funciona", "2 horas"];
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
          whileHover={{ y: -2, scale: 1.006 }}
          whileTap={{ scale: 0.988 }}
        >
          {content}
        </motion.a>
      ) : (
        <button className={`live-cta ${final ? "live-cta-gold" : "live-cta-green"}`} type="button" disabled>
          {content}
        </button>
      )}
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
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: reduceMotion ? 0 : 0.46, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

function trackPointer(event: ReactMouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
}
