import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, Clock3, LockKeyhole } from "lucide-react";
import { funnelHead } from "@/features/lucro-2x/funnel-head";
import { FunnelShell } from "@/features/lucro-2x/funnel-ui";
import leonardoPhoto from "@/assets/leonardo-DSC01026.jpg.asset.json";
import "@/features/lucro-2x/weekly-live.css";

const whatsappGroupUrl = "https://chat.whatsapp.com/Dm1ZdJTYfqfBKK67izctSA";

export const Route = createFileRoute("/live/semanal")({
  head: () => ({
    meta: [
      { title: "Live semanal gratuita | Leonardo Froese" },
      {
        name: "description",
        content:
          "Live gratuita no Instagram em 22/10 às 20h, horário de Cuiabá. Entre no grupo do WhatsApp para garantir sua inscrição.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
      { name: "theme-color", content: "#08090b" },
    ],
    links: funnelHead.links,
  }),
  component: WeeklyLiveConfirmation,
});

function WhatsAppIcon({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.174.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.478-.883-.788-1.48-1.762-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.173.198-.297.297-.495.1-.198.05-.372-.025-.52-.074-.149-.669-1.613-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.371-.011-.569-.011s-.52.074-.792.372c-.272.297-1.04 1.015-1.04 2.478s1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.693.625.712.226 1.36.194 1.872.118.571-.085 1.758-.718 2.006-1.412.248-.693.248-1.287.173-1.411-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.445 4.432-9.875 9.885-9.875 2.64.001 5.122 1.03 6.988 2.898a9.82 9.82 0 012.9 6.99c-.002 5.445-4.432 9.875-9.889 9.875m8.413-18.299A11.8 11.8 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.14 1.587 5.94L.057 24l6.324-1.658a11.88 11.88 0 005.664 1.444h.005c6.555 0 11.89-5.335 11.893-11.893A11.82 11.82 0 0020.464 3.49" />
    </svg>
  );
}

function WeeklyLiveConfirmation() {
  return (
    <FunnelShell>
      <main className="weekly-live-page">
        <section className="weekly-live-shell" aria-labelledby="weekly-live-heading">
          <div className="weekly-live-photo">
            <img
              src={leonardoPhoto.url}
              alt="Leonardo Froese, apresentador da live semanal gratuita"
              fetchPriority="high"
            />
            <div className="weekly-live-photo-shade" aria-hidden="true" />
            <div className="weekly-live-photo-caption">
              <strong>LEONARDO FROESE</strong>
              <span className="weekly-live-caption-rule" aria-hidden="true" />
              <span>LIVE SEMANAL GRATUITA</span>
            </div>
          </div>

          <div className="weekly-live-content">
            <div className="weekly-live-kicker">
              <WhatsAppIcon size={28} />
              <span>INSCRIÇÃO GRATUITA</span>
            </div>

            <h1 id="weekly-live-heading" className="weekly-live-heading">
              <span className="weekly-live-mainline">Live <em>gratuita</em> no Instagram</span>
              <span className="weekly-live-date">22/10 às 20h</span>
            </h1>

            <p className="weekly-live-description">
              Entre no grupo oficial do WhatsApp para receber o link da live,
              lembretes e orientações.
            </p>

            <ul className="weekly-live-benefits" aria-label="Benefícios da inscrição">
              <li>
                <span className="weekly-live-check" aria-hidden="true"><Check size={25} strokeWidth={2.6} /></span>
                <span>Grupo oficial<br />da live</span>
              </li>
              <li>
                <span className="weekly-live-check" aria-hidden="true"><Check size={25} strokeWidth={2.6} /></span>
                <span>Lembretes<br />e avisos</span>
              </li>
              <li>
                <span className="weekly-live-check" aria-hidden="true"><Check size={25} strokeWidth={2.6} /></span>
                <span>Acesso<br />gratuito</span>
              </li>
            </ul>

            <a
              className="weekly-live-whatsapp"
              href={whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon size={44} />
              <span>Entrar no grupo do WhatsApp</span>
              <ArrowRight className="weekly-live-arrow" size={29} strokeWidth={2} />
            </a>

            <div className="weekly-live-trust" aria-label="Informações da inscrição">
              <span><Clock3 size={24} strokeWidth={1.8} /> Leva menos de 1 minuto</span>
              <span><LockKeyhole size={23} strokeWidth={1.8} /> Sem custo. Vagas gratuitas.</span>
            </div>
          </div>
        </section>
      </main>
    </FunnelShell>
  );
}
