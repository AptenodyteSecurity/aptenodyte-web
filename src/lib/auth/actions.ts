"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error: string | null;
  success?: string | null;
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

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const { data: created, error: createError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      },
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

  revalidatePath("/", "layout");
  return {
    error: null,
    success:
      "Account created. Check your email to confirm your address before signing in.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "Enter your email address." };
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    error: null,
    success: "If an account exists for that email, a reset link is on its way.",
  };
}

export async function updatePassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  // Recovery creates an authenticated session for the password change.
  // End only recovery sessions so Settings password changes stay signed in.
  if (formData.get("signOutAfter") === "true") {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  return { error: null, success: "Your password has been updated." };
}

export async function updateProfile(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const ctx = await requireSignedInForAction();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!firstName || !lastName || !email) {
    return { error: "First name, last name, and email are required." };
  }

  const supabase = await createClient();
  if (email !== (ctx.email ?? "").toLowerCase()) {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      return { error: error.message };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      email,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", ctx.userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return {
    error: null,
    success:
      email !== (ctx.email ?? "").toLowerCase()
        ? "Profile saved. Confirm the email sent to your new address."
        : "Profile saved.",
  };
}

async function requireSignedInForAction() {
  const { requireSignedIn } = await import("@/lib/auth/context");
  return requireSignedIn("/dashboard/settings");
}
