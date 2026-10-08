import { createFileRoute } from "@tanstack/react-router";
import { useEffect, type SyntheticEvent } from "react";

const RPM_PROXY_URL = "/api/rpm-proxy";

export const Route = createFileRoute("/rpm")({
  head: () => ({
    meta: [
      { title: "RPM Summit | Leonardo Froese" },
      {
        name: "description",
        content:
          "RPM Summit — encontro presencial para empresários e líderes em Cuiabá.",
      },
    ],
  }),
  component: RpmPage,
});

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

function alignMetricBlock(frame: HTMLIFrameElement) {
  const doc = frame.contentDocument;
  if (!doc) return;

  const expected = ["19 anos", "+450 empresas", "10 estados", "+r$ 100 milhões"];
  const elements = Array.from(doc.querySelectorAll("p")).filter((element) =>
    expected.includes(normalizeText(element.textContent)),
  );

  if (elements.length !== 4) return;

  const wrappers = elements
    .map((element) => element.parentElement)
    .filter((element): element is HTMLElement => element instanceof HTMLElement);

  if (wrappers.length !== 4) return;

  const container = wrappers[0]?.parentElement;
  if (!(container instanceof HTMLElement)) return;

  container.style.paddingBottom = "2rem";
  container.style.alignItems = "start";

  for (const wrapper of wrappers) {
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "flex-start";
  }

  for (const value of elements) {
    if (value instanceof HTMLElement) {
      value.style.minHeight = "2.15em";
      value.style.display = "flex";
      value.style.alignItems = "flex-start";
    }
  }
}

function handleFrameLoad(event: SyntheticEvent<HTMLIFrameElement>) {
  const frame = event.currentTarget;

  alignMetricBlock(frame);
  window.setTimeout(() => alignMetricBlock(frame), 250);
  window.setTimeout(() => alignMetricBlock(frame), 900);
}

function RpmPage() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousMargin = document.body.style.margin;

    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.margin = previousMargin;
    };
  }, []);

  return (
    <main className="fixed inset-0 z-[9999] bg-black">
      <iframe
        src={RPM_PROXY_URL}
        title="RPM Summit"
        className="h-[100dvh] w-full border-0 bg-black"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={handleFrameLoad}
      />
    </main>
  );
}
