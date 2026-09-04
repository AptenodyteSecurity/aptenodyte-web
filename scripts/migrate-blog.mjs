/**
 * One-time: copy Markdown posts from src/content/blog into blog_posts.
 * Requires SUPABASE_SERVICE_ROLE_KEY (server-only) plus the public URL/key.
 *
 *   npm run migrate:blog
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(envPath);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const blogDir = path.join(root, "src/content/blog");

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, content: raw.trim() };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) continue;
    let value = keyMatch[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value === "true") data[keyMatch[1]] = true;
    else if (value === "false") data[keyMatch[1]] = false;
    else data[keyMatch[1]] = value;
  }
  return { data, content: raw.slice(match[0].length).trim() };
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const files = fs
  .readdirSync(blogDir)
  .filter((file) => file.endsWith(".md") && file.toLowerCase() !== "readme.md");

if (files.length === 0) {
  console.log("No markdown posts found.");
  process.exit(0);
}

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(blogDir, file), "utf8");
  const { data, content } = parseFrontmatter(raw);
  const title = String(data.title ?? slug);
  let cover = typeof data.coverImage === "string" ? data.coverImage : null;

  if (cover && cover.startsWith("/")) {
    const localPath = path.join(root, "public", cover.replace(/^\//, ""));
    if (fs.existsSync(localPath)) {
      const bytes = fs.readFileSync(localPath);
      const ext = path.extname(localPath).replace(".", "") || "jpg";
      const storagePath = `migrated/${slugify(slug)}.${ext}`;
      const contentType =
        ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
      const { error: uploadError } = await supabase.storage
        .from("blog-covers")
        .upload(storagePath, bytes, { contentType, upsert: true });
      if (uploadError) {
        console.warn(`Cover upload failed for ${slug}: ${uploadError.message}`);
      } else {
        cover = supabase.storage.from("blog-covers").getPublicUrl(storagePath)
          .data.publicUrl;
      }
    }
  }

  const row = {
    slug,
    title,
    excerpt: String(data.excerpt ?? ""),
    body: content,
    cover_image_url: cover,
    author_name: String(data.author ?? "Aptenodyte Team"),
    published: data.draft !== true,
    published_at: String(data.date ?? new Date().toISOString().slice(0, 10)),
  };

  const { error } = await supabase.from("blog_posts").upsert(row, {
    onConflict: "slug",
  });
  if (error) {
    console.error(`Failed ${slug}: ${error.message}`);
    process.exit(1);
  }
  console.log(`Upserted ${slug}`);
}

console.log("Done.");
