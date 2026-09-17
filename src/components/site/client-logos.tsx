import "./client-logos.css";

const clientLogos = [
  { name: "Claro", src: "/client-logos/claro.png" },
  { name: "Leo Madeiras", src: "/client-logos/leo-madeiras.png" },
  { name: "Procria", src: "/client-logos/procria.png" },
  { name: "Maxvinil", src: "/client-logos/maxvinil.png" },
  { name: "Tupperware", src: "/client-logos/tupperware.png" },
  { name: "Águas de Sorriso", src: "/client-logos/aguas-de-sorriso.png" },
  { name: "Aliança", src: "/client-logos/alianca.png" },
  { name: "Campo Solar", src: "/client-logos/campo-solar.png" },
  { name: "Cobertura Imasa", src: "/client-logos/cobertura-imasa.png" },
  { name: "Eletricidade Paraense", src: "/client-logos/eletricidade-paraense.png" },
  { name: "Fatex", src: "/client-logos/fatex.png" },
  { name: "Frota", src: "/client-logos/frota.png" },
  { name: "Octech", src: "/client-logos/octech.png" },
  { name: "Pantanal", src: "/client-logos/pantanal.png" },
  { name: "Tempermat", src: "/client-logos/tempermat.png" },
  { name: "Prime Lente", src: "/client-logos/prime-lente.png" },
  { name: "Trevo", src: "/client-logos/trevo.png" },
] as const;

function LogoGroup({ clone = false }: { clone?: boolean }) {
  return <div className="client-logos-group" aria-hidden={clone || undefined} data-clone={clone ? "true" : undefined}>{clientLogos.map((logo) => <div className="client-logo-item" key={`${clone ? "clone-" : ""}${logo.name}`}><img src={logo.src} alt={clone ? "" : logo.name} aria-hidden={clone || undefined} decoding="async" draggable={false} /></div>)}</div>;
}

export function ClientLogos({ className = "" }: { className?: string }) {
  return <section className={`client-logos ${className}`} aria-label="Parceiros e clientes da Cáliber"><div className="client-logos-heading"><span>Algumas das empresas que confiam no nosso trabalho</span><h3>Parceiros &amp; Clientes</h3></div><div className="client-logos-viewport"><div className="client-logos-track"><LogoGroup /><LogoGroup clone /></div></div></section>;
}
