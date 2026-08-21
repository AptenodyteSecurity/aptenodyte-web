import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const csvPath = path.join(root, "src/lib/frameworks/compliance-frameworks.csv");
const outPath = path.join(root, "src/lib/frameworks/frameworks.json");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // ignore CR; LF handles row end
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function splitMulti(value) {
  if (!value || !value.trim()) return [];
  return value
    .split(/[|;]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const raw = fs.readFileSync(csvPath, "utf8");
const rows = parseCsv(raw);
const headers = rows[0];
const dataRows = rows.slice(1);

const frameworks = dataRows.map((cells) => {
  const record = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));

  return {
    frameworkId: record.framework_id,
    name: record.name,
    alsoKnownAs: splitMulti(record.also_known_as),
    jurisdiction: record.jurisdiction,
    region: record.region,
    category: record.category,
    type: record.type,
    issuingBody: record.issuing_body,
    officialUrl: record.official_url,
    scopeSummary: record.scope_summary,
    keyObligationsSummary: record.key_obligations_summary,
    mandatoryVsVoluntary: record.mandatory_vs_voluntary,
    researchSourceUrls: splitMulti(record.research_source_urls),
  };
});

fs.writeFileSync(outPath, `${JSON.stringify(frameworks, null, 2)}\n`, "utf8");
console.log(`Wrote ${frameworks.length} frameworks to ${path.relative(root, outPath)}`);
