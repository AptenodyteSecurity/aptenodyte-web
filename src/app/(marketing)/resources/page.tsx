import type { Metadata } from "next";
import FrameworkLibrary from "@/components/resources/FrameworkLibrary";
import { getFrameworksWithCoverage } from "@/lib/frameworks/load";

export const metadata = {
  title: "Resources — Aptenodyte",
  description:
    "Searchable library of common compliance frameworks. Informational research only — not legal advice.",
};

export default function ResourcesPage() {
  const frameworks = getFrameworksWithCoverage();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-6xl flex-1 px-6 py-10"
    >
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-black">Resources</h1>
        <p className="mt-4 text-lg text-zinc-800">
          A searchable library of compliance frameworks for product and planning
          research.
        </p>
        <p className="mt-3 border-2 border-black bg-white px-4 py-3 text-sm text-zinc-700">
          <strong className="text-black">Disclaimer:</strong> This library is
          informational research only. It is not legal advice, not a substitute
          for counsel, and not a certification or audit opinion. Laws, scopes,
          and requirements change — confirm current obligations with qualified
          professionals for each customer and jurisdiction.
        </p>
      </header>

      <FrameworkLibrary frameworks={frameworks} />
    </main>
  );
}
