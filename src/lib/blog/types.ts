export type BlogFrontmatter = {
  title: string;
  /** ISO date, e.g. "2026-09-03". */
  date: string;
  /** One or two sentence summary shown in listings and metadata. */
  excerpt: string;
  author: string;
  /** Optional cover image, as a path under `public/` (e.g. "/blog/foo.jpg"). */
  coverImage: string | null;
  /** Draft posts are hidden from listings and excluded from production builds. */
  draft: boolean;
};

export type BlogPostMeta = BlogFrontmatter & {
  slug: string;
  /** Estimated reading time in whole minutes (min 1). */
  readingTimeMinutes: number;
};

export type BlogPost = BlogPostMeta & {
  /** Rendered HTML for the post body (markdown compiled by `marked`). */
  contentHtml: string;
};
