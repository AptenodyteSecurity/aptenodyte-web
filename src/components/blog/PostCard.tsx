import Link from "next/link";
import { formatPostDate } from "@/lib/blog/load";
import type { BlogPostMeta } from "@/lib/blog/types";

type PostCardProps = {
  post: BlogPostMeta;
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="border-2 border-black bg-white p-6">
      <h2 className="text-2xl font-bold tracking-tight text-black">
        <Link href={`/blog/${post.slug}`} className="hover:bg-zinc-200">
          {post.title}
        </Link>
      </h2>

      <p className="mt-2 text-sm text-zinc-700">
        <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        {" · "}
        {post.author}
        {" · "}
        {post.readingTimeMinutes} min read
        {post.draft ? (
          <span className="ml-2 border-2 border-black px-1 font-semibold text-black">
            Draft
          </span>
        ) : null}
      </p>

      <p className="mt-3 text-base text-zinc-800">{post.excerpt}</p>

      {post.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="border-2 border-black px-2 py-0.5 text-xs font-semibold text-black"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      <Link
        href={`/blog/${post.slug}`}
        className="mt-4 inline-flex text-sm font-semibold text-black underline underline-offset-4"
      >
        Read post
        <span className="sr-only">: {post.title}</span>
      </Link>
    </article>
  );
}
