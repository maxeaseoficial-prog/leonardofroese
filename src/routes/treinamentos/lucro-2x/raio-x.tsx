import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Clock3, RotateCcw } from "lucide-react";
import { Nav, Footer } from "@/components/site/chrome";
import {
  answerOptions,
  contactFields,
  diagnosticQuestions,
  priorityOptions,
  type DiagnosticAnswer,
} from "@/features/lucro-2x/diagnostic-config";

const title = "Raio-X Empresarial | Cáliber Lucro 2X";
const description =
  "Uma leitura guiada da gestão para identificar os gargalos que mais limitam a empresa hoje.";
const url = "https://leonardofroese.lovable.app/treinamentos/lucro-2x/raio-x";

export const Route = createFileRoute("/treinamentos/lucro-2x/raio-x")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "theme-color", content: "#0A0A0A" },
    ],
    links: [{ rel: "canonical", href: url }],
  }),
  component: DiagnosticPage,
});

type Stage = "intro" | "questions" | "capture" | "result";
type ContactData = { name: string; company: string; email: string };

const emptyContact: ContactData = { name: "", company: "", email: "" };

function DiagnosticPage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, DiagnosticAnswer>>({});
  const [priorities, setPriorities] = useState<string[]>([]);
  const [contact, setContact] = useState<ContactData>(emptyContact);
  const [formError, setFormError] = useState("");
  const reduceMotion = useReducedMotion();

  const currentQuestion = diagnosticQuestions[questionIndex];
  const progress = ((questionIndex + 1) / diagnosticQuestions.length) * 100;
  const selectedPriorities = useMemo(
    () => priorityOptions.filter((option) => priorities.includes(option.id)),
    [priorities],
  );

  const chooseAnswer = useCallback(
    (answer: DiagnosticAnswer) => {
      if (!currentQuestion) return;
      setAnswers((current) => ({ ...current, [currentQuestion.id]: answer }));
      window.setTimeout(
        () => {
          if (questionIndex === diagnosticQuestions.length - 1) {
            setStage("capture");
          } else {
            setQuestionIndex((index) => index + 1);
          }
        },
        reduceMotion ? 0 : 260,
      );
    },
    [currentQuestion, questionIndex, reduceMotion],
  );

  useEffect(() => {
    if (stage !== "questions") return;
    const onKeyDown = (event: KeyboardEvent) => {
      const option = answerOptions[Number(event.key) - 1];
      if (option) chooseAnswer(option.value);
      if (event.key === "ArrowLeft" && questionIndex > 0) {
        setQuestionIndex((index) => index - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stage, questionIndex, chooseAnswer]);

  const togglePriority = (id: string) => {
    setPriorities((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length === 2) return current;
      return [...current, id];
    });
  };

  const submitCapture = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contact.name.trim() || !contact.company.trim() || !contact.email.trim()) {
      setFormError("Preencha nome, empresa e e-mail para continuar.");
      return;
    }
    if (priorities.length !== 2) {
      setFormError("Selecione os dois pontos que mais limitam sua empresa hoje.");
      return;
    }
    setFormError("");
    setStage("result");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const resetDiagnostic = () => {
    setStage("intro");
    setQuestionIndex(0);
    setAnswers({});
    setPriorities([]);
    setContact(emptyContact);
    setFormError("");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <main id="top" className="min-h-screen overflow-x-clip bg-background">
      <Nav />
      <section className="relative min-h-screen px-6 pb-20 pt-32 lg:px-10 lg:pt-36">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[12%] top-40 h-72 w-72 rounded-full bg-primary/[0.07] blur-[120px]" />
          <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-5xl">
          <Link
            to="/treinamentos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Voltar aos treinamentos
          </Link>

          <AnimatePresence mode="wait">
            {stage === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -14 }}
                transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="grid min-h-[660px] items-center py-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary">
                    Cáliber Lucro 2X · Funil Raio-X
                  </p>
                  <h1 className="mt-7 max-w-3xl text-balance-tight text-5xl font-semibold leading-[0.98] text-foreground sm:text-6xl lg:text-7xl">
                    Onde o lucro da sua empresa está vazando?
                  </h1>
                  <p className="mt-8 max-w-2xl text-lg font-light leading-8 text-muted-foreground">
                    Responda 12 perguntas e organize uma leitura objetiva da sua gestão. Ao final,
                    você verá os dois gargalos que declarou como prioritários para a empresa.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStage("questions")}
                    className="group mt-10 inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    Começar meu Raio-X
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </button>
                </div>

                <div className="mt-14 border-y border-border py-3 lg:mt-0">
                  {[
                    ["12", "perguntas"],
                    ["2 min", "tempo estimado"],
                    ["Agora", "leitura qualitativa"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between border-b border-border py-6 last:border-b-0"
                    >
                      <span className="text-3xl font-semibold text-foreground">{value}</span>
                      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {label}
                      </span>
                    </div>
                  ))}
                  <p className="mt-5 text-xs leading-6 text-subtle">
                    A régua quantitativa e a estimativa financeira dependem da metodologia oficial e
                    não são calculadas nesta versão.
                  </p>
                </div>
              </motion.div>
            )}

            {stage === "questions" && currentQuestion && (
              <motion.div
                key={`question-${currentQuestion.id}`}
                initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : -20 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto max-w-3xl py-16 sm:py-24"
              >
                <div className="flex items-center justify-between gap-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    Pergunta {questionIndex + 1} de {diagnosticQuestions.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Teclas 1, 2 ou 3</p>
                </div>
                <div
                  className="mt-5 h-1 overflow-hidden rounded-full bg-surface-2"
                  role="progressbar"
                  aria-label="Progresso do diagnóstico"
                  aria-valuemin={1}
                  aria-valuemax={diagnosticQuestions.length}
                  aria-valuenow={questionIndex + 1}
                >
                  <motion.div
                    className="h-full origin-left bg-primary"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>

                <p className="mt-16 text-xs font-medium uppercase tracking-[0.18em] text-subtle">
                  {currentQuestion.pillar}
                </p>
                <h1 className="mt-5 text-balance-tight text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
                  {currentQuestion.prompt}
                </h1>

                <div className="mt-12 grid gap-3" role="group" aria-label="Opções de resposta">
                  {answerOptions.map((option, index) => {
                    const selected = answers[currentQuestion.id] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => chooseAnswer(option.value)}
                        className={`group flex min-h-16 items-center justify-between rounded-2xl border px-5 text-left text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-6 ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-surface/45 text-foreground/80 hover:border-primary/35 hover:bg-surface"
                        }`}
                      >
                        <span className="flex items-center gap-4">
                          <span className="flex size-7 items-center justify-center rounded-full border border-current/25 text-xs tabular-nums">
                            {index + 1}
                          </span>
                          {option.label}
                        </span>
                        {selected && <Check className="size-4" aria-hidden />}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={questionIndex === 0}
                  onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}
                  className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Voltar
                </button>
              </motion.div>
            )}

            {stage === "capture" && (
              <motion.div
                key="capture"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto max-w-4xl py-16 sm:py-20"
              >
                <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      Sua leitura
                    </p>
                    <h1 className="mt-5 text-balance-tight text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                      Quais são os dois pontos que mais limitam a empresa hoje?
                    </h1>
                    <p className="mt-6 text-sm font-light leading-7 text-muted-foreground">
                      A seleção é declarada por você. Não aplicamos pesos ou fórmulas ainda não
                      aprovados.
                    </p>
                  </div>

                  <form onSubmit={submitCapture} noValidate>
                    <fieldset>
                      <legend className="text-sm font-medium text-foreground">
                        Selecione exatamente dois pontos
                      </legend>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {priorityOptions.map((option) => {
                          const selected = priorities.includes(option.id);
                          const disabled = priorities.length === 2 && !selected;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              aria-pressed={selected}
                              disabled={disabled}
                              onClick={() => togglePriority(option.id)}
                              className={`min-h-16 rounded-2xl border px-4 text-left text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-35 ${
                                selected
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-surface/45 text-foreground/80 hover:border-primary/35"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div className="mt-10 grid gap-5 sm:grid-cols-2">
                      {contactFields.map((field, index) => (
                        <label key={field.id} className={index === 2 ? "sm:col-span-2" : ""}>
                          <span className="text-sm font-medium text-foreground/85">
                            {field.label}
                          </span>
                          <input
                            type={field.type}
                            autoComplete={field.autoComplete}
                            value={contact[field.id]}
                            onChange={(event) =>
                              setContact((current) => ({
                                ...current,
                                [field.id]: event.target.value.replace(/[<>]/g, ""),
                              }))
                            }
                            className="mt-2 min-h-13 w-full rounded-xl border border-input bg-surface/55 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-2 focus:ring-primary/20"
                            required
                          />
                        </label>
                      ))}
                    </div>
                    <p className="mt-4 text-xs leading-5 text-subtle">
                      Seus dados permanecem apenas nesta sessão e não são enviados ou armazenados.
                    </p>

                    {formError && (
                      <p
                        className="mt-5 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary"
                        role="alert"
                      >
                        {formError}
                      </p>
                    )}

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionIndex(diagnosticQuestions.length - 1);
                          setStage("questions");
                        }}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                      >
                        <ArrowLeft className="size-4" aria-hidden />
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="group inline-flex min-h-13 items-center gap-3 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                      >
                        Ver meu resultado
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-1"
                          aria-hidden
                        />
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {stage === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 sm:py-20"
              >
                <div className="grid gap-14 lg:grid-cols-[1fr_0.82fr] lg:gap-20">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      Raio-X concluído
                    </p>
                    <h1 className="mt-5 text-balance-tight text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
                      {contact.name.split(" ")[0]}, sua leitura começa por estes dois gargalos.
                    </h1>
                    <div className="mt-12 divide-y divide-border border-y border-border">
                      {selectedPriorities.map((priority, index) => (
                        <div key={priority.id} className="grid gap-4 py-7 sm:grid-cols-[48px_1fr]">
                          <span className="text-2xl font-light tabular-nums text-primary">
                            0{index + 1}
                          </span>
                          <div>
                            <h2 className="text-xl font-semibold text-foreground">
                              {priority.label}
                            </h2>
                            <p className="mt-3 max-w-xl text-sm font-light leading-7 text-muted-foreground">
                              {priority.consequence}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 flex items-start gap-3 text-xs leading-6 text-subtle">
                      <Clock3 className="mt-1 size-4 shrink-0" aria-hidden />
                      <p>
                        O score /36 e a estimativa de vazamento financeiro não são exibidos porque a
                        regra oficial ainda não foi fornecida. Nenhum número foi presumido.
                      </p>
                    </div>
                  </div>

                  <aside className="self-start border-t border-primary/50 bg-surface/55 p-7 sm:p-9 lg:sticky lg:top-28">
                    <p className="text-sm font-light leading-7 text-muted-foreground">
                      Seu diagnóstico mostrou onde estão os gargalos. O próximo passo é estruturar a
                      solução.
                    </p>
                    <div className="my-8 h-px bg-border" />
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      Cáliber Lucro 2X
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold leading-tight text-foreground">
                      Diagnóstico e Plano de Estruturação Empresarial
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground">com Leonardo Froese</p>
                    <a
                      href="https://pay.kiwify.com.br/8v0QHJY"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mt-9 inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-full bg-primary px-6 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                      Quero estruturar minha empresa
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </a>
                    <button
                      type="button"
                      onClick={resetDiagnostic}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <RotateCcw className="size-4" aria-hidden />
                      Refazer o Raio-X
                    </button>
                  </aside>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </main>
  );
}
