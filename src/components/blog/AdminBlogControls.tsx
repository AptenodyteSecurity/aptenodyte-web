import Link from "next/link";
import { getAuthContext } from "@/lib/auth/context";

export default async function AdminBlogControls({
  slug,
}: {
  slug?: string;
}) {
  const { isAdmin } = await getAuthContext();
  if (!isAdmin) {
    return null;
  }

  return (
    <p className="mt-6 flex flex-wrap gap-3">
      <Link
        href="/studio/new"
        className="inline-flex min-h-11 items-center justify-center border-2 border-yellow-500 bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-500"
      >
        New post
      </Link>
      {slug ? (
        <Link
          href={`/studio/${slug}`}
          className="inline-flex min-h-11 items-center justify-center border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-100"
        >
          Edit post
        </Link>
      ) : null}
    </p>
  );
}
