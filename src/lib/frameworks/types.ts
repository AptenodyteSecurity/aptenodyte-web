export type Framework = {
  frameworkId: string;
  name: string;
  alsoKnownAs: string[];
  jurisdiction: string;
  region: string;
  category: string;
  type: string;
  issuingBody: string;
  officialUrl: string;
  scopeSummary: string;
  keyObligationsSummary: string;
  mandatoryVsVoluntary: string;
  researchSourceUrls: string[];
};

/** Future-ready coverage labels for Aptenodyte's product scope. */
export type CoverageStatus = "supported" | "in-development" | "research-only";

export type CoverageEntry = {
  frameworkId: string;
  status: CoverageStatus;
};

export const coverageStatusLabels: Record<CoverageStatus, string> = {
  supported: "Supported",
  "in-development": "In Development",
  "research-only": "Research Only",
};
