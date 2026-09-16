import logoChunk0 from "@/assets/client-logo-strip/chunk0";
import logoChunk1 from "@/assets/client-logo-strip/chunk1";
import logoChunk2 from "@/assets/client-logo-strip/chunk2";
import logoChunk3 from "@/assets/client-logo-strip/chunk3";
import logoChunk4 from "@/assets/client-logo-strip/chunk4";
import logoChunk5 from "@/assets/client-logo-strip/chunk5";
import logoChunk6 from "@/assets/client-logo-strip/chunk6";
import logoChunk7 from "@/assets/client-logo-strip/chunk7";
import "./client-logos.css";

const clientLogoStrip = `data:image/jpeg;base64,${logoChunk0}${logoChunk1}${logoChunk2}${logoChunk3}${logoChunk4}${logoChunk5}${logoChunk6}${logoChunk7}`;

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
