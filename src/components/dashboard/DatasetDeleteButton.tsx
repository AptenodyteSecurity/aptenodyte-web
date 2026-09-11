"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { deleteDataset } from "@/app/(app)/dashboard/actions";

function getFocusable(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("hidden"));
}

export default function DatasetDeleteButton({
  id,
  filename,
}: {
  id: string;
  filename: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const dialogId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = dialog ? getFocusable(dialog) : [];
    focusable[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialog) {
        return;
      }

      const items = getFocusable(dialog);
      if (items.length === 0) {
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open]);

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteDataset(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black bg-white text-black hover:border-red-600 hover:bg-red-600 hover:text-white"
        aria-label={`Delete ${filename}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <svg
          viewBox="0 0 16 16"
          className="h-4 w-4"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            ref={dialogRef}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-md border-2 border-black bg-white p-5 text-black"
          >
            <h2 id={titleId} className="text-lg font-bold">
              Delete this dataset?
            </h2>
            <p className="mt-3 text-sm text-zinc-800">
              Delete “{filename}”? This is permanent. The file and its parsed
              rows will be removed from Aptenodyte and cannot be recovered.
            </p>
            {error ? (
              <p role="alert" className="mt-3 border-2 border-black px-3 py-2 text-sm">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center border-2 border-black bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                disabled={pending}
                onClick={confirmDelete}
              >
                {pending ? "Deleting…" : "Confirm delete"}
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-100"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
