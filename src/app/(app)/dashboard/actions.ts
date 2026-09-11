"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireSignedIn } from "@/lib/auth/context";
import {
  DATASET_CONTENT_TYPES,
  DATASET_UPLOAD_LIMIT,
  DATASET_UPLOAD_WINDOW_MS,
} from "@/lib/datasets/limits";
import { assertFileSize, parseSpreadsheet } from "@/lib/datasets/spreadsheet";
import type { UploadDatasetState } from "@/lib/datasets/types";
import { getMemberships } from "@/lib/orgs/getMemberships";
import { createClient } from "@/lib/supabase/server";

const initialFailure = (error: string): UploadDatasetState => ({
  error,
  success: null,
});

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof File !== "undefined" &&
    value instanceof File &&
    value.name.length > 0
  );
}

function safeFilename(name: string) {
  const base = name.replace(/[/\\]/g, "").trim() || "upload.csv";
  return base.slice(0, 180);
}

function contentTypeFor(file: File) {
  if (file.type && DATASET_CONTENT_TYPES.has(file.type)) {
    return file.type;
  }
  return file.name.toLowerCase().endsWith(".xlsx")
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv";
}

async function assertUploadRate(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const since = new Date(Date.now() - DATASET_UPLOAD_WINDOW_MS).toISOString();
  const { count, error } = await supabase
    .from("dataset_uploads")
    .select("id", { count: "exact", head: true })
    .eq("uploaded_by", userId)
    .gte("created_at", since);

  if (error) {
    return null;
  }
  if ((count ?? 0) >= DATASET_UPLOAD_LIMIT) {
    return "Too many uploads in a short time. Wait a bit and try again.";
  }
  return null;
}

export async function uploadDataset(
  _prev: UploadDatasetState,
  formData: FormData,
): Promise<UploadDatasetState> {
  const ctx = await requireSignedIn("/dashboard");
  const memberships = await getMemberships();
  const org = memberships[0]?.organization;

  if (!org) {
    return initialFailure(
      "No organization is attached to this account yet, so uploads are disabled.",
    );
  }

  const raw = formData.get("file");
  if (!isUploadFile(raw)) {
    return initialFailure("Choose a CSV or XLSX file to upload.");
  }

  try {
    assertFileSize(raw.size);
  } catch (error) {
    return initialFailure(
      error instanceof Error ? error.message : "File is too large.",
    );
  }

  const rateError = await assertUploadRate(ctx.userId);
  if (rateError) {
    return initialFailure(rateError);
  }

  const bytes = new Uint8Array(await raw.arrayBuffer());
  let parsed;
  try {
    parsed = await parseSpreadsheet(raw.name, bytes);
  } catch (error) {
    return initialFailure(
      error instanceof Error
        ? error.message
        : "Could not read that spreadsheet.",
    );
  }

  const uploadId = randomUUID();
  const filename = safeFilename(raw.name);
  const storagePath = `${org.id}/${uploadId}/${filename}`;
  const contentType = contentTypeFor(raw);
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage
    .from("dataset-uploads")
    .upload(storagePath, bytes, {
      contentType,
      upsert: false,
    });

  if (storageError) {
    return initialFailure(saveFailureMessage(storageError));
  }

  const { error: insertError } = await supabase.from("dataset_uploads").insert({
    id: uploadId,
    org_id: org.id,
    uploaded_by: ctx.userId,
    original_filename: filename,
    content_type: contentType,
    storage_path: storagePath,
    byte_size: raw.size,
    row_count: parsed.rows.length,
    columns: parsed.columns,
    rows: parsed.rows,
  });

  if (insertError) {
    await supabase.storage.from("dataset-uploads").remove([storagePath]);
    return initialFailure(saveFailureMessage(insertError));
  }

  revalidatePath("/dashboard");
  return {
    error: null,
    success: {
      filename,
      rowCount: parsed.rows.length,
      columnCount: parsed.columns.length,
    },
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function deleteDataset(
  uploadId: string,
): Promise<{ error: string | null }> {
  await requireSignedIn("/dashboard");

  if (!UUID_RE.test(uploadId)) {
    return { error: "That dataset could not be found." };
  }

  const supabase = await createClient();
  const { data, error: loadError } = await supabase
    .from("dataset_uploads")
    .select("id, storage_path")
    .eq("id", uploadId)
    .maybeSingle();

  if (loadError) {
    return { error: saveFailureMessage(loadError) };
  }
  if (!data) {
    return { error: "That dataset could not be found." };
  }

  const storagePath =
    typeof data.storage_path === "string" ? data.storage_path : null;
  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from("dataset-uploads")
      .remove([storagePath]);
    if (storageError) {
      return { error: saveFailureMessage(storageError) };
    }
  }

  const { error: deleteError } = await supabase
    .from("dataset_uploads")
    .delete()
    .eq("id", uploadId);

  if (deleteError) {
    return { error: saveFailureMessage(deleteError) };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

function saveFailureMessage(error: { code?: string; message?: string }): string {
  if (
    error.code === "42P01" ||
    /relation .* does not exist/i.test(error.message ?? "")
  ) {
    return "The dataset_uploads table is missing. Apply supabase/migrations/20260911140000_dataset_uploads.sql.";
  }
  if (
    error.code === "42501" ||
    /row-level security/i.test(error.message ?? "") ||
    /violates row-level security/i.test(error.message ?? "")
  ) {
    return "Upload blocked by permissions. Confirm you belong to an organization and the dataset policies are applied.";
  }
  if (/Bucket not found/i.test(error.message ?? "")) {
    return "Storage bucket dataset-uploads is missing. Apply the dataset_uploads migration.";
  }
  return `Could not complete that request${error.message ? `: ${error.message}` : "."}`;
}
