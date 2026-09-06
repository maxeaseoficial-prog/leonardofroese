import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { diagnosticQuestions, pillars } from "@/features/lucro-2x/diagnostic-config";
import { loadDiagnostic, saveDiagnostic } from "@/features/lucro-2x/diagnostic-session";
import { funnelHead } from "@/features/lucro-2x/funnel-head";
import { FunnelShell } from "@/features/lucro-2x/funnel-ui";

export const Route = createFileRoute("/raio-x/perguntas")({
  head: () => funnelHead,
  component: Questions,
});

function Questions() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const saved = loadDiagnostic();
    setAnswers(saved.answers);
    setIndex(Math.min(saved.answers.length, 11));
  }, []);
  const question = diagnosticQuestions[index] ?? diagnosticQuestions[0]!;
  const pillar = pillars.find((item) => item.id === question.pillar)!;
  const back = () => (index === 0 ? navigate({ to: "/raio-x" }) : setIndex((value) => value - 1));
  const choose = (score: number) => {
    const next = answers.slice(0, index);
    next[index] = score;
    setAnswers(next);
    saveDiagnostic({ ...loadDiagnostic(), answers: next });
    window.setTimeout(
      () => (index === 11 ? navigate({ to: "/raio-x/dados" }) : setIndex(index + 1)),
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180,
    );
  };
  return (
    <FunnelShell>
      <section className="quiz-shell">
        <div className="quiz-top">
          <button type="button" className="quiz-back" onClick={back}>
            Voltar
          </button>
          <div className="quiz-progress" aria-label={`Progresso: pergunta ${index + 1} de 12`}>
            <span style={{ width: `${((index + 1) / 12) * 100}%` }} />
          </div>
          <div className="quiz-count">Pergunta {index + 1} de 12</div>
        </div>
        <div className="quiz-main">
          <div className="funnel-kicker">
            Bloco {Math.floor(index / 3) + 1}. {pillar.name}
          </div>
          <h1 className="funnel-serif">{question.prompt}</h1>
          <div className="quiz-options">
            {question.options.map((option, optionIndex) => (
              <button
                type="button"
                className="quiz-option"
                key={option}
                aria-pressed={answers[index] === 3 - optionIndex}
                onClick={() => choose(3 - optionIndex)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>
    </FunnelShell>
  );
}
