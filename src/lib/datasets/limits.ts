export const DATASET_MAX_BYTES = 4 * 1024 * 1024;
export const DATASET_MAX_ROWS = 5_000;
export const DATASET_MAX_COLUMNS = 40;
export const DATASET_UPLOAD_WINDOW_MS = 60 * 60 * 1000;
export const DATASET_UPLOAD_LIMIT = 20;

export const DATASET_EXTENSIONS = [".csv", ".xlsx"] as const;

export const DATASET_CONTENT_TYPES = new Set([
  "text/csv",
  "text/plain",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
]);
