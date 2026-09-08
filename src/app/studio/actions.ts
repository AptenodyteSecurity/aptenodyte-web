"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAptenodyteAdmin } from "@/lib/auth/context";
import {
  isSafeCoverUrl,
  slugify,
  validatePostInput,
  type PostInput,
} from "@/lib/blog/validate";
import { createClient } from "@/lib/supabase/server";

export type SavePostState = {
  errors: string[];
  notice?: string;
};

const WRITE_WINDOW_MS = 5 * 60 * 1000;
const WRITE_LIMIT = 20;
const COVER_MAX_BYTES = 2 * 1024 * 1024;
const COVER_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

async function assertWriteRate(userId: string): Promise<string | null> {
  if (!userId) return null;
  const supabase = await createClient();
  const since = new Date(Date.now() - WRITE_WINDOW_MS).toISOString();
  const { count, error } = await supabase
    .from("blog_posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .gte("updated_at", since);

  // If the table is missing or the query fails, do not block the save here.
  if (error) {
    return null;
  }
  if ((count ?? 0) >= WRITE_LIMIT) {
    return "Too many saves in a short time. Wait a few minutes and try again.";
  }
  return null;
}

function readPostInput(formData: FormData): PostInput {
  const title = String(formData.get("title") || "").trim();
  const slugRaw = String(formData.get("slug") || "").trim();
  return {
    slug: slugRaw || slugify(title),
    title,
    date: String(formData.get("date") || "").trim(),
    excerpt: String(formData.get("excerpt") || "").trim(),
    author: String(formData.get("author") || "").trim(),
    coverImage: String(formData.get("coverImage") || "").trim() || null,
    draft: formData.get("draft") === "on",
    body: String(formData.get("body") || ""),
  };
}

function resolveCoverFormat(
  file: File,
): { ext: string; contentType: string } | null {
  if (file.type && COVER_TYPES.has(file.type)) {
    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : file.type === "image/gif"
            ? "gif"
            : "jpg";
    return {
      ext,
      contentType: file.type === "image/jpg" ? "image/jpeg" : file.type,
    };
  }

  const match = file.name.toLowerCase().match(/\.(jpe?g|png|webp|gif)$/);
  if (!match) return null;
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const contentType =
    ext === "png"
      ? "image/png"
      : ext === "webp"
        ? "image/webp"
        : ext === "gif"
          ? "image/gif"
          : "image/jpeg";
  return { ext, contentType };
}

function isCoverFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof File !== "undefined" &&
    value instanceof File &&
    value.size > 0 &&
    value.name.length > 0
  );
}

async function uploadCoverIfPresent(
  formData: FormData,
  userId: string,
): Promise<{ url: string | null; error: string | null }> {
  const raw = formData.get("coverFile");
  // Cover is optional — empty file inputs must not block saving.
  if (!isCoverFile(raw)) {
    return { url: null, error: null };
  }

  if (raw.size > COVER_MAX_BYTES) {
    return { url: null, error: "Cover image must be 2 MB or smaller." };
  }

  const format = resolveCoverFormat(raw);
  if (!format) {
    return {
      url: null,
      error: "Cover image must be JPEG, PNG, WebP, or GIF.",
    };
  }

  const path = `${userId}/${randomUUID()}.${format.ext}`;
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from("blog-covers")
    .upload(path, await raw.arrayBuffer(), {
      contentType: format.contentType,
      upsert: false,
    });

  if (error) {
    const detail = error.message || "unknown storage error";
    return {
      url: null,
      error: `Could not upload the cover image (${detail}). Cover is optional — clear the file to save without one. If this keeps failing, apply the blog_posts migration so the blog-covers bucket exists.`,
    };
  }

  const { data } = supabase.storage.from("blog-covers").getPublicUrl(path);
  if (!isSafeCoverUrl(data.publicUrl)) {
    return { url: null, error: "Cover upload returned an invalid URL." };
  }
  return { url: data.publicUrl, error: null };
}

function revalidateBlog(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/studio");
  revalidatePath(`/studio/${slug}`);
}

function saveFailureMessage(error: { code?: string; message?: string }): string {
  if (error.code === "23505") {
    return "A post with that slug already exists.";
  }
  if (
    error.code === "42P01" ||
    /relation .* does not exist/i.test(error.message ?? "")
  ) {
    return "The blog_posts table is missing. Run supabase/migrations/20260904010000_blog_posts.sql in the Supabase SQL editor.";
  }
  if (
    error.code === "42501" ||
    /row-level security/i.test(error.message ?? "")
  ) {
    return "Save blocked by permissions. Sign in as an Aptenodyte owner/admin, and confirm the blog RLS policies are applied.";
  }
  return `Could not save the post${error.message ? `: ${error.message}` : "."}`;
}

export async function savePost(
  previousSlug: string | null,
  _state: SavePostState,
  formData: FormData,
): Promise<SavePostState> {
  const admin = await requireAptenodyteAdmin(
    previousSlug ? `/studio/${previousSlug}` : "/studio/new",
  );
  if (!admin.userId) {
    return {
      errors: ["Your session is missing a user id. Sign out and sign in again."],
    };
  }

  const rateError = await assertWriteRate(admin.userId);
  if (rateError) {
    return { errors: [rateError] };
  }

  const input = readPostInput(formData);
  const uploaded = await uploadCoverIfPresent(formData, admin.userId);
  if (uploaded.error) {
    return { errors: [uploaded.error] };
  }
  if (uploaded.url) {
    input.coverImage = uploaded.url;
  }

  const errors = validatePostInput(input);
  if (errors.length > 0) {
    return { errors };
  }

  const supabase = await createClient();
  const payload = {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    cover_image_url: input.coverImage,
    author_name: input.author,
    author_id: admin.userId,
    published: !input.draft,
    published_at: input.date,
  };

  if (previousSlug) {
    const { error } = await supabase
      .from("blog_posts")
      .update(payload)
      .eq("slug", previousSlug);
    if (error) {
      if (error.code === "23505") {
        return { errors: [`A post with slug "${input.slug}" already exists.`] };
      }
      return { errors: [saveFailureMessage(error)] };
    }
  } else {
    const { error } = await supabase.from("blog_posts").insert(payload);
    if (error) {
      if (error.code === "23505") {
        return { errors: [`A post with slug "${input.slug}" already exists.`] };
      }
      return { errors: [saveFailureMessage(error)] };
    }
  }

  revalidateBlog(input.slug);
  if (previousSlug && previousSlug !== input.slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }
  redirect(`/studio/${input.slug}?saved=1`);
}

export async function deletePost(slug: string): Promise<void> {
  const admin = await requireAptenodyteAdmin("/studio");
  const rateError = await assertWriteRate(admin.userId ?? "");
  if (rateError) {
    redirect(`/studio?error=${encodeURIComponent(rateError)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("slug", slug);
  if (error) {
    redirect(`/studio?error=${encodeURIComponent(saveFailureMessage(error))}`);
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/studio");
  redirect("/studio?deleted=1");
}
