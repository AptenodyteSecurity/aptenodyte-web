import Image from "next/image";
import Link from "next/link";
import { formatPostDate } from "@/lib/blog/load";
import type { BlogPostMeta } from "@/lib/blog/types";

type PostCardProps = {
  post: BlogPostMeta;
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="flex flex-col border-2 border-black bg-white">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] w-full border-b-2 border-black bg-zinc-100">
          {post.coverImage &&
          (post.coverImage.startsWith("/") ||
            post.coverImage.startsWith("https://")) ? (
            <Image
              src={post.coverImage}
              alt=""
              fill
              sizes="(min-width: 640px) 24rem, 100vw"
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Aptenodyte
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-xl font-bold leading-snug tracking-tight text-black">
          <Link href={`/blog/${post.slug}`} className="hover:bg-zinc-200">
            {post.title}
          </Link>
        </h2>

        <p className="mt-2 text-xs text-zinc-700">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          {" · "}
          {post.readingTimeMinutes} min read
          {post.draft ? (
            <span className="ml-2 border-2 border-black px-1 font-semibold text-black">
              Draft
            </span>
          ) : null}
        </p>

        <p className="mt-3 text-sm text-zinc-800">{post.excerpt}</p>

        <Link
          href={`/blog/${post.slug}`}
          className="mt-auto inline-flex pt-4 text-sm font-semibold text-black underline underline-offset-4"
        >
          Read post
          <span className="sr-only">: {post.title}</span>
        </Link>
      </div>
    </article>
  );
}
