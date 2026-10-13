import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BarChart3, FileText, Search, Star, Target, Video } from "lucide-react";
import { calculateDiagnostic, pillars, type PillarId } from "@/features/lucro-2x/diagnostic-config";
import {
  buildCheckoutUrl,
  loadDiagnostic,
  type DiagnosticSession,
} from "@/features/lucro-2x/diagnostic-session";
import { funnelHead } from "@/features/lucro-2x/funnel-head";
import { FunnelShell } from "@/features/lucro-2x/funnel-ui";
import { checkoutUrl } from "@/features/lucro-2x/live-content";
import leonardoPhoto from "@/assets/leonardo-DSC01026.jpg.asset.json";

export const Route = createFileRoute("/raio-x/resultado")({
  head: () => funnelHead,
  component: Result,
});

const testimonialVideos = [
  {
    title: "Depoimento 01",
    embedUrl: "https://www.youtube-nocookie.com/embed/nGj5NN4XvyM?rel=0&playsinline=1",
    format: "landscape",
  },
  {
    title: "Depoimento 02",
    embedUrl: "https://www.youtube-nocookie.com/embed/odkL-rQqsC8?rel=0&playsinline=1",
    format: "short",
  },
  {
    title: "Depoimento 03",
    embedUrl: "https://www.youtube-nocookie.com/embed/s5Xw05eyuOM?rel=0&playsinline=1",
    format: "short",
  },
] as const;

function Result() {
  const navigate = useNavigate();
  const [session, setSession] = useState<DiagnosticSession | null>(null);

  useEffect(() => {
    const saved = loadDiagnostic();
    if (saved.answers.length < 12 || !saved.contact.faturamento) navigate({ to: "/raio-x" });
    else setSession(saved);
  }, [navigate]);

  if (!session)
    return (
      <FunnelShell>
        <section className="funnel-center">
          <p className="funnel-muted">Carregando seu resultado...</p>
        </section>
      </FunnelShell>
    );

  const result = calculateDiagnostic(session.answers, session.contact.faturamento);
  const getPillar = (id: PillarId) => pillars.find((pillar) => pillar.id === id)!;
  const liveCheckout = buildCheckoutUrl(checkoutUrl, session.contact);

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
            {pillars.map((p) => (
              <div key={p.id}>
                <div className="pillar-head">
                  <span>{p.name}</span>
                  <output>{result.scores[p.id]}</output>
                </div>
                <div className="pillar-track">
                  <div
                    className="pillar-bar"
                    style={{
                      width: `${result.scores[p.id]}%`,
                      background:
                        result.scores[p.id] < 45
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
            const p = getPillar(id);
            return (
              <div className={index === 0 ? "result-card-gold" : "result-card"} key={id}>
                <div
                  className="funnel-kicker"
                  style={{ color: index === 0 ? undefined : "rgba(245,243,238,.62)" }}
                >
                  {index === 0 ? "Principal gargalo" : "Segundo gargalo"}
                </div>
                <h3 className="funnel-serif">{p.name}</h3>
                <p>{p.consequence}</p>
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

        <section className="result-divider result-live-cta">
          <div className="funnel-kicker">Próximo passo</div>
          <h2 className="funnel-serif">Do diagnóstico à ação.</h2>
          <p className="result-copy result-step-intro">
            Você já identificou onde o lucro pode estar escapando. Agora o caminho é transformar
            esse diagnóstico em execução.
          </p>

          <div className="result-progress" aria-label="Jornada até a Live Lucro 2x">
            <div className="result-progress-track" aria-hidden="true">
              <div className="result-progress-fill" />
            </div>

            <div className="result-progress-points">
              <div className="result-progress-step result-progress-step--done">
                <div className="result-progress-node" aria-hidden="true">✓</div>
                <span className="result-progress-status">Concluído</span>
                <strong>Enxergar o vazamento</strong>
                <p>Raio-X concluído.</p>
              </div>

              <div className="result-progress-step result-progress-step--active">
                <div className="result-progress-node" aria-hidden="true">2</div>
                <span className="result-progress-status">Agora</span>
                <strong>Hora de agir</strong>
                <p>Transformar diagnóstico em decisão.</p>
              </div>

              <div className="result-progress-step result-progress-step--next">
                <div className="result-progress-node result-progress-node--play" aria-hidden="true">▶</div>
                <span className="result-progress-status">Próximo passo</span>
                <strong>Live Lucro 2x</strong>
                <p>Material, diagnóstico e plano prático.</p>
              </div>
            </div>
          </div>

        </section>

        <section className="result-section lucro2x-section" aria-labelledby="lucro2x-title">
          <div className="lucro2x-grid">
            <div className="lucro2x-cover-card" aria-label="Cáliber Lucro 2x">
              <img
                src="/images/lucro-2x-cover.webp"
                alt="Cáliber Lucro 2x — Diagnóstico e Plano de Estruturação Empresarial"
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="lucro2x-content">
              <h2 id="lucro2x-title" className="funnel-serif">
                O que é o <em>Lucro 2x?</em>
              </h2>

              <h3>Lucre mais. Sem precisar vender mais.</h3>
              <p className="lucro2x-lead">
                Descubra onde o lucro da sua empresa está vazando e saia com um plano prático para
                começar a corrigir.
              </p>

              <div className="lucro2x-feature-grid">
                <article className="lucro2x-feature">
                  <div className="lucro2x-feature-icon"><Video size={22} strokeWidth={1.8} /></div>
                  <div>
                    <strong>Live ao vivo de 2 horas</strong>
                    <p>Um encontro intenso, direto ao ponto, para diagnosticar os principais drenos de lucro da sua empresa.</p>
                  </div>
                </article>

                <article className="lucro2x-feature">
                  <div className="lucro2x-feature-icon"><Search size={22} strokeWidth={1.8} /></div>
                  <div>
                    <strong>Diagnóstico dos vazamentos</strong>
                    <p>Entenda onde o dinheiro está sumindo, o que está travando a operação e quais problemas mais drenam resultado.</p>
                  </div>
                </article>

                <article className="lucro2x-feature">
                  <div className="lucro2x-feature-icon"><FileText size={22} strokeWidth={1.8} /></div>
                  <div>
                    <strong>Material de apoio</strong>
                    <p>Acompanhe a live com apoio prático para organizar ideias, anotar prioridades e estruturar decisões.</p>
                  </div>
                </article>

                <article className="lucro2x-feature">
                  <div className="lucro2x-feature-icon"><BarChart3 size={22} strokeWidth={1.8} /></div>
                  <div>
                    <strong>Plano prático para aplicar</strong>
                    <p>Saia da live com clareza sobre o que corrigir primeiro e com os próximos passos para começar a agir.</p>
                  </div>
                </article>

                <article className="lucro2x-feature lucro2x-feature--wide">
                  <div className="lucro2x-feature-icon"><Target size={22} strokeWidth={1.8} /></div>
                  <div>
                    <strong>Sem precisar vender mais</strong>
                    <p>O foco é melhorar lucro, estrutura e execução antes de depender apenas de mais vendas.</p>
                  </div>
                </article>
              </div>

              <div className="lucro2x-highlight">
                <div className="lucro2x-highlight-main">
                  <Star size={19} fill="currentColor" />
                  <strong>Ao final, você sai com um plano prático.</strong>
                </div>
                <p>Ideal para empresários que faturam, mas sentem que o lucro não aparece.</p>
              </div>
            </div>
          </div>

          <a
            className="funnel-primary result-cta live-result-cta lucro2x-main-cta"
            href={liveCheckout}
            target="_blank"
            rel="noopener noreferrer"
          >
            Quero minha vaga na live
          </a>
        </section>

        <section className="result-card result-section result-host" style={{ padding: 0 }}>
          <div className="result-host-photo">
            <img src={leonardoPhoto.url} alt="Leonardo Froese" />
          </div>

          <div className="result-host-content">
            <div className="funnel-kicker">Quem conduz</div>
            <h3 className="funnel-serif">Leonardo Froese, Cáliber Gestão Empresarial</h3>
            <p className="result-copy" style={{ marginTop: 0 }}>
              Empresário há 19 anos, Leonardo atua na estruturação de empresas na prática, com foco em
              gestão, lucro e execução.
            </p>

            <div className="stat-grid result-host-stats">
              {[
                ["19", "anos de experiência"],
                ["450+", "empresas estruturadas"],
                ["12.000+", "pessoas treinadas"],
                ["10", "estados atendidos"],
                ["R$ 100 mi+", "em lucro gerado para clientes"],
              ].map(([v, l]) => (
                <div className="stat" key={l}>
                  <strong>{v}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="result-section result-testimonials" aria-labelledby="testimonial-title">
          <div className="result-testimonials-head">
            <div className="funnel-kicker">Depoimentos</div>
            <h2 id="testimonial-title" className="funnel-serif">
              Resultados contados por quem viveu na prática.
            </h2>
            <p className="result-copy">
              Assista aos depoimentos sem sair desta página.
            </p>
          </div>

          <div className="testimonial-video-grid">
            {testimonialVideos.map((video) => (
              <article
                className="testimonial-video-card"
                key={video.embedUrl}
              >
                <div className="testimonial-video-top">
                  <span className="testimonial-video-badge">{video.title}</span>
                  <span className="testimonial-video-dot" aria-hidden="true" />
                </div>
                <div className="testimonial-video-frame">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </article>
            ))}
          </div>

          <a
            className="funnel-primary result-cta live-result-cta testimonial-live-cta"
            href={liveCheckout}
            target="_blank"
            rel="noopener noreferrer"
          >
            Quero minha vaga na live
          </a>
        </section>
      </article>
    </FunnelShell>
  );
}
