import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { funnelHead } from "@/features/lucro-2x/funnel-head";
import { FunnelShell } from "@/features/lucro-2x/funnel-ui";
import leonardoPhoto from "@/assets/leonardo-DSC01026.jpg.asset.json";
import "@/features/lucro-2x/post-purchase.css";

const whatsappGroupUrl = "https://chat.whatsapp.com/Dm1ZdJTYfqfBKK67izctSA";

export const Route = createFileRoute("/live/semanal")({
  head: () => ({
    meta: [
      { title: "Live semanal gratuita | Leonardo Froese" },
      { name: "description", content: "Live gratuita no Instagram em 22/10 às 20h, horário de Cuiabá. Entre no grupo do WhatsApp para garantir sua inscrição." },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
      { name: "theme-color", content: "#08080a" },
    ],
    links: funnelHead.links,
  }),
  component: WeeklyLiveConfirmation,
});

function WeeklyLiveConfirmation() {
  return () => window.clearTimeout(timeout);
  }, []);

  return (
    <FunnelShell>
      <main className="post-purchase-page">
        <section className="post-purchase-hero" aria-labelledby="post-purchase-title">
          <div className="post-purchase-photo">
            <img src={leonardoPhoto.url} alt="Leonardo Froese, apresentador da live semanal gratuita" />
            <div className="post-purchase-photo-shade" aria-hidden="true" />
            <span className="post-purchase-photo-caption">LEONARDO FROESE <i /> LIVE SEMANAL GRATUITA</span>
          </div>
          <div className="post-purchase-copy">
            <span className="post-purchase-eyebrow"><Check size={22} strokeWidth={3} /> GARANTA SUA INSCRIÇÃO GRATUITA</span>
            <h1 id="post-purchase-title" className="post-purchase-title weekly-live-title">Participe da <em>live gratuita no Instagram</em>, dia 22/10, às 20h (horário de Cuiabá).</h1>
            <div className="post-purchase-next">
              <div className="post-purchase-step"><span>01</span><div><strong>Sua inscrição é feita pelo grupo gratuito do WhatsApp</strong><p>Para garantir sua inscrição, basta entrar no grupo. Você receberá o acesso, os lembretes e todas as orientações para acompanhar a live.</p></div></div>
              <a className="post-purchase-whatsapp" href={whatsappGroupUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={21} /> Garantir minha inscrição gratuita <ArrowUpRight size={19} />
              </a>
              <span className="post-purchase-note">A inscrição é gratuita e o encontro será no Instagram.</span>
            </div>
            <p className="post-purchase-signoff">Nos vemos no dia 22/10, às 20h. <span>— Leonardo Froese</span></p>
          </div>
        </section>
      </main>
    </FunnelShell>
  );
}
