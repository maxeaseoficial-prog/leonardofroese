import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

const RPM_SOURCE_URL = "https://caliber-summit-forge.lovable.app/";

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
        src={RPM_SOURCE_URL}
        title="RPM Summit"
        className="h-[100dvh] w-full border-0 bg-black"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </main>
  );
}
