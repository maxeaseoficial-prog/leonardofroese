import type { ReactNode } from "react";
import { buildCheckoutUrl, loadDiagnostic } from "./diagnostic-session";
import "./funnel.css";

export function FunnelShell({ children }: { children: ReactNode }) {
  return <main className="lucro-funnel">{children}</main>;
}

export function CheckoutButton({
  level = "padrao",
  children,
  secondary = false,
  className = "",
}: {
  level?: "padrao" | "executivo";
  children: ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  const base =
    level === "executivo"
      ? import.meta.env["VITE_KIWIFY_EXECUTIVO"]
      : "https://pay.kiwify.com.br/8v0QHJY";
  const open = () => {
    if (base)
      window.open(
        buildCheckoutUrl(base, loadDiagnostic().contact),
        "_blank",
        "noopener,noreferrer",
      );
  };
  return (
    <button
      type="button"
      className={`${secondary ? "funnel-secondary" : "funnel-primary"} ${level === "padrao" ? "funnel-checkout-padrao" : ""} ${className}`}
      onClick={open}
      disabled={!base}
    >
      {children}
    </button>
  );
}
