"use client";

import { markdownToSafeHtml } from "@/lib/blog/sanitize";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { savePost, type SavePostState } from "@/app/studio/actions";

export type EditorInitial = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  coverImage: string | null;
  draft: boolean;
  body: string;
};

type PostEditorProps = {
  mode: "create" | "edit";
  initial: EditorInitial;
};

const EMPTY: SavePostState = { errors: [] };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const fieldClass =
  "min-h-11 w-full border-2 border-black px-3 py-2 text-sm text-black placeholder:text-zinc-600";
const labelClass = "text-sm font-bold text-black";

export default function PostEditor({ mode, initial }: PostEditorProps) {
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [date, setDate] = useState(initial.date);
  const [author, setAuthor] = useState(initial.author);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [draft, setDraft] = useState(initial.draft);
  const [body, setBody] = useState(initial.body);
  const [coverImage] = useState(initial.coverImage ?? "");
  const [coverFileName, setCoverFileName] = useState<string | null>(null);

  const boundSave = savePost.bind(null, mode === "edit" ? initial.slug : null);
  const [state, formAction, pending] = useActionState(boundSave, EMPTY);

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const previewHtml = useMemo(
    () => markdownToSafeHtml(body || "_Nothing yet._"),
    [body],
  );
  const showCover =
    coverImage.startsWith("/") || coverImage.startsWith("https://");

  return (
    <form action={formAction} className="mt-6">
      {state.errors.length > 0 ? (
        <div
          role="alert"
          className="mb-6 border-2 border-black bg-yellow-100 px-4 py-3 text-sm text-black"
        >
          <p className="font-bold">Could not save:</p>
          <ul className="mt-1 list-disc pl-5">
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              value={effectiveSlug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              className={fieldClass}
            />
            <p className="mt-1 text-xs text-zinc-700">
              URL: <code>/blog/{effectiveSlug || "…"}</code>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="date" className={labelClass}>
                Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="author" className={labelClass}>
                Author
              </label>
              <input
                id="author"
                name="author"
                required
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="excerpt" className={labelClass}>
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              required
              rows={2}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              className={`${fieldClass} min-h-0`}
            />
          </div>

          <div>
            <label htmlFor="coverFile" className={labelClass}>
              Cover image{" "}
              <span className="font-normal text-zinc-700">(optional)</span>
            </label>
            <input
              id="coverFile"
              name="coverFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={fieldClass}
              onChange={(event) => {
                const file = event.target.files?.[0];
                setCoverFileName(file && file.size > 0 ? file.name : null);
              }}
            />
            <input type="hidden" name="coverImage" value={coverImage} />
            <p className="mt-1 text-xs text-zinc-700">
              Optional. JPEG, PNG, WebP, or GIF (max 2 MB). Leave empty to save
              without a cover
              {coverFileName ? ` — selected: ${coverFileName}` : ""}
              {coverImage && !coverFileName
                ? " — keeping the current cover unless you pick a new file"
                : ""}
              .
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm font-bold text-black">
            <input
              type="checkbox"
              name="draft"
              checked={draft}
              onChange={(event) => setDraft(event.target.checked)}
              className="size-4 border-2 border-black"
            />
            Draft (hidden from the live site)
          </label>

          <div>
            <label htmlFor="body" className={labelClass}>
              Body (Markdown)
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={18}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className={`${fieldClass} min-h-0 font-mono`}
            />
          </div>
        </div>

        <div>
          <p className={labelClass}>Preview</p>
          <div className="mt-2 border-2 border-black p-4">
            <h1 className="text-3xl font-bold tracking-tight text-black">
              {title || "Untitled"}
            </h1>
            {showCover ? (
              <Image
                src={coverImage}
                alt=""
                width={1600}
                height={900}
                className="mt-4 w-full border-2 border-black"
              />
            ) : null}
            <div
              className="blog-prose mt-4"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center border-2 border-yellow-500 bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-500 disabled:opacity-60"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create post"
              : "Save changes"}
        </button>
        <Link
          href="/studio"
          className="inline-flex min-h-11 items-center justify-center border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
