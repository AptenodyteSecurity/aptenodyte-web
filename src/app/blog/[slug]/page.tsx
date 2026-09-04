import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPostDate, getPost, getPostSlugs } from "@/lib/blog/load";

type BlogPostProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return { title: "Not found" };
  }

  return {
    title: `${post.title} — Aptenodyte Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    notFound();
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-3xl flex-1 px-6 py-10"
    >
      <Link
        href="/blog"
        className="text-sm font-semibold text-black underline underline-offset-4"
      >
        ← All posts
      </Link>

      <article className="mt-6">
        <header className="border-b-2 border-black pb-6">
          <h1 className="text-4xl font-bold tracking-tight text-black">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-zinc-700">
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
        </header>

        <div
          className="blog-prose mt-8"
          // Content is authored in-repo as trusted markdown and compiled at build time.
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </main>
  );
}
