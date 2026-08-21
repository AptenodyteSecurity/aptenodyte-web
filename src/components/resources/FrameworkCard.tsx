"use client";

import { useId, useState } from "react";
import type { FrameworkWithCoverage } from "@/lib/frameworks/load";
import { coverageStatusLabels } from "@/lib/frameworks/types";

type FrameworkCardProps = {
  framework: FrameworkWithCoverage;
  showCoverageStatus?: boolean;
};

export default function FrameworkCard({
  framework,
  showCoverageStatus = false,
}: FrameworkCardProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const statusLabel =
    showCoverageStatus && framework.coverageStatus
      ? coverageStatusLabels[framework.coverageStatus]
      : null;

  return (
    <article className="border-2 border-black bg-white">
      <button
        type="button"
        className="flex w-full flex-col gap-2 px-4 py-4 text-left"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-black">{framework.name}</h2>
          <span className="text-sm font-semibold text-black" aria-hidden="true">
            {open ? "−" : "+"}
          </span>
        </div>
        <dl className="grid gap-2 text-sm text-zinc-700 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="font-semibold text-black">Jurisdiction</dt>
            <dd>
              {framework.jurisdiction}
              {framework.region ? ` (${framework.region})` : ""}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-black">Category</dt>
            <dd className="capitalize">{framework.category}</dd>
          </div>
          <div>
            <dt className="font-semibold text-black">Type</dt>
            <dd className="capitalize">{framework.type}</dd>
          </div>
          <div>
            <dt className="font-semibold text-black">Mandatory vs voluntary</dt>
            <dd className="capitalize">{framework.mandatoryVsVoluntary}</dd>
          </div>
        </dl>
        {statusLabel ? (
          <p className="text-sm font-semibold text-black">
            Aptenodyte status: {statusLabel}
          </p>
        ) : null}
        <span className="sr-only">
          {open ? "Collapse details" : "Expand details"}
        </span>
      </button>

      <div id={panelId} hidden={!open} className="border-t-2 border-black px-4 py-4">
        {framework.alsoKnownAs.length > 0 ? (
          <p className="text-sm text-zinc-700">
            <span className="font-semibold text-black">Also known as: </span>
            {framework.alsoKnownAs.join("; ")}
          </p>
        ) : null}
        <p className="mt-3 text-sm text-zinc-700">
          <span className="font-semibold text-black">Scope: </span>
          {framework.scopeSummary || "No scope summary available."}
        </p>
        <p className="mt-3 text-sm text-zinc-700">
          <span className="font-semibold text-black">Key obligations: </span>
          {framework.keyObligationsSummary ||
            "No key obligations summary available."}
        </p>
        {framework.officialUrl ? (
          <p className="mt-4">
            <a
              href={framework.officialUrl}
              className="text-sm font-semibold text-black underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              Official source
            </a>
          </p>
        ) : null}
      </div>
    </article>
  );
}
