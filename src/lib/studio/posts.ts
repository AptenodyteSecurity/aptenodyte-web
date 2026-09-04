import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter, toYamlScalar } from "@/lib/blog/frontmatter";
import type { BlogFrontmatter } from "@/lib/blog/types";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");
const RESERVED_SLUGS = new Set(["new", "login", "readme"]);

export type PostSource = BlogFrontmatter & {
  slug: string;
  body: string;
};

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

export class StudioWriteError extends Error {}

/** Writes are safe locally; on a serverless/static host they will not persist. */
export function writesEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.STUDIO_ALLOW_WRITES === "true"
  );
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function assertSafeSlug(slug: string): void {
  if (!/^[a-z0-9-]+$/.test(slug) || RESERVED_SLUGS.has(slug)) {
    throw new StudioWriteError(`Invalid slug: "${slug}"`);
  }
}

function filePath(slug: string): string {
  return path.join(BLOG_DIR, `${slug}.md`);
}

export function listPostSources(): PostSource[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md") && file.toLowerCase() !== "readme.md")
    .map((file) => readPostSource(file.replace(/\.md$/, "")))
    .filter((post): post is PostSource => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function readPostSource(slug: string): PostSource | null {
  const target = filePath(slug);
  if (!fs.existsSync(target)) return null;

  const { data, content } = parseFrontmatter(fs.readFileSync(target, "utf8"));
  return {
    slug,
    title: typeof data.title === "string" ? data.title : "",
    date: typeof data.date === "string" ? data.date : "",
    excerpt: typeof data.excerpt === "string" ? data.excerpt : "",
    author: typeof data.author === "string" ? data.author : "",
    coverImage:
      typeof data.coverImage === "string" && data.coverImage.trim()
        ? data.coverImage.trim()
        : null,
    draft: data.draft === true,
    body: content,
  };
}

export function serializePost(input: Omit<PostInput, "slug">): string {
  const lines = [
    "---",
    `title: ${toYamlScalar(input.title)}`,
    `date: ${input.date}`,
    `excerpt: ${toYamlScalar(input.excerpt)}`,
    `author: ${toYamlScalar(input.author)}`,
    ...(input.coverImage
      ? [`coverImage: ${toYamlScalar(input.coverImage)}`]
      : []),
    `draft: ${input.draft}`,
    "---",
    "",
    input.body.trim(),
    "",
  ];
  return lines.join("\n");
}

function validate(input: PostInput): string[] {
  const errors: string[] = [];
  if (!input.title.trim()) errors.push("Title is required.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    errors.push("Date must be in YYYY-MM-DD format.");
  }
  if (!input.excerpt.trim()) errors.push("Excerpt is required.");
  if (!input.author.trim()) errors.push("Author is required.");
  if (!input.body.trim()) errors.push("Body is required.");
  if (input.coverImage && !input.coverImage.startsWith("/")) {
    errors.push(
      "Cover image must be a path under public/, starting with / (e.g. /blog/foo.jpg).",
    );
  }
  return errors;
}

export type SaveResult =
  | { ok: true; slug: string; persisted: boolean }
  | { ok: false; errors: string[] };

export function savePostSource(
  input: PostInput,
  { previousSlug }: { previousSlug?: string } = {},
): SaveResult {
  const errors = validate(input);
  const slug = input.slug.trim() || slugify(input.title);

  try {
    assertSafeSlug(slug);
  } catch (error) {
    errors.push((error as Error).message);
  }

  if (errors.length > 0) return { ok: false, errors };

  const isRename = previousSlug && previousSlug !== slug;
  if (
    (isRename || !previousSlug) &&
    fs.existsSync(filePath(slug))
  ) {
    return { ok: false, errors: [`A post with slug "${slug}" already exists.`] };
  }

  if (!writesEnabled()) {
    throw new StudioWriteError(
      "Saving is disabled in this environment. Run the site locally, or set STUDIO_ALLOW_WRITES=true on a persistent host.",
    );
  }

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.writeFileSync(filePath(slug), serializePost(input), "utf8");
  if (isRename && fs.existsSync(filePath(previousSlug))) {
    fs.rmSync(filePath(previousSlug));
  }

  return { ok: true, slug, persisted: true };
}

export function deletePostSource(slug: string): void {
  assertSafeSlug(slug);
  if (!writesEnabled()) {
    throw new StudioWriteError(
      "Deleting is disabled in this environment.",
    );
  }
  if (fs.existsSync(filePath(slug))) {
    fs.rmSync(filePath(slug));
  }
}
