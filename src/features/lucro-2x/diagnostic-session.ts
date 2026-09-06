import { emptyContact, type DiagnosticContact } from "./diagnostic-config";
export type DiagnosticSession = {
  answers: number[];
  contact: DiagnosticContact;
  utm: Record<string, string>;
};
const key = "caliber-lucro-2x-diagnostic";
const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

export function loadDiagnostic(): DiagnosticSession {
  if (typeof window === "undefined") return { answers: [], contact: emptyContact, utm: {} };
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(key) ?? "{}",
    ) as Partial<DiagnosticSession>;
    const current = new URLSearchParams(window.location.search);
    const utm = { ...(parsed.utm ?? {}) };
    utmKeys.forEach((name) => {
      const value = current.get(name);
      if (value) utm[name] = value;
    });
    const session = {
      answers: Array.isArray(parsed.answers) ? parsed.answers : [],
      contact: { ...emptyContact, ...parsed.contact },
      utm,
    };
    window.sessionStorage.setItem(key, JSON.stringify(session));
    return session;
  } catch {
    return { answers: [], contact: emptyContact, utm: {} };
  }
}
export function saveDiagnostic(session: DiagnosticSession) {
  if (typeof window !== "undefined") window.sessionStorage.setItem(key, JSON.stringify(session));
}
export function clearDiagnostic() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(key);
}
export function buildCheckoutUrl(base: string, contact: DiagnosticContact) {
  const url = new URL(base);
  if (contact.nome) url.searchParams.set("name", contact.nome);
  if (contact.email) url.searchParams.set("email", contact.email);
  if (contact.whatsapp) url.searchParams.set("phone", contact.whatsapp.replace(/\D/g, ""));
  const stored = loadDiagnostic().utm;
  utmKeys.forEach((name) => {
    if (stored[name]) url.searchParams.set(name, stored[name]);
  });
  return url.toString();
}
