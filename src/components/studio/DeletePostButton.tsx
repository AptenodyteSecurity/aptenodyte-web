"use client";

import { deletePost } from "@/app/studio/actions";

export default function DeletePostButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  return (
    <form
      action={deletePost.bind(null, slug)}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete “${title}”? This cannot be undone.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="min-h-9 border-2 border-black bg-white px-3 py-1 text-sm font-semibold text-black hover:bg-zinc-200"
      >
        Delete
      </button>
    </form>
  );
}
