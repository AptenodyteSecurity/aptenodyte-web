/**
 * RFC 4180-ish CSV parser. Returns a matrix of string cells.
 */
export function parseCsv(text: string): string[][] {
  const source =
    text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];

    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      continue;
    }

    if (char === "\r") {
      continue;
    }

    field += char;
  }

  if (inQuotes) {
    throw new Error("CSV has an unclosed quote.");
  }

  row.push(field);
  if (row.length > 1 || row[0] !== "" || rows.length === 0) {
    rows.push(row);
  }

  while (rows.length > 0 && isEmptyRow(rows[rows.length - 1])) {
    rows.pop();
  }

  return rows;
}

export function matrixToRecords(matrix: string[][]): {
  columns: string[];
  rows: Record<string, string>[];
} {
  if (matrix.length === 0) {
    throw new Error("The file is empty.");
  }

  const columns = matrix[0].map((header) => header.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < matrix.length; i += 1) {
    const cells = matrix[i];
    if (isEmptyRow(cells)) {
      continue;
    }

    const record: Record<string, string> = {};
    for (let c = 0; c < columns.length; c += 1) {
      record[columns[c]] = String(cells[c] ?? "").trim();
    }
    rows.push(record);
  }

  return { columns, rows };
}

export function isXlsxMagic(bytes: Uint8Array) {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04
  );
}

function isEmptyRow(cells: string[]) {
  return cells.every((cell) => String(cell ?? "").trim() === "");
}
