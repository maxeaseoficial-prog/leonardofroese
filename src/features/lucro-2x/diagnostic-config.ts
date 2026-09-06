export type PillarId = "financeiro" | "processos" | "comercial" | "indicadores";
export type DiagnosticQuestion = { pillar: PillarId; prompt: string; options: readonly string[] };
export type DiagnosticContact = {
  nome: string;
  whatsapp: string;
  email: string;
  empresa: string;
  segmento: string;
  faturamento: string;
  colaboradores: string;
  papel: string;
};

export const emptyContact: DiagnosticContact = {
  nome: "",
  whatsapp: "",
  email: "",
  empresa: "",
  segmento: "",
  faturamento: "",
  colaboradores: "",
  papel: "",
};
export const pillars = [
  {
    id: "financeiro",
    name: "Financeiro",
    consequence: "Você cresce sem saber se o crescimento está pagando a conta.",
  },
  {
    id: "processos",
    name: "Processos e Dependência",
    consequence: "A empresa não suporta o próximo salto sem aumentar o caos e a sua carga.",
  },
  {
    id: "comercial",
    name: "Comercial",
    consequence: "Sua receita depende de meses bons, e mês bom não é estratégia.",
  },
  {
    id: "indicadores",
    name: "Indicadores e Gestão",
    consequence: "Você decide com atraso e descobre o erro quando ele já custou caro.",
  },
] as const;

export const diagnosticQuestions: readonly DiagnosticQuestion[] = [
  {
    pillar: "financeiro",
    prompt: "Você sabe qual foi o lucro líquido do mês passado?",
    options: [
      "Sei o valor exato e como ele foi formado.",
      "Sei o valor aproximado.",
      "Só sei o que sobrou na conta.",
      "Não sei.",
    ],
  },
  {
    pillar: "financeiro",
    prompt: "Você sabe a margem de cada produto, serviço ou unidade?",
    options: ["De todos, com número.", "Dos principais.", "Tenho uma noção.", "Não sei."],
  },
  {
    pillar: "financeiro",
    prompt: "Como o seu preço foi definido?",
    options: [
      "Por custo, margem e ponto de equilíbrio, revisado nos últimos 6 meses.",
      "Por cálculo, mas sem revisão recente.",
      "Pelo preço do concorrente.",
      "Por sensação ou histórico.",
    ],
  },
  {
    pillar: "processos",
    prompt: "Se você ficasse 30 dias fora, o que aconteceria com a empresa?",
    options: [
      "Funcionaria normalmente.",
      "Funcionaria com perda pequena.",
      "Travaria em várias áreas.",
      "Pararia.",
    ],
  },
  {
    pillar: "processos",
    prompt: "As rotinas críticas estão documentadas?",
    options: [
      "Documentadas e realmente usadas.",
      "Documentadas, mas pouco usadas.",
      "Algumas partes.",
      "Estão na cabeça das pessoas.",
    ],
  },
  {
    pillar: "processos",
    prompt: "Quem resolve os problemas fora do padrão?",
    options: [
      "Os líderes de cada área.",
      "Os líderes, com meu apoio.",
      "Eu, na maioria das vezes.",
      "Sempre eu.",
    ],
  },
  {
    pillar: "comercial",
    prompt: "Você sabe quantos contatos ou orçamentos são necessários para fechar uma venda?",
    options: [
      "Sei e acompanho todo mês.",
      "Sei de forma aproximada.",
      "Nunca medi.",
      "Não trabalho com funil.",
    ],
  },
  {
    pillar: "comercial",
    prompt: "Qual a sua previsibilidade de receita para os próximos 90 dias?",
    options: [
      "Sei com margem pequena de erro.",
      "Tenho uma estimativa razoável.",
      "Chuto.",
      "Não faço ideia.",
    ],
  },
  {
    pillar: "comercial",
    prompt: "A frente comercial tem meta, cadência e acompanhamento semanal?",
    options: [
      "Tem os três.",
      "Tem meta e acompanhamento.",
      "Só tem meta.",
      "Não tem, ou o comercial sou eu.",
    ],
  },
  {
    pillar: "indicadores",
    prompt: "Quantos indicadores você acompanha toda semana?",
    options: [
      "Entre 5 e 10, em painel.",
      "Entre 2 e 4.",
      "Só faturamento e saldo em conta.",
      "Nenhum.",
    ],
  },
  {
    pillar: "indicadores",
    prompt: "Existe reunião de gestão em ritmo fixo?",
    options: [
      "Semanal, com pauta e responsáveis.",
      "Acontece, mas sem padrão.",
      "Esporádica.",
      "Não existe.",
    ],
  },
  {
    pillar: "indicadores",
    prompt: "Suas decisões maiores são baseadas em quê?",
    options: ["Números consolidados.", "Números parciais.", "Opinião do time.", "Intuição."],
  },
];

const revenueMidpoints: Record<string, number> = {
  a: 50_000,
  b: 200_000,
  c: 650_000,
  d: 3_000_000,
  e: 7_500_000,
};
const tieOrder: PillarId[] = ["financeiro", "indicadores", "processos", "comercial"];
const formatBRL = (value: number) =>
  value >= 1_000_000
    ? `R$ ${(Math.round(value / 100_000) / 10).toFixed(1).replace(".", ",")} mi`
    : `R$ ${Math.round(value / 1_000)} mil`;

export function calculateDiagnostic(answers: number[], revenueBand: string) {
  const normalized = diagnosticQuestions.map((_, index) => answers[index] ?? 0);
  const score = Math.round((normalized.reduce((sum, value) => sum + value, 0) / 36) * 100);
  const scores = Object.fromEntries(
    pillars.map((pillar, index) => [
      pillar.id,
      Math.round(
        (normalized.slice(index * 3, index * 3 + 3).reduce((sum, value) => sum + value, 0) / 9) *
          100,
      ),
    ]),
  ) as Record<PillarId, number>;
  const classification =
    score <= 30
      ? "Crítico"
      : score <= 55
        ? "Reativo"
        : score <= 75
          ? "Em estruturação"
          : "Estruturado";
  const ranked = [...tieOrder].sort((a, b) => scores[a] - scores[b]);
  const percentages: [number, number] =
    score <= 30
      ? [0.08, 0.15]
      : score <= 55
        ? [0.05, 0.09]
        : score <= 75
          ? [0.03, 0.06]
          : [0, 0.03];
  const annualRevenue = (revenueMidpoints[revenueBand] ?? 200_000) * 12;
  const leakageMin = annualRevenue * percentages[0];
  const leakageMax = annualRevenue * percentages[1];
  const leakage =
    leakageMin === 0
      ? `Até ${formatBRL(leakageMax)} por ano`
      : `${formatBRL(leakageMin)} a ${formatBRL(leakageMax)} por ano`;
  return {
    score,
    classification,
    scores,
    bottlenecks: ranked.slice(0, 2),
    leakage,
    leakageMin,
    leakageMax,
  };
}

export function maskWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isContactValid(contact: DiagnosticContact) {
  return (
    contact.nome.trim().length >= 3 &&
    contact.whatsapp.replace(/\D/g, "").length >= 10 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) &&
    contact.empresa.trim().length > 0 &&
    Boolean(contact.segmento && contact.faturamento && contact.colaboradores && contact.papel)
  );
}
