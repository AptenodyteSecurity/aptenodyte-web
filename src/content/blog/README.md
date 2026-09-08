# Blog content (legacy files)

Posts now live in the `blog_posts` table. These Markdown files are only a
seed source for `npm run migrate:blog`.

## Publish

Sign in with an Aptenodyte owner/admin account and use `/studio`, or the
New post / Edit controls on `/blog` (admin-only).

Cover images upload to the `blog-covers` Storage bucket.

## One-time migration

1. Apply `supabase/migrations/` in the SQL editor (orgs first, then blog).
2. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.
3. Run `npm run migrate:blog`.
4. Confirm the post appears on `/blog`, then you can ignore these files.
