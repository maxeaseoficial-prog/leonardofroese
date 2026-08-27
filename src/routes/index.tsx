import { createFileRoute } from "@tanstack/react-router";
import { AmbientBackground, ScrollProgress } from "@/components/site/primitives";
import { Hero } from "@/components/site/hero";
import { Footer, Nav } from "@/components/site/chrome";
import {
  About,
  FinalCta,
  ImpactBand,
  Methodology,
  Pillars,
  PresentationVideo,
  Problems,
  Results,
  Storytelling,
  Testimonials,
} from "@/components/site/sections";

const title = "Leonardo Froese | Cáliber Gestão Empresarial";
const description =
  "Consultoria de gestão para empresários: financeiro, processos, comercial e escala. Há 16 anos estruturando empresas lucrativas que não dependem do dono.";
const url = "https://leonardofroese.lovable.app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "keywords", content: "gestão empresarial, consultoria financeira, processos, escala de negócios, Leonardo Froese, Cáliber" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "canonical", content: url },
      { name: "theme-color", content: "#0A0A0A" },
      { name: "language", content: "pt-BR" },
    ],
    links: [
      { rel: "canonical", href: url },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "Cáliber Gestão Empresarial",
          "url": url,
          "logo": `${url}/caliber-logo.png`,
          "image": `${url}/leonardo-founder.png`,
          "description": description,
          "founder": {
            "@type": "Person",
            "name": "Leonardo Froese"
          },
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "BR"
          },
          "serviceType": ["Consultoria de Gestão", "Gestão Financeira", "Processos", "Escala"],
          "areaServed": "Brazil"
        })
      }
    ]
  }),
  component: Index,
});

function Index() {
  return (
    <main id="top" className="relative overflow-x-clip bg-background">
      <ScrollProgress />
      <Nav />
      <Hero />
      <div className="relative">
        <AmbientBackground />
        <div className="relative">
          <Problems />
          <Methodology />
          <Storytelling />
          <Results />
          <Pillars />
          <About />
          <Testimonials />
          <ImpactBand />
          <FinalCta />
          <Footer />
        </div>
      </div>
    </main>
  );
}
