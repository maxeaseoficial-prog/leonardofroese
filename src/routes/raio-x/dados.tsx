import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  emptyContact,
  isContactValid,
  maskWhatsapp,
  type DiagnosticContact,
} from "@/features/lucro-2x/diagnostic-config";
import { loadDiagnostic, saveDiagnostic } from "@/features/lucro-2x/diagnostic-session";
import { funnelHead } from "@/features/lucro-2x/funnel-head";
import { FunnelShell } from "@/features/lucro-2x/funnel-ui";

export const Route = createFileRoute("/raio-x/dados")({
  head: () => funnelHead,
  component: DataCapture,
});
const selects = [
  [
    "segmento",
    "Segmento",
    [
      ["Comercio", "Comércio"],
      ["Industria", "Indústria"],
      ["Servicos", "Serviços"],
      ["Saude", "Saúde"],
      ["Construcao", "Construção"],
      ["Agro", "Agro"],
      ["Outro", "Outro"],
    ],
  ],
  [
    "faturamento",
    "Faturamento médio por mês",
    [
      ["a", "Até 100 mil"],
      ["b", "100 a 300 mil"],
      ["c", "300 mil a 1 milhão"],
      ["d", "1 a 5 milhões"],
      ["e", "Acima de 5 milhões"],
    ],
  ],
  [
    "colaboradores",
    "Número de colaboradores",
    [
      ["Ate 5", "Até 5"],
      ["6 a 20", "6 a 20"],
      ["21 a 50", "21 a 50"],
      ["51 a 200", "51 a 200"],
      ["Acima de 200", "Acima de 200"],
    ],
  ],
  [
    "papel",
    "Sua posição",
    [
      ["Dono ou socio", "Dono ou sócio"],
      ["Diretor", "Diretor"],
      ["Gerente", "Gerente"],
      ["Outro", "Outro"],
    ],
  ],
] as const;

function DataCapture() {
  const navigate = useNavigate();
  const [contact, setContact] = useState<DiagnosticContact>(emptyContact);
  useEffect(() => setContact(loadDiagnostic().contact), []);
  const set = (key: keyof DiagnosticContact, value: string) =>
    setContact((current) => ({
      ...current,
      [key]: key === "whatsapp" ? maskWhatsapp(value) : value,
    }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!isContactValid(contact)) return;
    const saved = loadDiagnostic();
    if (saved.answers.length < 12) {
      navigate({ to: "/raio-x/perguntas" });
      return;
    }
    saveDiagnostic({ ...saved, contact });
    navigate({ to: "/raio-x/resultado" });
  };
  return (
    <FunnelShell>
      <section className="data-shell">
        <form className="data-inner" onSubmit={submit} noValidate>
          <div className="funnel-kicker">Etapa final</div>
          <h1 className="funnel-serif">Seu raio-x está pronto. Para onde envio?</h1>
          <p className="data-lead">
            Preencha para ver o resultado agora na tela e receber a versão completa no WhatsApp.
          </p>
          <div className="data-fields">
            <label className="data-field">
              Seu nome
              <input
                required
                minLength={3}
                autoComplete="name"
                placeholder="Nome e sobrenome"
                value={contact.nome}
                onChange={(e) => set("nome", e.target.value)}
              />
            </label>
            <label className="data-field">
              Seu WhatsApp com DDD
              <input
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                value={contact.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
              />
            </label>
            <label className="data-field">
              Seu melhor e-mail
              <input
                required
                type="email"
                autoComplete="email"
                placeholder="nome@empresa.com.br"
                value={contact.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </label>
            <label className="data-field">
              Nome da empresa
              <input
                required
                autoComplete="organization"
                placeholder="Razão social ou nome fantasia"
                value={contact.empresa}
                onChange={(e) => set("empresa", e.target.value)}
              />
            </label>
            {selects.map(([key, label, options]) => (
              <label className="data-field" key={key}>
                {label}
                <select required value={contact[key]} onChange={(e) => set(key, e.target.value)}>
                  <option value="">Selecione</option>
                  {options.map(([value, text]) => (
                    <option key={value} value={value}>
                      {text}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <button
            className="funnel-primary data-submit"
            type="submit"
            disabled={!isContactValid(contact)}
          >
            Ver meu resultado
          </button>
          <p className="data-privacy">
            Seus dados são usados apenas para enviar o resultado e o material do diagnóstico. Não
            compartilhamos com terceiros.
          </p>
        </form>
      </section>
    </FunnelShell>
  );
}
