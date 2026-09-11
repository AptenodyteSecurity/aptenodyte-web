import { DATASET_MAX_COLUMNS, DATASET_MAX_ROWS } from "@/lib/datasets/limits";
import type { ParsedDataset } from "@/lib/datasets/types";

export function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s_]+/g, " ");
}

export function validateParsedDataset(
  columns: string[],
  rows: Record<string, string>[],
): ParsedDataset {
  if (columns.length === 0) {
    throw new Error("The file needs a header row.");
  }

  if (columns.length > DATASET_MAX_COLUMNS) {
    throw new Error(
      `Too many columns (${columns.length}). Limit is ${DATASET_MAX_COLUMNS}.`,
    );
  }

  if (columns.some((column) => column.length === 0)) {
    throw new Error("Every column needs a header name.");
  }

  const seen = new Set<string>();
  for (const column of columns) {
    const key = normalizeHeader(column);
    if (seen.has(key)) {
      throw new Error(`Duplicate column: ${column}`);
    }
    seen.add(key);
  }

  if (rows.length > DATASET_MAX_ROWS) {
    throw new Error(
      `Too many rows (${rows.length}). Limit is ${DATASET_MAX_ROWS}.`,
    );
  }

  return { columns, rows };
}
