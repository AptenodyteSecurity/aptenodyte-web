export type BlogPostMeta = {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-09-03". */
  date: string;
  excerpt: string;
  author: string;
  /** Public URL or same-origin path for the cover image. */
  coverImage: string | null;
  /** Unpublished posts are hidden from the public site. */
  draft: boolean;
  readingTimeMinutes: number;
};

export type BlogPost = BlogPostMeta & {
  /** Sanitized HTML for the post body. */
  contentHtml: string;
};

export type BlogPostRow = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image_url: string | null;
  author_name: string;
  published: boolean;
  published_at: string | null;
};
