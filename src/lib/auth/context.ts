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
