import Link from "next/link";
import { notFound } from "next/navigation";
import PostEditor from "@/components/studio/PostEditor";
import StudioNav from "@/components/studio/StudioNav";
import { readPostSource } from "@/lib/studio/posts";

type EditPostProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditPostPage({
  params,
  searchParams,
}: EditPostProps) {
  const { slug } = await params;
  const { saved } = await searchParams;
  const post = readPostSource(slug);
  if (!post) {
    notFound();
  }

  return (
    <>
      <StudioNav />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Edit: {post.title || post.slug}
        </h1>
        <Link
          href={`/blog/${post.slug}`}
          className="text-sm font-semibold text-black underline underline-offset-4"
          target="_blank"
        >
          View on site ↗
        </Link>
      </div>

      {saved ? (
        <p className="mt-4 border-2 border-black bg-white px-4 py-2 text-sm text-black">
          Saved.
        </p>
      ) : null}

      <PostEditor mode="edit" initial={post} />
    </>
  );
}
