/**
 * Conteúdo e configurações editáveis da experiência Live Lucro 2X.
 * Tudo aqui é provisório: basta substituir os valores abaixo.
 */

/** URL do YouTube da VSL. Deixe vazio para exibir o placeholder premium. */
export const vslYoutubeUrl = "";

/** URL do checkout/gateway. Enquanto vazio, o botão "Quero participar" fica desabilitado. */
export const checkoutUrl = "";

/** Depoimentos em vídeo. Preencha as URLs do YouTube quando existirem. */
export const testimonialVideos: { label: string; url: string }[] = [
  { label: "Depoimento 01", url: "" },
  { label: "Depoimento 02", url: "" },
  { label: "Depoimento 03", url: "" },
];

export const transitionCopy = {
  kicker: "Do diagnóstico à ação",
  title: "Seu diagnóstico mostrou onde sua empresa precisa de atenção.",
  subtitle: "Agora é hora de transformar leitura em ação.",
};

export const liveIntro = {
  kicker: "Live Lucro 2X",
  title: "O diagnóstico aponta os gargalos. A Live ajuda a priorizar.",
  copy: "O raio-x mostra onde a gestão está frágil. Na Live Lucro 2X, Leonardo Froese percorre a leitura desses resultados e mostra como transformá-los em prioridades práticas dentro das quatro frentes que sustentam o lucro.",
};

export const liveAreas: { title: string; description: string; icon: string }[] = [
  {
    title: "Financeiro",
    description: "Como ler resultado, margem e caixa para enxergar onde o lucro se perde.",
    icon: "wallet",
  },
  {
    title: "Comercial e vendas",
    description: "Como dar previsibilidade à receita em vez de depender de meses bons.",
    icon: "target",
  },
  {
    title: "Processos",
    description: "Como reduzir a dependência do dono e organizar as rotinas críticas.",
    icon: "workflow",
  },
  {
    title: "Gestão",
    description: "Como acompanhar indicadores e decidir com número, não com sensação.",
    icon: "gauge",
  },
];

export const liveTimeline: { step: string; title: string; description: string }[] = [
  {
    step: "01",
    title: "Leitura do diagnóstico",
    description: "Como interpretar o score, as notas por pilar e separar sintoma de causa.",
  },
  {
    step: "02",
    title: "Financeiro e resultado",
    description: "Onde a margem se dissolve e quais números precisam estar na mesa.",
  },
  {
    step: "03",
    title: "Comercial e vendas",
    description: "Funil, cadência e previsibilidade de receita para os próximos meses.",
  },
  {
    step: "04",
    title: "Processos e gestão",
    description: "Rotinas, responsabilidades e indicadores que sustentam a operação.",
  },
  {
    step: "05",
    title: "Plano de ação",
    description: "Como sair da Live com prioridades definidas em vez de uma lista de ideias.",
  },
];

export const liveFaqs: { question: string; answer: string }[] = [
  {
    question: "O que é a Live Lucro 2X?",
    answer:
      "Um encontro online conduzido por Leonardo Froese sobre como ler o diagnóstico da sua empresa e transformar os gargalos encontrados em prioridades práticas de gestão.",
  },
  {
    question: "Para quem é a Live?",
    answer:
      "Para empresários e gestores que já têm operação e equipe e querem decidir com base em números, não em sensação.",
  },
  {
    question: "Quando acontece?",
    answer: "Data e horário serão divulgados em breve.",
  },
  {
    question: "Onde acontece?",
    answer: "É online. Os detalhes de acesso serão enviados aos participantes inscritos.",
  },
  {
    question: "Qual o investimento?",
    answer: "O valor será informado quando as inscrições forem liberadas.",
  },
  {
    question: "A Live ficará gravada?",
    answer: "Esse detalhe será confirmado na abertura das vagas.",
  },
];

/** Extrai o ID de um vídeo do YouTube a partir das formas mais comuns de URL. */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{6,})/,
  );
  return match?.[1] ?? null;
}
