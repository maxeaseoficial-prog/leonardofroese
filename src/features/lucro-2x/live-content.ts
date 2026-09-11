/**
 * Conteúdo e configurações editáveis da experiência Live Lucro 2X.
 * Fonte de verdade: Página de Vendas da Live Lucro 2X — Setembro de 2026.
 */

/** URL do YouTube da VSL. Deixe vazio para exibir o placeholder premium. */
export const vslYoutubeUrl = "";

/** URL do checkout/gateway da Live Lucro 2X. */
export const checkoutUrl = "https://pay.kiwify.com.br/GBRe5Du";

/** Depoimentos em vídeo. Preencha as URLs do YouTube quando existirem. */
export const testimonialVideos: { label: string; url: string }[] = [
  { label: "Depoimento 01", url: "" },
  { label: "Depoimento 02", url: "" },
  { label: "Depoimento 03", url: "" },
];

export const transitionCopy = {
  kicker: "Do Raio-X à decisão",
  title: "O Raio-X mostrou a sua percepção. Agora falta medir quanto isso custa em reais.",
  subtitle:
    "É isso que vamos medir juntos, ao vivo, usando os números reais da sua empresa.",
};

export const liveIntro = {
  kicker: "Live Lucro 2X",
  title: "Como dobrar o lucro da sua empresa sem ser o herói dela",
  copy:
    "Em 2 horas ao vivo, você mapeia com os números da sua empresa onde o lucro vaza, por que vaza e qual decisão tomar nos próximos 7 dias.",
  meta: "Online e ao vivo | Cerca de 2 horas | Mapa de Drenagem incluso",
  payment: "R$ 97 | Pix, cartão ou boleto",
};

export const audienceFit = {
  title: "Para quem já tem equipe e ainda carrega a empresa nas costas",
  yesTitle: "É para você se",
  yes: [
    "A empresa cresceu, mas o lucro não acompanhou.",
    "A operação para quando você para.",
    "Você fecha o mês sem saber se deu lucro ou se só entrou dinheiro.",
    "Você já cortou, recomeçou e cortou de novo sem sair do lugar.",
  ],
  noTitle: "Não é para você se",
  no: [
    "Você procura motivação ou fórmula rápida.",
    "Você ainda não tem equipe nem pretende ter.",
    "Você não quer olhar os próprios números.",
  ],
};

export const structuralDebt = {
  kicker: "O inimigo",
  title: "O problema não é o mercado. É a dívida estrutural.",
  copy:
    "Quando o faturamento cresce mais rápido do que a estrutura, a empresa contrai uma dívida que não aparece no balanço. Ela é paga todo mês, em lucro que some e em horas que você deixa de ter.",
  scenarios: [
    {
      title: "Cenário 1: a empresa consome e não gera dinheiro",
      description:
        "A margem desaparece, o crescimento trava e cada venda nova dá mais trabalho do que resultado.",
    },
    {
      title: "Cenário 2: a empresa gera dinheiro e consome você",
      description:
        "Não sobra tempo para planejar, inovar ou acompanhar o mercado, enquanto concorrentes estruturados planejam o futuro.",
    },
  ],
  closing: "Nos dois casos, a saída não é trabalhar mais. É fechar os vazamentos na origem.",
};

export const liveTimeline: { step: string; title: string; description: string }[] = [
  {
    step: "Parte 1",
    title: "O número",
    description:
      "Por que o lucro aparece no papel e não aparece na conta. Você lê a sua empresa pelos três relatórios que contam histórias diferentes: resultado, caixa e patrimônio.",
  },
  {
    step: "Parte 2",
    title: "O vazamento",
    description:
      "Os 12 drenos de lucro que mais encontro em empresas que cresceram. Você marca, ao vivo, quais existem na sua empresa e com que intensidade.",
  },
  {
    step: "Parte 3",
    title: "A causa",
    description:
      "Cada vazamento nasce em Pessoas, Processos ou Ferramentas. Quando a causa é estrutural, trabalhar mais não resolve. Você sai sabendo onde agir primeiro.",
  },
];

export const liveOutcome = {
  title: "Você sai com o Mapa de Drenagem da sua empresa preenchido e uma decisão para os próximos 7 dias.",
  note: "O mapa em branco chega no grupo dos participantes antes da live.",
};

export const conductor = {
  kicker: "Quem conduz",
  title: "Leonardo Froese, fundador da Cáliber",
  copy:
    "Comecei na controladoria aos 18 anos e abri minha empresa aos 20. Aos 22, perdi o maior cliente e fiquei a 30 dias de não conseguir pagar as contas. Aprendi do jeito difícil que faturar não é lucrar e que empresa sem estrutura depende de um herói. Hoje a Cáliber estrutura empresas que faturam de R$ 300 mil a R$ 130 milhões por mês, e a minha equipe resolve problemas sem precisar de mim.",
  stats: [
    { value: "+450", label: "empresas estruturadas" },
    { value: "+R$ 100 mi", label: "de lucro gerado para clientes" },
    { value: "16 anos", label: "de controladoria" },
    { value: "10 estados", label: "com clientes atendidos" },
  ],
};

export const proofCopy = {
  kicker: "Prova real",
  title: "O que muda quando a estrutura funciona",
  copy:
    "Aqui entram histórias reais de empresários e empresas, com autorização para uso. Os três espaços abaixo ficam reservados para os depoimentos em vídeo.",
};

export const offer = {
  kicker: "Sua vaga na Live",
  title: "Tudo o que você precisa para transformar percepção em decisão",
  includes: [
    "Live ao vivo de cerca de 2 horas com Leonardo Froese",
    "Mapa de Drenagem de Lucro, enviado antes da live",
    "Exercício guiado com os números da sua empresa",
    "Decisão dos 7 dias definida ao final",
    "Grupo dos participantes com lembretes e materiais",
  ],
  price: "R$ 97",
  payment: "Pix, cartão ou boleto",
  guaranteeTitle: "Garantia de 7 dias",
  guaranteeCopy:
    "Participe da live e avalie a experiência com seus próprios números. As condições de reembolso seguem a garantia configurada no checkout.",
};

export const liveFaqs: { question: string; answer: string }[] = [
  {
    question: "Vai ter venda no final?",
    answer:
      "Sim. Ao final, Leonardo apresenta o programa Lucro 2X para quem quiser continuar com acompanhamento. É opcional. O conteúdo da live é completo sem ele.",
  },
  {
    question: "A live fica gravada?",
    answer:
      "A gravação é um item opcional na tela de pagamento. Quem não adicionar assiste apenas ao vivo.",
  },
  {
    question: "O que preciso ter em mãos?",
    answer:
      "O faturamento, o lucro e o saldo de caixa do último mês. Se não souber o lucro, traga o que tiver: a live mostra por que isso acontece.",
  },
  {
    question: "Minha empresa é pequena. Serve para mim?",
    answer:
      "Serve se você já tem equipe. A live foi desenhada para empresas que cresceram e ainda dependem do dono para funcionar.",
  },
  {
    question: "Funciona para o meu segmento?",
    answer:
      "Os drenos aparecem em comércio, indústria, distribuição e serviços. O que muda é a intensidade de cada um, e é isso que você vai medir.",
  },
  {
    question: "Como recebo o acesso?",
    answer:
      "Logo após a compra, você entra no grupo dos participantes pela página de confirmação e recebe o acesso por e-mail. O link da sala chega no grupo e no e-mail no dia da live.",
  },
  {
    question: "Posso assistir com meu sócio?",
    answer:
      "Sim, na mesma tela. Para receber o mapa e entrar no grupo, cada pessoa precisa da própria vaga.",
  },
  {
    question: "E se eu não gostar?",
    answer:
      "A compra possui garantia conforme as condições exibidas no checkout. O pedido de reembolso segue esse prazo.",
  },
  {
    question: "Quais são as formas de pagamento?",
    answer:
      "Pix, cartão e boleto. O boleto pode levar até 3 dias úteis para compensar; perto da data, prefira Pix ou cartão.",
  },
];

export const finalCta = {
  kicker: "Próximo passo",
  title: "O mapa da sua empresa em 2 horas",
  copy: "Ao vivo e online. Trabalhe com os seus próprios números e saia com uma decisão prática para os próximos 7 dias.",
};

/** Extrai o ID de um vídeo do YouTube a partir das formas mais comuns de URL. */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{6,})/,
  );
  return match?.[1] ?? null;
}
