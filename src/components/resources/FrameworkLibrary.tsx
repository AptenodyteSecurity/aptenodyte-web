"use client";

import { useMemo, useState } from "react";
import FrameworkCard from "@/components/resources/FrameworkCard";
import type { FrameworkWithCoverage } from "@/lib/frameworks/load";

type TabId = "common" | "coverage";

type FrameworkLibraryProps = {
  frameworks: FrameworkWithCoverage[];
};

type SortMode = "category" | "name";

function matchesSearch(framework: FrameworkWithCoverage, query: string) {
  if (!query) return true;
  const haystack = [
    framework.name,
    framework.jurisdiction,
    framework.region,
    framework.category,
    framework.type,
    framework.mandatoryVsVoluntary,
    ...framework.alsoKnownAs,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export default function FrameworkLibrary({ frameworks }: FrameworkLibraryProps) {
  const [tab, setTab] = useState<TabId>("common");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("category");
  const [category, setCategory] = useState("all");
  const [jurisdiction, setJurisdiction] = useState("all");
  const [type, setType] = useState("all");
  const [mandatory, setMandatory] = useState("all");

  const tabFrameworks = useMemo(() => {
    if (tab === "coverage") {
      return frameworks.filter((item) => item.coverageStatus !== null);
    }
    return frameworks;
  }, [frameworks, tab]);

  const filterOptions = useMemo(() => {
    const unique = (values: string[]) =>
      [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

    return {
      categories: unique(tabFrameworks.map((item) => item.category)),
      jurisdictions: unique(tabFrameworks.map((item) => item.jurisdiction)),
      types: unique(tabFrameworks.map((item) => item.type)),
      mandatoryOptions: unique(
        tabFrameworks.map((item) => item.mandatoryVsVoluntary),
      ),
    };
  }, [tabFrameworks]);

  const visibleFrameworks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = tabFrameworks.filter((framework) => {
      if (!matchesSearch(framework, normalizedQuery)) return false;
      if (category !== "all" && framework.category !== category) return false;
      if (jurisdiction !== "all" && framework.jurisdiction !== jurisdiction) {
        return false;
      }
      if (type !== "all" && framework.type !== type) return false;
      if (
        mandatory !== "all" &&
        framework.mandatoryVsVoluntary !== mandatory
      ) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "name") {
        return a.name.localeCompare(b.name);
      }
      const byCategory = a.category.localeCompare(b.category);
      if (byCategory !== 0) return byCategory;
      return a.name.localeCompare(b.name);
    });
  }, [
    tabFrameworks,
    query,
    category,
    jurisdiction,
    type,
    mandatory,
    sortMode,
  ]);

  function switchTab(next: TabId) {
    setTab(next);
    setCategory("all");
    setJurisdiction("all");
    setType("all");
    setMandatory("all");
  }

  const selectClassName =
    "min-h-11 w-full border-2 border-black bg-white px-3 py-2 text-sm text-black";

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label="Framework library sections"
        className="flex flex-wrap gap-3"
      >
        <button
          type="button"
          role="tab"
          id="tab-common"
          aria-selected={tab === "common"}
          aria-controls="panel-common"
          className={
            tab === "common"
              ? "min-h-11 border-2 border-yellow-500 bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
              : "min-h-11 border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black"
          }
          onClick={() => switchTab("common")}
        >
          Common frameworks
        </button>
        <button
          type="button"
          role="tab"
          id="tab-coverage"
          aria-selected={tab === "coverage"}
          aria-controls="panel-coverage"
          className={
            tab === "coverage"
              ? "min-h-11 border-2 border-orange-600 bg-orange-500 px-4 py-2 text-sm font-semibold text-black"
              : "min-h-11 border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black"
          }
          onClick={() => switchTab("coverage")}
        >
          Aptenodyte Coverage
        </button>
      </div>

      <div
        role="tabpanel"
        id={tab === "common" ? "panel-common" : "panel-coverage"}
        aria-labelledby={tab === "common" ? "tab-common" : "tab-coverage"}
        className="mt-6"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="framework-search" className="text-sm font-bold text-black">
              Search {tab === "common" ? "common" : "coverage"} frameworks
            </label>
            <input
              id="framework-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, jurisdiction, category…"
              className="mt-2 min-h-11 w-full border-2 border-black px-3 py-2 text-sm text-black placeholder:text-zinc-600"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label htmlFor="sort-mode" className="text-sm font-bold text-black">
                Sort by
              </label>
              <select
                id="sort-mode"
                className={`mt-2 ${selectClassName}`}
                value={sortMode}
                onChange={(event) =>
                  setSortMode(event.target.value as SortMode)
                }
              >
                <option value="category">Category (default)</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-category" className="text-sm font-bold text-black">
                Category
              </label>
              <select
                id="filter-category"
                className={`mt-2 ${selectClassName}`}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="all">All</option>
                {filterOptions.categories.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="filter-jurisdiction"
                className="text-sm font-bold text-black"
              >
                Location / jurisdiction
              </label>
              <select
                id="filter-jurisdiction"
                className={`mt-2 ${selectClassName}`}
                value={jurisdiction}
                onChange={(event) => setJurisdiction(event.target.value)}
              >
                <option value="all">All</option>
                {filterOptions.jurisdictions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filter-type" className="text-sm font-bold text-black">
                Type
              </label>
              <select
                id="filter-type"
                className={`mt-2 ${selectClassName}`}
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="all">All</option>
                {filterOptions.types.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="filter-mandatory"
                className="text-sm font-bold text-black"
              >
                Mandatory vs voluntary
              </label>
              <select
                id="filter-mandatory"
                className={`mt-2 ${selectClassName}`}
                value={mandatory}
                onChange={(event) => setMandatory(event.target.value)}
              >
                <option value="all">All</option>
                {filterOptions.mandatoryOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-zinc-700" aria-live="polite">
          Showing {visibleFrameworks.length} of {tabFrameworks.length}{" "}
          {tab === "common" ? "common" : "coverage"} frameworks.
        </p>

        {tab === "coverage" && tabFrameworks.length === 0 ? (
          <div className="mt-6 border-2 border-black bg-white px-4 py-8 text-center">
            <p className="text-lg font-bold text-black">
              Aptenodyte Coverage is empty for now.
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              Browse Common frameworks for the full research library. As Aptenodyte
              is ready to support specific frameworks, they will appear here.
            </p>
          </div>
        ) : visibleFrameworks.length === 0 ? (
          <p className="mt-6 border-2 border-black px-4 py-6 text-sm text-zinc-700">
            No frameworks match your search and filters.
          </p>
        ) : (
          <ul className="mt-6 flex max-h-[70vh] flex-col gap-3 overflow-y-auto border-2 border-black p-3">
            {visibleFrameworks.map((framework) => (
              <li key={framework.frameworkId}>
                <FrameworkCard
                  framework={framework}
                  showCoverageStatus={tab === "coverage"}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
