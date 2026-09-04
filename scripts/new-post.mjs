import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const blogDir = path.join(root, "src/content/blog");

const title = process.argv.slice(2).join(" ").trim();

if (!title) {
  console.error('Usage: npm run new:post -- "My post title"');
  process.exit(1);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const slug = slugify(title);
const date = new Date().toISOString().slice(0, 10);
const outPath = path.join(blogDir, `${slug}.md`);

if (fs.existsSync(outPath)) {
  console.error(`A post already exists at ${path.relative(root, outPath)}`);
  process.exit(1);
}

const template = `---
title: ${title}
date: ${date}
excerpt: One or two sentences that show up in listings and search metadata.
author: Aptenodyte Team
# coverImage: /blog/your-image.jpg
draft: true
---

Write the post here in Markdown.

## A section

Body text.
`;

fs.mkdirSync(blogDir, { recursive: true });
fs.writeFileSync(outPath, template, "utf8");
console.log(`Created ${path.relative(root, outPath)}`);
console.log("It is a draft — set `draft: false` when ready to publish.");
