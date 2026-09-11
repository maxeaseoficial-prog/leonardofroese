import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Gauge, Play, Target, WalletCards, Workflow } from "lucide-react";
import {
  calculateDiagnostic,
  pillars,
  type PillarId,
} from "@/features/lucro-2x/diagnostic-config";
import {
  loadLiveDiagnostic,
  type LiveDiagnosticSession,
} from "@/features/lucro-2x/live-session";
import { funnelHead } from "@/features/lucro-2x/funnel-head";
import { FunnelShell } from "@/features/lucro-2x/funnel-ui";
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
} from "@/features/lucro-2x/live-content";
import "@/features/lucro-2x/live.css";

export const Route = createFileRoute("/raiox/resultado")({
  head: () => funnelHead,
  component: Result,
});

function Result() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [session, setSession] = useState<LiveDiagnosticSession | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const saved = loadLiveDiagnostic();
    if (saved.answers.length < 12 || !saved.contact.faturamento) {
      navigate({ to: "/raiox" });
    } else {
      setSession(saved);
    }
  }, [navigate]);

  if (!session) {
    return (
      <FunnelShell>
        <section className="funnel-center">
          <p className="funnel-muted">Carregando seu resultado...</p>
        </section>
      </FunnelShell>
    );
  }

  const result = calculateDiagnostic(session.answers, session.contact.faturamento);
  const getPillar = (id: PillarId) => pillars.find((pillar) => pillar.id === id)!;

  return (
    <FunnelShell>
      <article className="result-shell">
        <div className="funnel-kicker">Raio-x da gestão. {session.contact.empresa}</div>
        <section className="result-score">
          <div className="score-number">
            <strong>{result.score}</strong>
            <span>/100</span>
          </div>
          <div className="score-class">
            <small>Nível de maturidade</small>
            <div>{result.classification}</div>
          </div>
        </section>

        <section className="result-section" style={{ marginTop: 30 }}>
          <div className="funnel-kicker" style={{ color: "rgba(245,243,238,.62)" }}>
            Nota por pilar
          </div>
          <div className="pillar-list">
            {pillars.map((pillar) => (
              <div key={pillar.id}>
                <div className="pillar-head">
                  <span>{pillar.name}</span>
                  <output>{result.scores[pillar.id]}</output>
                </div>
                <div className="pillar-track">
                  <div
                    className="pillar-bar"
                    style={{
                      width: `${result.scores[pillar.id]}%`,
                      background:
                        result.scores[pillar.id] < 45
                          ? "#c1663e"
                          : "linear-gradient(90deg,#c19a3e,#e0c176)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="result-grid result-section" style={{ marginTop: 32 }}>
          {result.bottlenecks.map((id, index) => {
            const pillar = getPillar(id);
            return (
              <div className={index === 0 ? "result-card-gold" : "result-card"} key={id}>
                <div
                  className="funnel-kicker"
                  style={{ color: index === 0 ? undefined : "rgba(245,243,238,.62)" }}
                >
                  {index === 0 ? "Principal gargalo" : "Segundo gargalo"}
                </div>
                <h3 className="funnel-serif">{pillar.name}</h3>
                <p>{pillar.consequence}</p>
              </div>
            );
          })}
        </section>

        <section className="result-card result-section" style={{ marginTop: 32, padding: 24 }}>
          <div className="funnel-kicker" style={{ color: "rgba(245,243,238,.62)" }}>
            Vazamento estimado por ano
          </div>
          <h2 className="funnel-serif" style={{ margin: "12px 0 10px", color: "#e8d5a6" }}>
            {result.leakage}
          </h2>
          <p>
            Estimativa baseada em padrão observado em empresas com o mesmo nível de maturidade. Não
            substitui auditoria.
          </p>
        </section>
      </article>

      <div className="live-experience">
        <RevealBlock className="live-transition">
          <div className="funnel-kicker">{transitionCopy.kicker}</div>
          <h2 className="funnel-serif">{transitionCopy.title}</h2>
          <p>{transitionCopy.subtitle}</p>
          <div className="live-arrow" aria-hidden="true" />
        </RevealBlock>

        <RevealBlock className="live-block">
          <div className="live-heading">
            <div className="funnel-kicker">Live Lucro 2X</div>
            <h2 className="funnel-serif">Veja como transformar diagnóstico em direção.</h2>
            <p>
              Assista à apresentação da Live Lucro 2X e entenda a proposta antes de decidir
              participar.
            </p>
          </div>
          <VideoFrame url={vslYoutubeUrl} label="VSL da Live Lucro 2X" featured />
          <div className="live-cta-wrap">
            {checkoutUrl ? (
              <a className="live-cta" href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                Quero participar
              </a>
            ) : (
              <button className="live-cta" type="button" disabled>
                Quero participar
              </button>
            )}
            {!checkoutUrl && <p className="live-cta-note">Inscrições serão liberadas em breve.</p>}
          </div>
        </RevealBlock>

        <RevealBlock className="live-block">
          <div className="live-heading">
            <div className="funnel-kicker">{liveIntro.kicker}</div>
            <h2 className="funnel-serif">{liveIntro.title}</h2>
            <p>{liveIntro.copy}</p>
          </div>
          <div className="live-areas">
            {liveAreas.map((area, index) => {
              const Icon = iconForArea(area.icon);
              return (
                <motion.article
                  className="live-area"
                  key={area.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : index * 0.06 }}
                >
                  <Icon size={24} strokeWidth={1.6} aria-hidden="true" />
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                </motion.article>
              );
            })}
          </div>
        </RevealBlock>

        <RevealBlock className="live-block">
          <div className="live-heading">
            <div className="funnel-kicker">O que vai ter na Live</div>
            <h2 className="funnel-serif">Do diagnóstico ao plano de ação.</h2>
            <p>
              Uma trajetória clara para conectar os gargalos encontrados no seu raio-x às decisões
              que precisam entrar na pauta da empresa.
            </p>
          </div>
          <div className="live-timeline">
            <motion.div
              className="live-timeline-line"
              aria-hidden="true"
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduceMotion ? 0 : 0.9 }}
            />
            {liveTimeline.map((item, index) => (
              <motion.article
                className="live-step"
                key={item.step}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: reduceMotion ? 0 : 0.48, delay: reduceMotion ? 0 : index * 0.08 }}
              >
                <div className="live-step-num">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.article>
            ))}
          </div>
        </RevealBlock>

        <RevealBlock className="live-block">
          <div className="live-heading">
            <div className="funnel-kicker">Resultados na prática</div>
            <h2 className="funnel-serif">Experiências de quem já viveu a transformação.</h2>
            <p>Os depoimentos em vídeo serão adicionados aqui.</p>
          </div>
          <div className="live-testimonials">
            {testimonialVideos.map((video) => (
              <VideoFrame key={video.label} url={video.url} label={video.label} />
            ))}
          </div>
        </RevealBlock>

        <RevealBlock className="live-block" delay={0.04}>
          <div className="live-heading">
            <div className="funnel-kicker">Dúvidas frequentes</div>
            <h2 className="funnel-serif">Antes de participar.</h2>
          </div>
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
                    <ChevronDown size={18} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                  {isOpen && (
                    <motion.div
                      id={answerId}
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: reduceMotion ? 0 : 0.24 }}
                    >
                      <p className="live-faq-a">{faq.answer}</p>
                    </motion.div>
                  )}
                </article>
              );
            })}
          </div>
        </RevealBlock>
      </div>
    </FunnelShell>
  );
}

function RevealBlock({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.section
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.58, delay: reduceMotion ? 0 : delay }}
    >
      {children}
    </motion.section>
  );
}

function VideoFrame({
  url,
  label,
  featured = false,
}: {
  url: string;
  label: string;
  featured?: boolean;
}) {
  const id = youtubeId(url);
  const className = `live-frame ${featured ? "live-frame-vsl" : "live-frame-small"}`;

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
          <div className="live-play" aria-hidden="true">
            <Play size={featured ? 26 : 20} fill="currentColor" strokeWidth={1.4} />
          </div>
          <strong>{label}</strong>
          <span>Vídeo será adicionado aqui</span>
        </div>
      )}
    </div>
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
