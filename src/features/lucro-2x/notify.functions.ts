import { createServerFn } from "@tanstack/react-start";
import {
  calculateDiagnostic,
  diagnosticQuestions,
  pillars,
  type DiagnosticContact,
} from "./diagnostic-config";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const NOTIFY_EMAIL = "leonardo.froese@gmail.com";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const row = (label: string, value: string) =>
  `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#111;font-size:13px;">${escapeHtml(value)}</td>
  </tr>`;

export const submitDiagnostic = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      contact: DiagnosticContact;
      answers: number[];
      utm: Record<string, string>;
      source?: "raio-x" | "live";
    }) => {
      if (!data?.contact?.email || !Array.isArray(data.answers) || data.answers.length < 12) {
        throw new Error("Dados do diagnóstico incompletos");
      }
      return data;
    },
  )

  .handler(async ({ data }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const resendKey = process.env["RESEND_API_KEY"];
    if (!lovableKey || !resendKey) throw new Error("Configuração de e-mail ausente");

    const { contact, answers, utm } = data;
    const result = calculateDiagnostic(answers, contact.faturamento);

    const answersHtml = diagnosticQuestions
      .map((q, i) => row(q.prompt, q.options[answers[i] ?? 0] ?? "-"))
      .join("");

    const pillarsHtml = pillars
      .map((p) => row(p.name, `${result.scores[p.id]}/100`))
      .join("");

    const utmText =
      Object.entries(utm ?? {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | ") || "Sem origem rastreada";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111;">
        <h1 style="font-size:20px;">Novo Raio-X preenchido: ${escapeHtml(contact.empresa)}</h1>
        <p style="color:#666;font-size:13px;">Score geral: <strong>${result.score}/100 (${result.classification})</strong> · Vazamento estimado: <strong>${result.leakage}</strong></p>
        <h2 style="font-size:15px;margin-top:24px;">Contato</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${row("Nome", contact.nome)}
          ${row("WhatsApp", contact.whatsapp)}
          ${row("E-mail", contact.email)}
          ${row("Empresa", contact.empresa)}
          ${row("Segmento", contact.segmento)}
          ${row("Faturamento", contact.faturamento)}
          ${row("Colaboradores", contact.colaboradores)}
          ${row("Posição", contact.papel)}
        </table>
        <h2 style="font-size:15px;margin-top:24px;">Notas por pilar</h2>
        <table style="width:100%;border-collapse:collapse;">${pillarsHtml}</table>
        <h2 style="font-size:15px;margin-top:24px;">Respostas</h2>
        <table style="width:100%;border-collapse:collapse;">${answersHtml}</table>
        <p style="color:#999;font-size:12px;margin-top:24px;">Origem: ${escapeHtml(utmText)}</p>
      </div>`;

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from: "Raio-X Cáliber <onboarding@resend.dev>",
        to: [NOTIFY_EMAIL],
        reply_to: contact.email,
        subject: `Raio-X: ${contact.empresa} (${result.score}/100 - ${result.classification})`,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Resend falhou [${response.status}]: ${errorBody}`);
      throw new Error(`Falha ao enviar e-mail [${response.status}]`);
    }
    return { sent: true };
  });
