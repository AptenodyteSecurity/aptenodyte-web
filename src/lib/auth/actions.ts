"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error: string | null;
};

const MIN_PASSWORD_LENGTH = 8;

function safeNextPath(raw: string | null | undefined) {
  const next = (raw ?? "/dashboard").trim() || "/dashboard";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  return {
    email,
    password,
    next: safeNextPath(String(formData.get("next") ?? "/dashboard")),
  };
}

function mapAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("already been registered") || lower.includes("already registered")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (lower.includes("access code already used")) {
    return "This access code has already been used.";
  }
  if (lower.includes("access code expired")) {
    return "This access code has expired.";
  }
  if (lower.includes("invalid access code")) {
    return "That access code is invalid.";
  }
  return message;
}

export async function authenticate(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { email, password, next } = readCredentials(formData);

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUpWithAccessCode(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const accessCode = String(formData.get("accessCode") ?? "").trim();
  const next = safeNextPath(String(formData.get("next") ?? "/dashboard"));

  if (!firstName || !lastName) {
    return { error: "First and last name are required." };
  }
  if (!email) {
    return { error: "Work email is required." };
  }
  if (!password || !confirmPassword) {
    return { error: "Password and confirmation are required." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }
  if (!accessCode) {
    return { error: "Access code is required." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Sign up is temporarily unavailable. Try again later." };
  }

  const { data: codeOk, error: validateError } = await admin.rpc(
    "validate_access_code",
    { p_code: accessCode },
  );

  if (validateError) {
    return { error: "Unable to validate access code. Try again later." };
  }
  if (!codeOk) {
    return { error: "That access code is invalid or already used." };
  }

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      },
    });

  if (createError || !created.user) {
    return {
      error: mapAuthError(
        createError?.message ?? "Unable to create account. Try again.",
      ),
    };
  }

  const userId = created.user.id;

  const { error: redeemError } = await admin.rpc("redeem_access_code", {
    p_code: accessCode,
    p_user_id: userId,
    p_first_name: firstName,
    p_last_name: lastName,
    p_email: email,
    p_phone: phone || null,
  });

  if (redeemError) {
    await admin.auth.admin.deleteUser(userId);
    return { error: mapAuthError(redeemError.message) };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return {
      error:
        "Account created, but automatic sign-in failed. Please sign in with your new credentials.",
    };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
