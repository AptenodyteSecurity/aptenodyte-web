# Blog content

Each post is one Markdown file in this directory. The file name is the URL slug
(`my-post.md` → `/blog/my-post`).

## Create a post

Two ways:

1. **Hidden web editor** at `/studio` (password-protected). Set
   `BLOG_STUDIO_PASSWORD` and `BLOG_STUDIO_SECRET` in `.env.local` (see
   `.env.example`), then visit `/studio`. It lists, creates, edits, and deletes
   posts, with a live Markdown preview. Saving writes `.md` files here; commit
   them to publish. This is a stop-gap until the database-backed editor lands.
2. **CLI scaffold:**

   ```bash
   npm run new:post -- "My post title"
   ```

   Creates `src/content/blog/my-post-title.md` with the required frontmatter,
   marked `draft: true`.

## Frontmatter

| Field     | Required | Notes                                            |
| --------- | -------- | ------------------------------------------------ |
| `title`   | yes      | Post heading and `<title>`                       |
| `date`    | yes      | `YYYY-MM-DD`; controls ordering                  |
| `excerpt` | yes      | Shown in the listing and used as meta description|
| `author`  | yes      | Byline                                           |
| `tags`    | no       | YAML list; rendered as chips                     |
| `draft`   | no       | `true` hides the post from production            |

## Publishing

Set `draft: false`. Drafts are visible with `npm run dev` but are excluded from
`npm run build`. Posts render as static pages via `generateStaticParams`.

The Markdown body is compiled with [`marked`](https://marked.js.org) (GFM) and
styled by the `.blog-prose` rules in `src/app/globals.css`.
