export type PillarId = "estrategia" | "processos" | "financeiro" | "comercial";

export type DiagnosticAnswer = "nao" | "parcial" | "sim";

export type DiagnosticQuestion = {
  id: string;
  pillar: PillarId;
  prompt: string;
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "decisoes",
    pillar: "estrategia",
    prompt: "As principais decisões ainda dependem diretamente do dono?",
  },
  {
    id: "indicadores",
    pillar: "estrategia",
    prompt: "A liderança acompanha indicadores para orientar as decisões?",
  },
  {
    id: "prioridades",
    pillar: "estrategia",
    prompt: "As prioridades da empresa estão claras para quem precisa executá-las?",
  },
  {
    id: "padroes",
    pillar: "processos",
    prompt: "Os processos críticos possuem um padrão de execução conhecido pelo time?",
  },
  {
    id: "retrabalho",
    pillar: "processos",
    prompt: "A operação consegue crescer sem aumentar o retrabalho na mesma proporção?",
  },
  {
    id: "autonomia",
    pillar: "processos",
    prompt: "Os líderes sabem com clareza o que entregar e têm autonomia para agir?",
  },
  {
    id: "projecoes",
    pillar: "financeiro",
    prompt: "O financeiro trabalha com projeções confiáveis de caixa e resultado?",
  },
  {
    id: "margem",
    pillar: "financeiro",
    prompt: "A empresa conhece a margem real dos produtos ou serviços que vende?",
  },
  {
    id: "lucro",
    pillar: "financeiro",
    prompt: "O lucro acontece com consistência e é acompanhado de forma estruturada?",
  },
  {
    id: "previsibilidade",
    pillar: "comercial",
    prompt: "A operação comercial possui metas e previsibilidade de vendas?",
  },
  {
    id: "processo-comercial",
    pillar: "comercial",
    prompt: "O processo comercial funciona além do relacionamento pessoal do dono?",
  },
  {
    id: "conversao",
    pillar: "comercial",
    prompt: "A empresa acompanha as etapas e conversões do processo de vendas?",
  },
];

export const answerOptions: Array<{ value: DiagnosticAnswer; label: string }> = [
  { value: "nao", label: "Ainda não" },
  { value: "parcial", label: "Em parte" },
  { value: "sim", label: "Sim, com consistência" },
];

export const priorityOptions: Array<{
  id: PillarId | "dependencia" | "lideranca";
  label: string;
  consequence: string;
}> = [
  {
    id: "dependencia",
    label: "Dependência do dono",
    consequence:
      "A operação perde ritmo quando decisões e execução se concentram em uma única pessoa.",
  },
  {
    id: "estrategia",
    label: "Gestão e indicadores",
    consequence:
      "Sem uma leitura compartilhada da operação, prioridades competem e decisões chegam tarde.",
  },
  {
    id: "processos",
    label: "Processos e retrabalho",
    consequence:
      "A falta de padrão aumenta variação, retrabalho e dependência de conhecimento informal.",
  },
  {
    id: "financeiro",
    label: "Financeiro e margem",
    consequence:
      "Sem projeção e leitura de margem, faturamento não se transforma necessariamente em resultado.",
  },
  {
    id: "comercial",
    label: "Vendas e previsibilidade",
    consequence:
      "Quando o comercial não tem método, a receita se torna mais difícil de projetar e sustentar.",
  },
  {
    id: "lideranca",
    label: "Liderança e autonomia",
    consequence:
      "Papéis pouco claros empurram decisões para o topo e limitam a capacidade de execução do time.",
  },
];

export const contactFields = [
  { id: "name", label: "Seu nome", type: "text", autoComplete: "name" },
  { id: "company", label: "Empresa", type: "text", autoComplete: "organization" },
  { id: "email", label: "E-mail", type: "email", autoComplete: "email" },
] as const;

export const diagnosticRuleStatus = {
  officialQuestions: false,
  officialScore: false,
  officialBottlenecks: false,
  officialFinancialLeakage: false,
} as const;
