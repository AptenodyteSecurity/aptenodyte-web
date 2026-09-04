/**
 * Minimal YAML-frontmatter parser — enough for blog post metadata without
 * pulling in a YAML dependency. Matches the hand-rolled-parser style used by
 * `scripts/import-frameworks.mjs`.
 *
 * Supports:
 *   key: value                       (string / number / boolean)
 *   key: "quoted value"              (single or double quotes)
 *   key: [one, two, "three"]         (inline array)
 *   key:                             (block array)
 *     - one
 *     - two
 */

export type FrontmatterValue = string | boolean | string[];

export type ParsedFrontmatter = {
  data: Record<string, FrontmatterValue>;
  content: string;
};

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  if (trimmed.length >= 2 && trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }
  return trimmed;
}

/** Serialize a scalar for a frontmatter value line. */
export function toYamlScalar(value: string | boolean): string {
  if (typeof value === "boolean") return String(value);
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function parseScalar(value: string): FrontmatterValue {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => stripQuotes(item));
  }

  return stripQuotes(trimmed);
}

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { data: {}, content: raw.trim() };
  }

  const data: Record<string, FrontmatterValue> = {};
  const lines = match[1].split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):(.*)$/);
    if (!keyMatch) continue;

    const key = keyMatch[1];
    const rest = keyMatch[2].trim();

    if (rest) {
      data[key] = parseScalar(rest);
      continue;
    }

    // Block array: collect following "  - item" lines.
    const items: string[] = [];
    while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
      items.push(stripQuotes(lines[i + 1].replace(/^\s*-\s+/, "")));
      i++;
    }
    data[key] = items;
  }

  const content = raw.slice(match[0].length).trim();
  return { data, content };
}
