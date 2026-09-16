import { clientLogoTransparentWebpBase64 } from "@/assets/client-logo-transparent-webp-base64";
import "./client-logos.css";

const clientLogoStrip = `data:image/webp;base64,${clientLogoTransparentWebpBase64}`;

export function ClientLogos({ className = "" }: { className?: string }) {
  return (
    <section className={`client-logos ${className}`} aria-label="Parceiros e clientes da Cáliber">
      <div className="client-logos-heading">
        <span>Algumas das empresas que confiam no nosso trabalho</span>
        <h3>Parceiros &amp; Clientes</h3>
      </div>

      <div className="client-logos-viewport">
        <div className="client-logos-track">
          <img
            className="client-logos-strip"
            src={clientLogoStrip}
            alt="Parceiros e clientes da Cáliber: Frota, Octech, Pantanal, Tempermat, Prime Lente, Trevo, Claro, NET e Megasom"
            decoding="async"
          />
          <img
            className="client-logos-strip"
            src={clientLogoStrip}
            alt=""
            aria-hidden="true"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
