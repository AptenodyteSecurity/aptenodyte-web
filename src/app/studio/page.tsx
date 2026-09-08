import Link from "next/link";
import DeletePostButton from "@/components/studio/DeletePostButton";
import StudioNav from "@/components/studio/StudioNav";
import { formatPostDate, listStudioPosts } from "@/lib/blog/load";

type StudioHomeProps = {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
};

export default async function StudioHome({ searchParams }: StudioHomeProps) {
  const { saved, deleted, error } = await searchParams;
  const posts = await listStudioPosts();

  return (
    <>
      <StudioNav />

      <header className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Posts</h1>
          <p className="mt-1 text-sm text-zinc-700">
            {posts.length} {posts.length === 1 ? "post" : "posts"} in the
            database
          </p>
        </div>
        <Link
          href="/studio/new"
          className="inline-flex min-h-11 items-center justify-center border-2 border-yellow-500 bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-500"
        >
          New post
        </Link>
      </header>

      <p className="mt-4 border-2 border-black bg-white px-4 py-3 text-xs text-zinc-700">
        Aptenodyte admins can publish here. Posts are stored in Postgres; cover
        images go to Storage. The public blog only shows published posts.
      </p>

      {saved ? (
        <p className="mt-4 border-2 border-black bg-white px-4 py-2 text-sm text-black">
          Saved.
        </p>
      ) : null}
      {deleted ? (
        <p className="mt-4 border-2 border-black bg-white px-4 py-2 text-sm text-black">
          Post deleted.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 border-2 border-black bg-yellow-100 px-4 py-2 text-sm text-black">
          {error}
        </p>
      ) : null}

      <ul className="mt-6 flex flex-col gap-3">
        {posts.length === 0 ? (
          <li className="border-2 border-black bg-white px-4 py-6 text-sm text-zinc-700">
            No posts yet. Create your first one.
          </li>
        ) : (
          posts.map((post) => (
            <li
              key={post.slug}
              className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-bold text-black">
                  <Link
                    href={`/studio/${post.slug}`}
                    className="hover:bg-zinc-200"
                  >
                    {post.title || post.slug}
                  </Link>
                  {post.draft ? (
                    <span className="border-2 border-black px-1 text-xs font-semibold">
                      Draft
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs text-zinc-700">
                  {formatPostDate(post.date)} · /blog/{post.slug}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/studio/${post.slug}`}
                  className="min-h-9 border-2 border-black bg-white px-3 py-1 text-sm font-semibold text-black hover:bg-zinc-200"
                >
                  Edit
                </Link>
                <DeletePostButton slug={post.slug} title={post.title} />
              </div>
            </li>
          ))
        )}
      </ul>
    </>
  );
}
