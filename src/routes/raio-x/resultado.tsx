import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
          <h2 className="funnel-serif">Você já enxergou o vazamento. Agora é hora de agir.</h2>
          <p className="result-copy">
            Na Live Lucro 2x, você aprofunda o diagnóstico, identifica os principais drenos de lucro
            da sua empresa, recebe o material de apoio e sai com um plano prático para aplicar.
          </p>
          <a
            className="funnel-primary result-cta live-result-cta"
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
      </article>
    </FunnelShell>
  );
}
