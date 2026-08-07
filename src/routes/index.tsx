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

const title = "Leonardo Froese | Caliber Gestão Empresarial";
const description =
  "Consultoria de gestão para empresários: financeiro, processos, comercial e escala. Há 16 anos estruturando empresas lucrativas que não dependem do dono.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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
          <PresentationVideo />
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
