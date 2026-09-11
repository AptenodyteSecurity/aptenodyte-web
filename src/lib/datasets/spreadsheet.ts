import { DATASET_MAX_BYTES } from "@/lib/datasets/limits";
import { isXlsxMagic, matrixToRecords, parseCsv } from "@/lib/datasets/parse";
import { validateParsedDataset } from "@/lib/datasets/validate";
import type { ParsedDataset } from "@/lib/datasets/types";

function extensionOf(filename: string) {
  const match = filename.toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export async function parseSpreadsheet(
  filename: string,
  bytes: Uint8Array,
): Promise<ParsedDataset> {
  const ext = extensionOf(filename);

  if (ext === ".xlsx" || isXlsxMagic(bytes)) {
    if (ext !== ".xlsx") {
      throw new Error("Spreadsheet uploads must use a .xlsx filename.");
    }
    if (!isXlsxMagic(bytes)) {
      throw new Error("That file does not look like a valid .xlsx spreadsheet.");
    }
    return parseXlsx(bytes);
  }

  if (ext !== ".csv") {
    throw new Error("Upload a .csv or .xlsx file.");
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const matrix = parseCsv(text);
  const parsed = matrixToRecords(matrix);
  return validateParsedDataset(parsed.columns, parsed.rows);
}

async function parseXlsx(bytes: Uint8Array): Promise<ParsedDataset> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(bytes, {
    type: "array",
    cellDates: false,
    dense: true,
  });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("The spreadsheet has no sheets.");
  }

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  });

  const stringMatrix = matrix.map((row) =>
    (row ?? []).map((cell) => String(cell ?? "").trim()),
  );
  const parsed = matrixToRecords(stringMatrix);
  return validateParsedDataset(parsed.columns, parsed.rows);
}

export function assertFileSize(byteSize: number) {
  if (byteSize <= 0) {
    throw new Error("Choose a file to upload.");
  }
  if (byteSize > DATASET_MAX_BYTES) {
    throw new Error("File must be 4 MB or smaller.");
  }
}
