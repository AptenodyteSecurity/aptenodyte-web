import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminBlogControls from "@/components/blog/AdminBlogControls";
import { formatPostDate, getPost } from "@/lib/blog/load";
import { isSafeCoverUrl } from "@/lib/blog/validate";

export const revalidate = 60;

type BlogPostProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
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
  const post = await getPost(slug);
  if (!post) {
    notFound();
  }

  const coverOk = post.coverImage && isSafeCoverUrl(post.coverImage);

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

      <AdminBlogControls slug={post.slug} />

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
          </p>
        </header>

        {coverOk ? (
          <Image
            src={post.coverImage!}
            alt=""
            width={1600}
            height={900}
            sizes="(min-width: 768px) 48rem, 100vw"
            className="mt-8 w-full border-2 border-black"
            priority
          />
        ) : null}

        <div
          className="blog-prose mt-8"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </main>
  );
}
