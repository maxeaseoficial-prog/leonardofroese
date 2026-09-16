import "./client-logos.css";

const clientLogos = [
  { name: "Claro", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/CLARO.webp?ssl=1" },
  { name: "NET", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2025/02/net-1.png?ssl=1" },
  { name: "Megasom", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/05/Logo-Megasom-sem-fundo.png?ssl=1" },
  { name: "Leo Madeiras", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/LEO-MADEIRAS.webp?ssl=1" },
  { name: "Procria", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2025/02/procria.png?ssl=1" },
  { name: "LEGO", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/LEGO.webp?ssl=1" },
  { name: "Maxvinil", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/MAXVINIL.webp?ssl=1" },
  { name: "Tupperware", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/TUPPERWARE.webp?ssl=1" },
  { name: "Águas de Sorriso", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/AGUAS-DE-SORRISO.webp?ssl=1" },
  { name: "Aliança", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/ALIANCA.webp?ssl=1" },
  { name: "Campo Solar", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/CAMPO-SOLAR.webp?ssl=1" },
  { name: "Cobertura Imasa", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/COBERTURA-IMASA.webp?ssl=1" },
  { name: "Eletricidade Paraense", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/ELETRICIDADE-PARAENSE.webp?ssl=1" },
  { name: "Fatex", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/FATEX.webp?ssl=1" },
  { name: "Frota", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/FROTA.webp?ssl=1" },
  { name: "Octech", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/OCTECH.webp?ssl=1" },
  { name: "Pantanal", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/PANTANAL.webp?ssl=1" },
  { name: "Tempermat", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2022/02/TEMPERMAT.webp?ssl=1" },
  { name: "Prime Lente", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2025/02/prime-lente-logo-gradual-1.png?ssl=1" },
  { name: "Trevo", src: "https://i0.wp.com/calibergestao.com.br/wp-content/uploads/2025/02/trevo.png?ssl=1" },
];

export function ClientLogos({ className = "" }: { className?: string }) {
  const repeated = [...clientLogos, ...clientLogos];

  return (
    <section className={`client-logos ${className}`} aria-label="Parceiros e clientes da Cáliber">
      <div className="client-logos-heading">
        <span>Parceiros & Clientes</span>
        <h3>Algumas das empresas que confiam no nosso trabalho.</h3>
      </div>

      <div className="client-logos-viewport">
        <div className="client-logos-track">
          {repeated.map((logo, index) => (
            <div className="client-logo-card" key={`${logo.name}-${index}`} aria-hidden={index >= clientLogos.length}>
              <img
                src={logo.src}
                alt={index < clientLogos.length ? logo.name : ""}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
