import { emptyContact, type DiagnosticContact } from "./diagnostic-config";

export type LiveDiagnosticSession = {
  answers: number[];
  contact: DiagnosticContact;
  utm: Record<string, string>;
};

const key = "caliber-live-lucro-2x-diagnostic";
const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

export function loadLiveDiagnostic(): LiveDiagnosticSession {
  if (typeof window === "undefined") return { answers: [], contact: emptyContact, utm: {} };
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(key) ?? "{}",
    ) as Partial<LiveDiagnosticSession>;
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

export function saveLiveDiagnostic(session: LiveDiagnosticSession) {
  if (typeof window !== "undefined") window.sessionStorage.setItem(key, JSON.stringify(session));
}

export function clearLiveDiagnostic() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(key);
}
