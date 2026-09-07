import { createFileRoute } from "@tanstack/react-router";
import { funnelHead } from "@/features/lucro-2x/funnel-head";
import { FunnelShell } from "@/features/lucro-2x/funnel-ui";
import "@/features/lucro-2x/post-purchase.css";

const whatsappGroupUrl = "https://chat.whatsapp.com/J6GsZDEt0uJACWQu8qGcZC";

export const Route = createFileRoute("/lucro2x/obrigado")({
  head: () => ({
    meta: [
      { title: "Inscrição confirmada | Cáliber Lucro 2x" },
      {
        name: "description",
        content: "Próximo passo para participantes do Cáliber Lucro 2x.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
      { name: "theme-color", content: "#08080a" },
    ],
    links: funnelHead.links,
  }),
  component: Lucro2xPostPurchase,
});

function Lucro2xPostPurchase() {
  return (
    <FunnelShell>
      <section className="post-purchase-page" aria-labelledby="post-purchase-title">
        <div className="post-purchase-inner">
          <p className="post-purchase-label">Inscrição confirmada</p>
          <h1 id="post-purchase-title" className="post-purchase-title">
            Você está dentro do <span>Cáliber Lucro 2x.</span>
          </h1>
          <p className="post-purchase-subtitle">
            Sua inscrição foi confirmada. Agora falta apenas um passo para você receber os próximos
            avisos e orientações da turma.
          </p>

          <div className="post-purchase-rule" aria-hidden="true" />

          <section className="post-purchase-next" aria-labelledby="next-step-title">
            <p className="post-purchase-label">Próximo passo</p>
            <h2 id="next-step-title">Entre no grupo oficial da turma.</h2>
            <p className="post-purchase-next-copy">
              É pelo grupo do WhatsApp que você receberá os próximos avisos, orientações e
              informações importantes do Cáliber Lucro 2x.
            </p>
            <p className="post-purchase-note">
              Entre agora para não perder nenhuma comunicação da turma.
            </p>
            <a
              className="post-purchase-whatsapp"
              href={whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              ENTRAR NO GRUPO DO WHATSAPP
            </a>
          </section>

          <p className="post-purchase-signoff">Nos vemos no Cáliber Lucro 2x.</p>
          <p className="post-purchase-brand">
            Cáliber Gestão Empresarial
            <br />
            Leonardo Froese
          </p>
          <p className="post-purchase-payment">
            Pagamento processado pela Kiwify. A confirmação da compra e as informações da transação
            são enviadas para o e-mail utilizado na compra.
          </p>
        </div>
      </section>
    </FunnelShell>
  );
}
