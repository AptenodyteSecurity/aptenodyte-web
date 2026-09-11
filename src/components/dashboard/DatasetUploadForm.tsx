"use client";

import { useActionState } from "react";
import { uploadDataset } from "@/app/(app)/dashboard/actions";
import {
  DATASET_MAX_BYTES,
  DATASET_MAX_ROWS,
} from "@/lib/datasets/limits";
import type { UploadDatasetState } from "@/lib/datasets/types";
import { ctaLoginClassName } from "@/lib/nav";

const initialState: UploadDatasetState = { error: null, success: null };

const maxMb = Math.round(DATASET_MAX_BYTES / (1024 * 1024));

export default function DatasetUploadForm({
  orgName,
  disabledReason,
}: {
  orgName: string | null;
  disabledReason: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    uploadDataset,
    initialState,
  );
  return (
    <form
      action={formAction}
      className="border-2 border-black bg-white p-6"
    >
      <h2 className="text-xl font-bold tracking-tight text-black">
        Upload a dataset
      </h2>
      <p className="mt-2 text-sm text-zinc-700">
        CSV or Excel (.xlsx). Any columns are fine — we only cap size at {maxMb}{" "}
        MB and {DATASET_MAX_ROWS.toLocaleString()} rows.
        {orgName ? ` Saved to ${orgName}.` : ""}
      </p>

      {disabledReason ? (
        <p className="mt-4 border-2 border-black bg-yellow-100 px-4 py-3 text-sm text-black">
          {disabledReason}
        </p>
      ) : null}

      <div className="mt-5">
        <label htmlFor="dataset-file" className="text-sm font-semibold text-black">
          Spreadsheet
        </label>
        <input
          id="dataset-file"
          name="file"
          type="file"
          accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          required
          disabled={pending || Boolean(disabledReason)}
          className="mt-2 block w-full min-h-11 border-2 border-black bg-white px-3 py-2 text-sm text-black file:mr-3 file:rounded-2xl file:border-2 file:border-black file:bg-yellow-400 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-black hover:file:bg-yellow-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending || Boolean(disabledReason)}
        className={`mt-5 ${ctaLoginClassName} rounded-2xl disabled:opacity-60`}
      >
        {pending ? "Uploading…" : "Upload and save"}
      </button>

      {state.error ? (
        <p
          role="alert"
          className="mt-4 border-2 border-black bg-white px-4 py-3 text-sm text-black"
        >
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p
          role="status"
          className="mt-4 border-2 border-black bg-yellow-100 px-4 py-3 text-sm text-black"
        >
          Saved {state.success.filename}: {state.success.rowCount.toLocaleString()}{" "}
          rows, {state.success.columnCount} columns.
        </p>
      ) : null}
    </form>
  );
}
