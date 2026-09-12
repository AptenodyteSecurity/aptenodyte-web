import { redirect } from "next/navigation";
import { isAptenodyteAdmin } from "@/lib/orgs/isAdmin";
import { createClient } from "@/lib/supabase/server";

export type AuthContext = {
  signedIn: boolean;
  isAdmin: boolean;
  email: string | null;
  userId: string | null;
};

export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = error ? null : data?.claims;

  if (!claims) {
    return {
      signedIn: false,
      isAdmin: false,
      email: null,
      userId: null,
    };
  }

  const email = typeof claims.email === "string" ? claims.email : null;
  const userId = typeof claims.sub === "string" ? claims.sub : null;
  const isAdmin = await isAptenodyteAdmin();

  return { signedIn: true, isAdmin, email, userId };
}

export async function requireSignedIn(nextPath = "/dashboard") {
  const ctx = await getAuthContext();
  const userId = ctx.userId;
  if (!ctx.signedIn || !userId) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return { ...ctx, signedIn: true as const, userId };
}

export async function requireAptenodyteAdmin(nextPath = "/studio") {
  const ctx = await getAuthContext();
  if (!ctx.signedIn) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  if (!ctx.isAdmin) {
    redirect("/dashboard");
  }
  return ctx;
}

export type UserProfile = {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  displayName: string;
  email: string;
  initials: string;
};

export async function getUserProfile(): Promise<UserProfile> {
  const ctx = await requireSignedIn();
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, email")
    .eq("user_id", ctx.userId)
    .maybeSingle();

  const firstName =
    typeof data?.first_name === "string" ? data.first_name.trim() : "";
  const lastName =
    typeof data?.last_name === "string" ? data.last_name.trim() : "";
  const email =
    (typeof data?.email === "string" && data.email) || ctx.email || "";
  const phone = typeof data?.phone === "string" ? data.phone.trim() : "";
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || email || "Signed in";
  const initials = (
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`
      : displayName.slice(0, 2)
  ).toUpperCase();

  return {
    firstName: firstName || null,
    lastName: lastName || null,
    phone: phone || null,
    displayName,
    email,
    initials,
  };
}
