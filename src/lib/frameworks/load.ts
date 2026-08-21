import { coverageEntries } from "./coverage";
import frameworksData from "./frameworks.json";
import type { CoverageStatus, Framework } from "./types";

export const frameworks = frameworksData as Framework[];

export type FrameworkWithCoverage = Framework & {
  coverageStatus: CoverageStatus | null;
};

const coverageById = new Map(
  coverageEntries.map((entry) => [entry.frameworkId, entry.status]),
);

export function getFrameworksWithCoverage(): FrameworkWithCoverage[] {
  return frameworks.map((framework) => ({
    ...framework,
    coverageStatus: coverageById.get(framework.frameworkId) ?? null,
  }));
}
