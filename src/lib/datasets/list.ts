import { createClient } from "@/lib/supabase/server";
import type { DatasetUploadSummary } from "@/lib/datasets/types";

type UploadRow = {
  id: string;
  original_filename: string;
  row_count: number;
  columns: string[] | null;
  created_at: string;
};

export async function listDatasetUploads(
  orgId: string,
): Promise<DatasetUploadSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dataset_uploads")
    .select("id, original_filename, row_count, columns, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error || !data) {
    return [];
  }

  return (data as UploadRow[]).map((row) => ({
    id: row.id,
    originalFilename: row.original_filename,
    rowCount: row.row_count,
    columns: Array.isArray(row.columns) ? row.columns : [],
    createdAt: row.created_at,
  }));
}
