import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { funnelHead } from "@/features/lucro-2x/funnel-head";
import { FunnelShell } from "@/features/lucro-2x/funnel-ui";
import leonardoPhoto from "@/assets/leonardo-DSC01026.jpg.asset.json";
import "@/features/lucro-2x/post-purchase.css";

const whatsappGroupUrl = "https://chat.whatsapp.com/J6GsZDEt0uJACWQu8qGcZC";

export const Route = createFileRoute("/lucro2x/obrigado")({
  head: () => ({
    meta: [
      { title: "Lucro 2x" },
      { name: "description", content: "Parabéns pela sua decisão! Entre no grupo oficial da Live Lucro 2x para receber todas as informações." },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
      { name: "theme-color", content: "#08080a" },
    ],
    links: funnelHead.links,
  }),
  component: Lucro2xPostPurchase,
});

function Lucro2xPostPurchase() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    setShowConfetti(true);
    const timeout = window.setTimeout(() => setShowConfetti(false), 4500);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <FunnelShell>
      <main className="post-purchase-page">
        {showConfetti && (
          <div className="post-purchase-confetti" aria-hidden="true">
            {Array.from({ length: 68 }, (_, index) => (
              <span
                key={index}
                className="post-purchase-confetti-piece"
                style={{
                  left: `${(index * 61.8) % 100}%`,
                  animationDelay: `${(index % 19) * 0.09}s`,
                  animationDuration: `${2.9 + (index % 9) * 0.19}s`,
                  ["--confetti-drift" as string]: `${(index % 2 ? 1 : -1) * (25 + index % 95)}px`,
                  backgroundColor: ["#e8c16a", "#ffd976", "#24d178", "#ffffff", "#b68b3c"][index % 5],
                }}
              />
            ))}
          </div>
        )}
        <section className="post-purchase-hero" aria-labelledby="post-purchase-title">
          <div className="post-purchase-photo">
            <img src={leonardoPhoto.url} alt="Leonardo Froese, apresentador da Live Lucro 2x" />
            <div className="post-purchase-photo-shade" aria-hidden="true" />
            <span className="post-purchase-photo-caption">LEONARDO FROESE <i /> LIVE LUCRO 2X</span>
          </div>
          <div className="post-purchase-copy">
            <span className="post-purchase-eyebrow"><Check size={22} strokeWidth={3} /> INSCRIÇÃO CONFIRMADA</span>
            <h1 id="post-purchase-title" className="post-purchase-title">Parabéns por dar esse <em>próximo passo.</em></h1>
            <p className="post-purchase-subtitle">
              Você tomou uma decisão importante para transformar a gestão e o lucro da sua empresa. Agora falta apenas um passo para se preparar para a <strong>Live Lucro 2x.</strong>
            </p>
            <div className="post-purchase-next">
              <div className="post-purchase-step"><span>01</span><div><strong>Entre no grupo oficial da Live Lucro 2x</strong><p>É por lá que você vai receber orientações, informações importantes e todos os avisos até o dia do evento.</p></div></div>
              <a className="post-purchase-whatsapp" href={whatsappGroupUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={21} /> Entrar no grupo do WhatsApp <ArrowUpRight size={19} />
              </a>
              <span className="post-purchase-note">Entre agora para não perder nenhuma atualização.</span>
            </div>
            <p className="post-purchase-signoff">Nos vemos na Live Lucro 2x. <span>— Leonardo Froese</span></p>
          </div>
        </section>
      </main>
    </FunnelShell>
  );
}
