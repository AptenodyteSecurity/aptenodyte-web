import Link from "next/link";
import { logout } from "@/app/studio/actions";

export default function StudioNav() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="border-2 border-black bg-black px-2 py-0.5 text-xs font-bold tracking-wide text-white">
          STUDIO
        </span>
        <Link
          href="/studio"
          className="text-sm font-bold text-black hover:bg-zinc-200"
        >
          Posts
        </Link>
        <Link
          href="/studio/new"
          className="text-sm font-bold text-black hover:bg-zinc-200"
        >
          New post
        </Link>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="min-h-9 border-2 border-black bg-white px-3 py-1 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
