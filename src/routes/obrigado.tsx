import { createFileRoute } from "@tanstack/react-router";
import { funnelHead } from "@/features/lucro-2x/funnel-head";
import { FunnelShell } from "@/features/lucro-2x/funnel-ui";
export const Route = createFileRoute("/obrigado")({ head: () => funnelHead, component: Thanks });
function Thanks() {
  return (
    <FunnelShell>
      <section className="funnel-center">
        <div className="funnel-logo">Cáliber Lucro 2x</div>
        <h1 className="funnel-serif funnel-title" style={{ maxWidth: "16ch", marginTop: 22 }}>
          Sua vaga está confirmada.
        </h1>
        <p className="funnel-intro">
          Você receberá o acesso e o calendário dos encontros no WhatsApp cadastrado. O primeiro
          passo é responder o diagnóstico financeiro antes do encontro de abertura.
        </p>
        <p className="funnel-cred" style={{ marginTop: 14 }}>
          Pagamento processado pela Kiwify. A confirmação da compra e a nota chegam no e-mail
          cadastrado.
        </p>
        <button
          type="button"
          className="funnel-primary"
          style={{ maxWidth: 340, marginTop: 32 }}
          disabled
        >
          Entrar no grupo da turma fundadora
        </button>
      </section>
    </FunnelShell>
  );
}
