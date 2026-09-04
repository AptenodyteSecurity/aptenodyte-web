import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { getMemberships } from "@/lib/orgs/getMemberships";
import { ctaLoginClassName } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard — Aptenodyte",
  description: "Your Aptenodyte workspace.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login?next=/dashboard");
  }

  const email =
    typeof data.claims.email === "string" ? data.claims.email : "signed in";
  const memberships = await getMemberships();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-6xl flex-1 px-6 py-10"
    >
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-black">
          Dashboard
        </h1>
        <p className="mt-4 text-lg text-zinc-800">
          Signed in as <span className="font-semibold text-black">{email}</span>
        </p>

        {memberships.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {memberships.map((membership) => (
              <li
                key={membership.organization.id}
                className="border-2 border-black bg-white px-4 py-3 text-sm text-zinc-700"
              >
                <span className="font-semibold text-black">
                  {membership.organization.name}
                </span>
                <span className="text-zinc-700">
                  {" "}
                  — {membership.role}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 border-2 border-black bg-white px-4 py-3 text-sm text-zinc-700">
            No organization is attached to this account yet. Ask Aptenodyte to
            add you — you cannot join an organization from this page.
          </p>
        )}
      </header>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <form action={signOut}>
          <button type="submit" className={ctaLoginClassName}>
            Sign out
          </button>
        </form>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-100"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
