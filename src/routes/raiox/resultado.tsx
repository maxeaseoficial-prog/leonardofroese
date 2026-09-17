import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { LiveExperience } from "@/features/lucro-2x/live-experience";

export const Route = createFileRoute("/raiox/resultado")({
  head: () => funnelHead,
  component: Result,
});

function Result() {
  const navigate = useNavigate();
  const [session, setSession] = useState<LiveDiagnosticSession | null>(null);

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

      <LiveExperience />
    </FunnelShell>
  );
}
