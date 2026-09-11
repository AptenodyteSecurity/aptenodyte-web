export type DatasetRecord = Record<string, string>;

export type ParsedDataset = {
  columns: string[];
  rows: DatasetRecord[];
};

export type DatasetUploadSummary = {
  id: string;
  originalFilename: string;
  rowCount: number;
  columns: string[];
  createdAt: string;
};

export type UploadDatasetState = {
  error: string | null;
  success: {
    filename: string;
    rowCount: number;
    columnCount: number;
  } | null;
};
