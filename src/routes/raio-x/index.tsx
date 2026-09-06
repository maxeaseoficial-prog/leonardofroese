import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { loadDiagnostic } from "@/features/lucro-2x/diagnostic-session";
import { funnelHead } from "@/features/lucro-2x/funnel-head";
import { FunnelShell } from "@/features/lucro-2x/funnel-ui";

export const Route = createFileRoute("/raio-x/")({ head: () => funnelHead, component: Opening });

function Opening() {
  useEffect(() => {
    loadDiagnostic();
  }, []);
  return (
    <FunnelShell>
      <section className="funnel-center">
        <div className="funnel-logo">Cáliber</div>
        <div className="funnel-rule" />
        <h1 className="funnel-serif funnel-title">
          Onde o lucro da sua empresa está <em>vazando</em>?
        </h1>
        <p className="funnel-intro funnel-muted">
          Responda 12 perguntas em 2 minutos e receba o raio-x da sua gestão: score de maturidade,
          seus dois maiores gargalos e a estimativa de quanto você deixa na mesa todo ano.
        </p>
        <div className="funnel-badges">
          <span className="funnel-badge">12 perguntas</span>
          <span className="funnel-badge">2 minutos</span>
          <span className="funnel-badge">Resultado na hora</span>
        </div>
        <Link
          to="/raio-x/perguntas"
          className="funnel-primary"
          style={{ maxWidth: 340, marginTop: 28 }}
        >
          Começar meu raio-x
        </Link>
        <p className="funnel-cred">
          Diagnóstico construído por Leonardo Froese, da Cáliber Gestão Empresarial. 17 anos, mais
          de 450 empresas implantadas em 10 estados e mais de R$ 100 milhões em lucro gerado para
          clientes.
        </p>
      </section>
    </FunnelShell>
  );
}
