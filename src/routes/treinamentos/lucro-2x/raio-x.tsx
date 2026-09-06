import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/treinamentos/lucro-2x/raio-x")({
  beforeLoad: () => {
    throw redirect({ to: "/raio-x" });
  },
});
