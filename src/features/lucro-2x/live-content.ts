/**
 * Conteúdo e configurações editáveis da experiência Live Lucro 2X.
 * Copy alinhada ao Guia da Esteira Cáliber — Setembro de 2026.
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
  title: "Seu Raio-X mostrou onde sua estrutura perde força. Agora descubra onde o lucro vaza.",
  subtitle:
    "O Raio-X mede percepção. A Live Lucro 2X coloca os números na mesa para transformar diagnóstico em clareza.",
};

export const liveIntro = {
  kicker: "Live Lucro 2X",
  title: "Como dobrar o lucro da sua empresa sem ser o herói dela.",
  copy:
    "Uma live online de cerca de 2 horas para empresários que já têm equipe e ainda carregam a empresa nas costas. Com os números do último mês em mãos, você preenche o Mapa de Drenagem de Lucro, identifica a causa dominante dos vazamentos e define uma decisão prática para os próximos 7 dias.",
};

export const liveAreas: { title: string; description: string; icon: string }[] = [
  {
    title: "O número",
    description:
      "Entenda por que lucro no papel, caixa no banco e patrimônio contam histórias diferentes — e por que vender mais nem sempre resolve.",
    icon: "wallet",
  },
  {
    title: "O vazamento",
    description:
      "Percorra os 12 drenos de lucro nos trechos Margem, Estrutura, Giro, Destino e a válvula geral, marcando a intensidade de cada um.",
    icon: "target",
  },
  {
    title: "A causa",
    description:
      "Classifique cada dreno pela causa dominante: Pessoas, Processos ou Ferramentas. Se a causa é estrutural, trabalhar mais não fecha o vazamento.",
    icon: "workflow",
  },
  {
    title: "Resultado em 7 dias",
    description:
      "Saia com a reunião semanal de lucro: 30 minutos, 3 números e 1 decisão prática para a próxima semana.",
    icon: "gauge",
  },
];

export const liveTimeline: { step: string; title: string; description: string }[] = [
  {
    step: "5 min",
    title: "Abertura",
    description:
      "Promessa, regra do jogo e os três números do último mês em mãos: faturamento, lucro e caixa.",
  },
  {
    step: "15 min",
    title: "Fundamento",
    description:
      "O que é Força Estrutural, por que empresas que crescem sem estrutura acumulam dívida estrutural e como isso prende o dono no centro da operação.",
  },
  {
    step: "25 min",
    title: "O número",
    description:
      "A Tríade simplificada: resultado e lucratividade, caixa e patrimônio. Três leituras diferentes para entender por que o lucro nem sempre aparece na conta.",
  },
  {
    step: "25 min",
    title: "O vazamento",
    description:
      "Os 12 drenos organizados em Margem, Estrutura, Giro, Destino e a válvula geral. Você marca a intensidade de cada dreno no seu mapa.",
  },
  {
    step: "20 min",
    title: "A causa",
    description:
      "Cada dreno é ligado à causa dominante — Pessoas, Processos ou Ferramentas — para mostrar por que esforço sem estrutura não resolve.",
  },
  {
    step: "10 min",
    title: "Resultado em 7 dias",
    description:
      "Você define a reunião semanal de lucro: 30 minutos, 3 números e 1 decisão para os próximos 7 dias.",
  },
  {
    step: "5 min",
    title: "Prova prática",
    description:
      "Casos reais mostram o que muda quando a empresa ganha estrutura e deixa de depender do dono em cada decisão.",
  },
  {
    step: "20 min",
    title: "Ponte e oferta",
    description:
      "Você já sabe onde vaza e por quê. Para quem quiser continuar, Leonardo apresenta o programa Lucro 2X: ordem de ataque, ferramentas e acompanhamento por 8 semanas.",
  },
  {
    step: "10–15 min",
    title: "Perguntas",
    description:
      "Espaço final para dúvidas sobre o conteúdo da Live, o Mapa de Drenagem e o próximo passo para quem quiser avançar.",
  },
];

export const liveFaqs: { question: string; answer: string }[] = [
  {
    question: "O que é a Live Lucro 2X?",
    answer:
      "É uma live online de cerca de 2 horas. A proposta é sair da percepção do Raio-X e colocar os números reais da empresa na mesa para entender onde o lucro vaza e por quê.",
  },
  {
    question: "Para quem é a Live?",
    answer:
      "Para empresários e gestores que já têm equipe e ainda carregam a empresa nas costas. Não é uma aula motivacional: é um encontro prático sobre estrutura, números e decisão.",
  },
  {
    question: "O que preciso ter em mãos para participar?",
    answer:
      "Os números do último mês: faturamento, lucro e caixa. Eles serão usados durante o preenchimento do Mapa de Drenagem de Lucro.",
  },
  {
    question: "O que eu levo da Live?",
    answer:
      "O Mapa de Drenagem da sua empresa preenchido, a causa dominante dos vazamentos identificada e uma decisão prática para os próximos 7 dias.",
  },
  {
    question: "Qual o investimento?",
    answer: "O investimento da Live Lucro 2X é de R$ 97.",
  },
  {
    question: "Vai ter oferta no final?",
    answer:
      "Sim. Com transparência: ao final, Leonardo apresenta o programa Lucro 2X para quem quiser continuar e transformar o mapa em ordem de ataque, ferramentas e execução acompanhada por 8 semanas.",
  },
  {
    question: "A gravação está incluída?",
    answer:
      "A gravação e uma planilha de apoio estão previstas como uma oferta adicional no checkout, separada do ingresso da Live.",
  },
  {
    question: "Quando e onde acontece?",
    answer:
      "A Live será online. A data, o horário e os detalhes de acesso serão divulgados junto da abertura das inscrições.",
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
