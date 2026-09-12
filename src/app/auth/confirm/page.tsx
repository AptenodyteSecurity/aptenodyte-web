"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

function ConfirmAuthContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function completeAuth() {
      const supabase = createClient();
      const next = safeNextPath(params.get("next"));
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const errorDescription =
        params.get("error_description") ?? hash.get("error_description");

      if (errorDescription) {
        setError(errorDescription.replace(/\+/g, " "));
        return;
      }

      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      let authError: { message: string } | null = null;

      if (code) {
        const result = await supabase.auth.exchangeCodeForSession(code);
        authError = result.error;
      } else if (tokenHash) {
        const type = params.get("type");
        const result = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type:
            type === "recovery" ||
            type === "signup" ||
            type === "invite" ||
            type === "email" ||
            type === "email_change" ||
            type === "phone_change"
              ? type
              : "recovery",
        });
        authError = result.error;
      } else if (hash.get("access_token") && hash.get("refresh_token")) {
        const result = await supabase.auth.setSession({
          access_token: hash.get("access_token")!,
          refresh_token: hash.get("refresh_token")!,
        });
        authError = result.error;
      } else {
        authError = { message: "This email link is invalid or incomplete." };
      }

      if (cancelled) return;
      if (authError) {
        setError(authError.message);
        return;
      }
      router.replace(next);
    }

    void completeAuth();
    return () => {
      cancelled = true;
    };
  }, [params, router]);

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md border-2 border-black bg-white p-6 md:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Link unavailable
          </h1>
          <p className="mt-3 text-base text-zinc-800">{error}</p>
          <p className="mt-3 text-sm text-zinc-700">
            Request a new password reset link and open it promptly.
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-flex min-h-11 items-center rounded-2xl border-2 border-black bg-yellow-400 px-4 font-semibold text-black"
          >
            Request a new link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <p className="text-base font-semibold text-black">
        Verifying your email link…
      </p>
    </main>
  );
}

export default function ConfirmAuthPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <p className="text-base font-semibold text-black">
            Verifying your email link…
          </p>
        </main>
      }
    >
      <ConfirmAuthContent />
    </Suspense>
  );
}
