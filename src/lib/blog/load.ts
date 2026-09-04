import { markdownToSafeHtml, readingTimeMinutes } from "@/lib/blog/sanitize";
import type { BlogPost, BlogPostMeta, BlogPostRow } from "@/lib/blog/types";
import { createClient } from "@/lib/supabase/server";

function publishedDate(row: BlogPostRow): string {
  if (row.published_at) {
    return row.published_at.slice(0, 10);
  }
  return "1970-01-01";
}

function toMeta(row: BlogPostRow): BlogPostMeta {
  return {
    slug: row.slug,
    title: row.title,
    date: publishedDate(row),
    excerpt: row.excerpt,
    author: row.author_name,
    coverImage: row.cover_image_url,
    draft: !row.published,
    readingTimeMinutes: readingTimeMinutes(row.body),
  };
}

function toPost(row: BlogPostRow): BlogPost {
  return {
    ...toMeta(row),
    contentHtml: markdownToSafeHtml(row.body),
  };
}

const SELECT_COLUMNS =
  "slug, title, excerpt, body, cover_image_url, author_name, published, published_at";

export async function getAllPostsMeta(): Promise<BlogPostMeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT_COLUMNS)
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as BlogPostRow[]).map(toMeta);
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toPost(data as BlogPostRow);
}

/** Admin listing: RLS returns unpublished rows only for Aptenodyte admins. */
export async function listStudioPosts(): Promise<BlogPostMeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT_COLUMNS)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error || !data) {
    return [];
  }

  return (data as BlogPostRow[]).map(toMeta);
}

export async function getStudioPost(slug: string): Promise<
  | (BlogPostMeta & { body: string })
  | null
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as BlogPostRow;
  return {
    ...toMeta(row),
    body: row.body,
  };
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function formatPostDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? isoDate : DATE_FORMAT.format(parsed);
}
