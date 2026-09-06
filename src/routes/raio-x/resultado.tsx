import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { calculateDiagnostic, pillars, type PillarId } from "@/features/lucro-2x/diagnostic-config";
import {
  clearDiagnostic,
  loadDiagnostic,
  type DiagnosticSession,
} from "@/features/lucro-2x/diagnostic-session";
import { funnelHead } from "@/features/lucro-2x/funnel-head";
import { CheckoutButton, FunnelShell } from "@/features/lucro-2x/funnel-ui";

export const Route = createFileRoute("/raio-x/resultado")({
  head: () => funnelHead,
  component: Result,
});
const steps = [
  ["1", "Diagnóstico", "Você responde e envia os dados da sua empresa."],
  ["2", "Análise", "O sistema calcula scores, gargalos e consolida os padrões."],
  ["3", "Encontro", "Leonardo interpreta os dados, ensina e resolve o que é recorrente."],
  ["4", "Implementação", "Você executa a missão do ciclo e prepara a etapa seguinte."],
];
const meetings = [
  [
    "ENCONTRO 01",
    "Onde seu lucro está escapando",
    "Antes: diagnóstico geral da empresa, mapeamento de faturamento, lucro percebido e rotina de gestão. No encontro: como interpretar o score, separar sintoma de causa e reconhecer desperdício e decisão mal priorizada.",
    "Você sai com: mapa dos vazamentos, 3 gargalos, 3 desperdícios, 3 prioridades.",
  ],
  [
    "ENCONTRO 02",
    "Os números que sustentam o lucro",
    "Faturamento não é lucro. Margem e precificação. Caixa e ponto de equilíbrio. Decisão por número, não por sensação. Seus dados podem permanecer privados: o painel trabalha com indicadores e padrões.",
    "Você sai com: DRE gerencial, calculadora de margem e preço, fluxo de caixa.",
  ],
  [
    "ENCONTRO 03",
    "A empresa funciona sem você?",
    "Um diagnóstico específico mede o Índice de Dependência do Dono: quem aprova, quem resolve, quem fecha, quem cobra, quem decide. Quanto maior a dependência, mais difícil escalar sem aumentar a sobrecarga.",
    "Você sai com: mapa de processos, matriz de responsabilidades, rotina de reuniões e indicadores.",
  ],
  [
    "ENCONTRO 04",
    "O plano dos próximos 90 dias",
    "Todos os diagnósticos viram execução. Três grandes prioridades, cada uma com meta, responsável, indicador, prazo e ações para 30, 60 e 90 dias.",
    "Você sai com: o Plano Lucro 2x.",
  ],
];
const tools = [
  ["Diagnóstico Geral", "Score de maturidade e mapa de gargalos."],
  ["DRE Gerencial", "Leitura simples de resultado mensal."],
  ["Fluxo de Caixa", "Controle e projeção financeira."],
  ["Margem e Preço", "Calculadora para revisar rentabilidade."],
  ["Mapa de Processos", "Rotinas críticas e pontos de dependência."],
  ["Matriz de Responsabilidades", "Quem executa, decide e responde."],
  ["Painel de Indicadores", "Métricas essenciais para gestão."],
  ["Rotina de Reuniões", "Modelo de cadência de acompanhamento."],
  ["Plano 90 Dias", "Prioridades, metas, responsáveis e prazos."],
];
const faqs = [
  [
    "Preciso ter os números organizados para participar?",
    "Não. Organizar os números é parte do programa.",
  ],
  [
    "Serve para empresa pequena?",
    "Serve para quem já tem operação e equipe, de qualquer porte, e quer parar de decidir no escuro.",
  ],
  [
    "É consultoria individual?",
    "Não. O diagnóstico é individual e a condução é em grupo. O nível Executivo inclui duas sessões individuais.",
  ],
  [
    "Quanto tempo por semana?",
    "Cerca de 2 horas: o encontro ou o plantão, mais a atividade da semana.",
  ],
  [
    "E se eu perder um encontro?",
    "Todos ficam gravados por 12 meses e as dúvidas podem ser enviadas por escrito.",
  ],
  ["E se eu não gostar?", "Garantia incondicional de 14 dias, com devolução integral."],
];

function Result() {
  const navigate = useNavigate();
  const [session, setSession] = useState<DiagnosticSession | null>(null);
  useEffect(() => {
    const saved = loadDiagnostic();
    if (saved.answers.length < 12 || !saved.contact.faturamento) navigate({ to: "/raio-x" });
    else setSession(saved);
  }, [navigate]);
  if (!session)
    return (
      <FunnelShell>
        <section className="funnel-center">
          <p className="funnel-muted">Carregando seu resultado...</p>
        </section>
      </FunnelShell>
    );
  const result = calculateDiagnostic(session.answers, session.contact.faturamento);
  const getPillar = (id: PillarId) => pillars.find((pillar) => pillar.id === id)!;
  return (
    <FunnelShell>
      <article className="result-shell">
        <div className="funnel-kicker">Raio-x da gestão. {session.contact.empresa}</div>
        <section className="result-score">
          <div className="score-number">
            <strong>{result.score}</strong>
            <span>/100</span>
          </div>
          <div className="score-class">
            <small>Nível de maturidade</small>
            <div>{result.classification}</div>
          </div>
        </section>
        <section className="result-section" style={{ marginTop: 30 }}>
          <div className="funnel-kicker" style={{ color: "rgba(245,243,238,.62)" }}>
            Nota por pilar
          </div>
          <div className="pillar-list">
            {pillars.map((p) => (
              <div key={p.id}>
                <div className="pillar-head">
                  <span>{p.name}</span>
                  <output>{result.scores[p.id]}</output>
                </div>
                <div className="pillar-track">
                  <div
                    className="pillar-bar"
                    style={{
                      width: `${result.scores[p.id]}%`,
                      background:
                        result.scores[p.id] < 45
                          ? "#c1663e"
                          : "linear-gradient(90deg,#c19a3e,#e0c176)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="result-grid result-section" style={{ marginTop: 32 }}>
          {result.bottlenecks.map((id, index) => {
            const p = getPillar(id);
            return (
              <div className={index === 0 ? "result-card-gold" : "result-card"} key={id}>
                <div
                  className="funnel-kicker"
                  style={{ color: index === 0 ? undefined : "rgba(245,243,238,.62)" }}
                >
                  {index === 0 ? "Principal gargalo" : "Segundo gargalo"}
                </div>
                <h3 className="funnel-serif">{p.name}</h3>
                <p>{p.consequence}</p>
              </div>
            );
          })}
        </section>
        <section className="result-card result-section" style={{ marginTop: 32, padding: 24 }}>
          <div className="funnel-kicker" style={{ color: "rgba(245,243,238,.62)" }}>
            Vazamento estimado por ano
          </div>
          <h2 className="funnel-serif" style={{ margin: "12px 0 10px", color: "#e8d5a6" }}>
            {result.leakage}
          </h2>
          <p>
            Estimativa baseada em padrão observado em empresas com o mesmo nível de maturidade. Não
            substitui auditoria.
          </p>
        </section>
        <section className="result-divider">
          <div className="funnel-kicker">A decisão</div>
          <h2 className="funnel-serif">Você já conhece o problema. Agora é hora de resolver.</h2>
          <p className="result-copy">
            Este raio-x mostra onde está o furo. Ele não fecha o furo. Fechar exige número, ordem e
            execução. Cada mês que passa sem isso, o vazamento acima continua saindo da sua conta.
            Veja exatamente como vamos fechar em 8 semanas.
          </p>
          <CheckoutButton className="result-cta">
            Quero fechar o vazamento por R$ 997
          </CheckoutButton>
          <p className="pending-note">
            Garantia incondicional de 14 dias. Você entra, olha por dentro e decide depois.
          </p>
        </section>
        <section className="result-highlight result-section" style={{ padding: 24 }}>
          <div className="funnel-kicker">Posicionamento</div>
          <h3 className="funnel-serif" style={{ fontSize: 25 }}>
            Não é um curso gravado.
          </h3>
          <p className="result-copy" style={{ marginTop: 0 }}>
            É um programa de diagnóstico empresarial orientado por dados, em que cada empresário
            analisa a própria empresa e Leonardo conduz a turma a partir dos problemas reais
            encontrados. O diagnóstico é individual. A condução é coletiva.
          </p>
        </section>
        <section className="result-card result-section" style={{ padding: "26px 24px" }}>
          <div className="funnel-kicker">Quem conduz</div>
          <h3 className="funnel-serif" style={{ fontSize: 28 }}>
            Leonardo Froese, Cáliber Gestão Empresarial
          </h3>
          <p className="result-copy" style={{ marginTop: 0 }}>
            Dezessete anos implantando gestão em empresas reais, não em teoria. Ele lê os
            diagnósticos da turma antes de cada encontro, o que torna a condução personalizada mesmo
            em grupo.
          </p>
          <div className="stat-grid">
            {[
              ["17", "anos de estrada"],
              ["450+", "empresas implantadas"],
              ["12.000+", "pessoas treinadas"],
              ["10", "estados atendidos"],
              ["R$ 100 mi", "em lucro gerado para clientes"],
            ].map(([v, l]) => (
              <div className="stat" key={l}>
                <strong>{v}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="result-section">
          <div className="funnel-kicker" style={{ color: "rgba(245,243,238,.62)" }}>
            Como funciona a cada ciclo
          </div>
          <h3 className="funnel-serif">Uma jornada de 8 semanas, não encontros soltos</h3>
          <p className="result-copy">
            Cada ciclo começa com uma atividade prática. Você preenche dados da própria operação, o
            sistema organiza as respostas e o encontro é conduzido a partir dos problemas que
            apareceram de verdade na turma.
          </p>
          <div className="step-grid">
            {steps.map(([n, t, c]) => (
              <div className="step" key={n}>
                <strong>{n}</strong>
                <h4>{t}</h4>
                <p>{c}</p>
              </div>
            ))}
          </div>
          <Objection
            text="São cerca de 2 horas por semana: o encontro ou o plantão, mais a atividade. Todos os encontros ficam gravados por 12 meses."
            question="Vou conseguir acompanhar?"
            label="Entrar na turma fundadora por R$ 997"
          />
        </section>
        <section className="result-section">
          <div className="funnel-kicker" style={{ color: "rgba(245,243,238,.62)" }}>
            Os quatro encontros
          </div>
          <h3 className="funnel-serif">Do vazamento ao plano, em quatro etapas</h3>
          <div className="meeting-list">
            {meetings.map(([n, t, c, s]) => (
              <div className="meeting" key={n}>
                <div className="meeting-title">
                  <span>{n}</span>
                  <h4>{t}</h4>
                </div>
                <p>{c}</p>
                <p className="takeaway">{s}</p>
              </div>
            ))}
          </div>
          <Objection
            text="Não. Organizar os números é justamente o encontro 02. Você entra do jeito que está hoje."
            question="Preciso organizar meus números antes?"
            label="Começar pelo encontro 01 por R$ 997"
          />
        </section>
        <section className="result-section">
          <div className="funnel-kicker" style={{ color: "rgba(245,243,238,.62)" }}>
            Ferramentas que ficam com você
          </div>
          <h3 className="funnel-serif">Nove instrumentos para tirar a gestão da cabeça</h3>
          <div className="tool-grid">
            {tools.map(([t, c]) => (
              <div className="tool" key={t}>
                <h4>{t}</h4>
                <p>{c}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="result-highlight result-section" style={{ padding: 24 }}>
          <div className="funnel-kicker">Entrega final</div>
          <h3 className="funnel-serif" style={{ fontSize: 28 }}>
            Relatório Lucro 2x
          </h3>
          <p className="result-copy" style={{ marginTop: 0 }}>
            Um documento consolidado com a leitura da sua empresa e o plano do próximo trimestre.
          </p>
          <ul className="result-copy">
            <li>Score inicial de maturidade</li>
            <li>Principais gargalos encontrados</li>
            <li>Riscos e pontos de dependência</li>
            <li>Prioridades escolhidas</li>
            <li>Plano de 30, 60 e 90 dias</li>
            <li>Indicadores a acompanhar</li>
          </ul>
          <div className="objection">
            <p>
              Nove ferramentas, quatro encontros e um plano de 90 dias custam menos que um mês de
              vazamento. Compare o valor do programa com a faixa de vazamento que apareceu no seu
              raio-x, no início desta página. É essa a conta.
            </p>
            <CheckoutButton>Garantir minha vaga por R$ 997</CheckoutButton>
          </div>
        </section>
        <section className="result-section">
          <div className="funnel-kicker">Oferta</div>
          <h2 className="funnel-serif" style={{ marginTop: 12 }}>
            Cáliber Lucro 2x. Turma fundadora.
          </h2>
          <p className="result-copy">
            8 semanas para transformar este diagnóstico em um plano de 90 dias com prioridades,
            responsáveis, indicadores e prazos.
          </p>
          <div className="offer-grid">
            <Offer level="padrao" />
            <Offer level="executivo" />
          </div>
          <p className="result-copy">
            Garantia incondicional de 14 dias. Se não fizer sentido, devolvemos o valor integral sem
            pergunta nenhuma.
          </p>
          <p className="result-copy" style={{ color: "#d8b45c", marginTop: 8 }}>
            Turma fundadora com vagas limitadas. Na próxima turma os valores passam para R$ 1.497 e
            R$ 3.997.
          </p>
        </section>
        <section className="result-card result-section" style={{ padding: 22 }}>
          <div className="funnel-kicker" style={{ color: "rgba(245,243,238,.62)" }}>
            Transparência
          </div>
          <div className="transparency-grid">
            <div>
              <h4 style={{ color: "#e8d5a6" }}>O que você compra</h4>
              <p className="result-copy" style={{ marginTop: 0 }}>
                Uma empresa mais clara, controlada e preparada para decidir com base em números e
                prioridades. Diagnóstico individual, condução coletiva, dúvidas enviadas antes de
                cada encontro e casos reais analisados na frente da turma.
              </p>
            </div>
            <div>
              <h4>O que não prometemos</h4>
              <p className="result-copy" style={{ marginTop: 0 }}>
                Consultoria individual para todos os participantes, análise particular completa em
                cada encontro, ou garantia de resultado financeiro. Sessões individuais existem
                apenas no nível Executivo.
              </p>
            </div>
          </div>
          <CheckoutButton className="result-cta">
            Sei o que estou comprando. Quero minha vaga
          </CheckoutButton>
        </section>
        <section className="result-section">
          <div className="funnel-kicker" style={{ color: "rgba(245,243,238,.62)" }}>
            Dúvidas
          </div>
          <div className="faq">
            {faqs.map(([q, a]) => (
              <div className="faq-item" key={q}>
                <h4>{q}</h4>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="final-call">
          <div className="funnel-kicker">Última chamada</div>
          <h2 className="funnel-serif">Daqui a 8 semanas você terá o plano, ou o mesmo furo.</h2>
          <p>
            Turma fundadora com vagas limitadas e preço que não volta: depois passa para R$ 1.497 e
            R$ 3.997. O risco é zero por 14 dias. Não decidir também é uma decisão, e ela custa o
            vazamento de mais um trimestre.
          </p>
          <CheckoutButton>Quero minha vaga por R$ 997</CheckoutButton>
          <CheckoutButton level="executivo" secondary>
            Prefiro o Executivo, com 2 sessões individuais
          </CheckoutButton>
        </section>
        <p className="pending-note">
          Cáliber Gestão Empresarial. Leonardo Froese. 17 anos, mais de 450 empresas implantadas em
          10 estados.
        </p>
        <button
          type="button"
          className="restart"
          onClick={() => {
            clearDiagnostic();
            navigate({ to: "/raio-x" });
          }}
        >
          Refazer o raio-x com outras respostas
        </button>
      </article>
    </FunnelShell>
  );
}

function Objection({ question, text, label }: { question: string; text: string; label: string }) {
  return (
    <div className="objection">
      <p>
        <span style={{ color: "#e8d5a6", fontWeight: 500 }}>“{question}”</span> {text}
      </p>
      <CheckoutButton secondary>{label}</CheckoutButton>
    </div>
  );
}
function Offer({ level }: { level: "padrao" | "executivo" }) {
  const executive = level === "executivo";
  const items = executive
    ? [
        "Tudo do nível Padrão",
        "2 sessões individuais de 50 minutos",
        "Revisão do seu plano de 90 dias linha a linha",
        "Prioridade nas perguntas dos encontros",
        "Uma sessão coletiva de acompanhamento 30 dias após o término",
      ]
    : [
        "4 encontros quinzenais ao vivo de 60 minutos",
        "4 plantões de dúvidas nas semanas intermediárias",
        "3 diagnósticos guiados: geral, financeiro e operacional",
        "Ferramentas: DRE gerencial, calculadora de margem e preço, fluxo de caixa, mapa de processos, matriz de responsabilidades, painel de indicadores, rotina de reuniões",
        "Plano de 90 dias construído por você dentro do programa",
        "Gravações por 12 meses",
      ];
  return (
    <div className={`offer ${executive ? "featured" : ""}`}>
      <div className="offer-top">
        <div className="offer-name">Nível {executive ? "Executivo" : "Padrão"}</div>
        {executive && <div className="offer-tag">Apenas 8 vagas</div>}
      </div>
      <div className="offer-price">R$ {executive ? "2.997" : "997"}</div>
      <ul>
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      <CheckoutButton level={level} secondary={!executive}>
        {executive ? "Quero o nível Executivo por R$ 2.997" : "Quero minha vaga por R$ 997"}
      </CheckoutButton>
    </div>
  );
}
