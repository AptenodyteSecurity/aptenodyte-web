import type { Metadata } from "next";
import PostCard from "@/components/blog/PostCard";
import { getAllPostsMeta } from "@/lib/blog/load";

export const metadata: Metadata = {
  title: "Blog — Aptenodyte",
  description:
    "Notes on compliance, security, and building Aptenodyte.",
};

export default function BlogPage() {
  const posts = getAllPostsMeta();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-5xl flex-1 px-6 py-10"
    >
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-black">Blog</h1>
        <p className="mt-4 text-lg text-zinc-800">
          Notes on compliance, security, and building Aptenodyte.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="mt-10 border-2 border-black bg-white px-4 py-3 text-zinc-800">
          No posts yet. Check back soon.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
