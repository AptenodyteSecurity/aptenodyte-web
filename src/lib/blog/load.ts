import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { parseFrontmatter } from "./frontmatter";
import type { BlogFrontmatter, BlogPost, BlogPostMeta } from "./types";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

/** Drafts are visible during local development but never in production builds. */
const INCLUDE_DRAFTS = process.env.NODE_ENV !== "production";

marked.setOptions({ gfm: true, breaks: false });

function readingTimeMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function toFrontmatter(
  slug: string,
  data: Record<string, unknown>,
): BlogFrontmatter {
  const required = ["title", "date", "excerpt", "author"] as const;
  for (const field of required) {
    if (typeof data[field] !== "string" || !(data[field] as string).trim()) {
      throw new Error(
        `Blog post "${slug}" is missing required frontmatter field: ${field}`,
      );
    }
  }

  return {
    title: data.title as string,
    date: data.date as string,
    excerpt: data.excerpt as string,
    author: data.author as string,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    coverImage:
      typeof data.coverImage === "string" && data.coverImage.trim()
        ? data.coverImage.trim()
        : null,
    draft: data.draft === true,
  };
}

function loadFile(fileName: string): BlogPost {
  const slug = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), "utf8");
  const { data, content } = parseFrontmatter(raw);
  const frontmatter = toFrontmatter(slug, data);

  return {
    ...frontmatter,
    slug,
    readingTimeMinutes: readingTimeMinutes(content),
    contentHtml: marked.parse(content) as string,
  };
}

function allPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .filter((file) => file.toLowerCase() !== "readme.md")
    .map(loadFile)
    .filter((post) => INCLUDE_DRAFTS || !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function toMeta(post: BlogPost): BlogPostMeta {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    author: post.author,
    tags: post.tags,
    coverImage: post.coverImage,
    draft: post.draft,
    readingTimeMinutes: post.readingTimeMinutes,
  };
}

export function getAllPostsMeta(): BlogPostMeta[] {
  return allPosts().map(toMeta);
}

export function getPostSlugs(): string[] {
  return allPosts().map((post) => post.slug);
}

export function getPost(slug: string): BlogPost | null {
  return allPosts().find((post) => post.slug === slug) ?? null;
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of allPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function formatPostDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  return Number.isNaN(parsed.getTime()) ? isoDate : DATE_FORMAT.format(parsed);
}
