"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  STUDIO_COOKIE,
  checkPassword,
  createSessionToken,
  isStudioConfigured,
  sessionCookieOptions,
  verifySessionToken,
} from "@/lib/studio/auth";
import {
  type PostInput,
  StudioWriteError,
  deletePostSource,
  savePostSource,
} from "@/lib/studio/posts";

async function requireSession(): Promise<void> {
  const store = await cookies();
  if (!verifySessionToken(store.get(STUDIO_COOKIE)?.value)) {
    redirect("/studio/login");
  }
}

export async function login(formData: FormData): Promise<void> {
  const next = String(formData.get("next") || "/studio");
  const safeNext = next.startsWith("/studio") ? next : "/studio";

  if (!isStudioConfigured()) {
    redirect("/studio/login?error=unconfigured");
  }

  const candidate = String(formData.get("password") || "");
  if (!checkPassword(candidate)) {
    redirect("/studio/login?error=invalid");
  }

  const store = await cookies();
  store.set(STUDIO_COOKIE, createSessionToken(), sessionCookieOptions);
  redirect(safeNext);
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete({ name: STUDIO_COOKIE, path: sessionCookieOptions.path });
  redirect("/studio/login");
}

export type SavePostState = {
  errors: string[];
  notice?: string;
};

export async function savePost(
  previousSlug: string | null,
  _state: SavePostState,
  formData: FormData,
): Promise<SavePostState> {
  await requireSession();

  const input: PostInput = {
    slug: String(formData.get("slug") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    date: String(formData.get("date") || "").trim(),
    excerpt: String(formData.get("excerpt") || "").trim(),
    author: String(formData.get("author") || "").trim(),
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    draft: formData.get("draft") === "on",
    body: String(formData.get("body") || ""),
  };

  let saved;
  try {
    saved = savePostSource(input, {
      previousSlug: previousSlug ?? undefined,
    });
  } catch (error) {
    if (error instanceof StudioWriteError) {
      return { errors: [error.message] };
    }
    throw error;
  }

  if (!saved.ok) {
    return { errors: saved.errors };
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${saved.slug}`);
  revalidatePath("/studio");
  redirect(`/studio/${saved.slug}?saved=1`);
}

export async function deletePost(slug: string): Promise<void> {
  await requireSession();
  try {
    deletePostSource(slug);
  } catch (error) {
    if (error instanceof StudioWriteError) {
      redirect(`/studio?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
  revalidatePath("/blog");
  revalidatePath("/studio");
  redirect("/studio?deleted=1");
}
