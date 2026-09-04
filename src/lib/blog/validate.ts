const RESERVED_SLUGS = new Set(["new", "login", "readme", "studio"]);

export const POST_LIMITS = {
  slug: 80,
  title: 200,
  excerpt: 500,
  author: 80,
  body: 100_000,
} as const;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, POST_LIMITS.slug);
}

export function isSafeSlug(slug: string): boolean {
  return (
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
    slug.length <= POST_LIMITS.slug &&
    !RESERVED_SLUGS.has(slug)
  );
}

export type PostInput = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  coverImage: string | null;
  draft: boolean;
  body: string;
};

export function validatePostInput(input: PostInput): string[] {
  const errors: string[] = [];
  if (!input.title.trim()) errors.push("Title is required.");
  if (input.title.length > POST_LIMITS.title) {
    errors.push(`Title must be at most ${POST_LIMITS.title} characters.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    errors.push("Date must be in YYYY-MM-DD format.");
  }
  if (!input.excerpt.trim()) errors.push("Excerpt is required.");
  if (input.excerpt.length > POST_LIMITS.excerpt) {
    errors.push(`Excerpt must be at most ${POST_LIMITS.excerpt} characters.`);
  }
  if (!input.author.trim()) errors.push("Author is required.");
  if (input.author.length > POST_LIMITS.author) {
    errors.push(`Author must be at most ${POST_LIMITS.author} characters.`);
  }
  if (!input.body.trim()) errors.push("Body is required.");
  if (input.body.length > POST_LIMITS.body) {
    errors.push(`Body must be at most ${POST_LIMITS.body} characters.`);
  }
  if (!isSafeSlug(input.slug)) {
    errors.push(`Invalid slug: "${input.slug}"`);
  }
  if (input.coverImage && !isSafeCoverUrl(input.coverImage)) {
    errors.push("Cover image must be an https URL or a path starting with /.");
  }
  return errors;
}

export function isSafeCoverUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("..")) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}
