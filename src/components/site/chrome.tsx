import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Instagram, Linkedin, Mail, Youtube } from "lucide-react";
import { MagneticButton } from "./primitives";

const links = [
  { label: "Diagnóstico", href: "#obstaculos" },
  { label: "Metodologia", href: "#metodologia" },
  { label: "Pilares", href: "#pilares" },
  { label: "Resultados", href: "#resultados" },
  { label: "Leonardo", href: "#leonardo" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled ? "border-b border-border bg-background/70 backdrop-blur-xl" : ""
      }`}
    >
      <nav className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="text-base font-extrabold tracking-tight uppercase">
            Leonardo Froese
          </span>
        </a>
        <div className="hidden items-center gap-9 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-sm font-light text-muted-foreground transition-colors duration-300 hover:text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
            >
              {l.label}
            </a>
          ))}
        </div>
        <MagneticButton href="#contato" className="hidden px-5 py-2.5 text-xs sm:inline-flex">
          Agendar Diagnóstico
        </MagneticButton>
      </nav>
    </motion.header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-16 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-extrabold tracking-tight">CALIBER</p>
          <p className="mt-2 text-xs font-light text-subtle">
            Gestão Empresarial • Leonardo Froese
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-light text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <a
            href="mailto:contato@calibergestao.com.br"
            className="text-sm font-light text-muted-foreground transition-colors hover:text-primary"
          >
            contato@calibergestao.com.br
          </a>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-4 text-muted-foreground">
            {[Instagram, Linkedin, Youtube, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#contato"
                aria-label="Rede social"
                className="transition-all duration-300 hover:-translate-y-0.5 hover:text-primary"
              >
                <Icon className="size-4" strokeWidth={1.6} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <p className="mx-auto mt-12 w-full max-w-7xl text-[11px] font-light text-subtle">
        © {new Date().getFullYear()} Caliber Gestão Empresarial. Todos os direitos
        reservados.
      </p>
    </footer>
  );
}
