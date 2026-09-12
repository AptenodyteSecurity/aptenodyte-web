"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createImplicitAuthClient } from "@/lib/supabase/client";

const fieldClassName =
  "mt-2 w-full min-h-11 border-2 border-black bg-white px-3 py-2 text-base text-black";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);

    const origin = window.location.origin;
    const supabase = createImplicitAuthClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${origin}/auth/confirm?next=/reset-password`,
      },
    );

    setPending(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSuccess("If an account exists for that email, a reset link is on its way.");
  }

  return (
    <div className="w-full max-w-md border-2 border-black bg-white p-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-black">
        Reset your password
      </h1>
      <p className="mt-2 text-base text-zinc-800">
        Enter your account email and we&apos;ll send a secure reset link.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label htmlFor="email" className="block text-sm font-semibold text-black">
          Email
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClassName}
          />
        </label>
        {error || success ? (
          <p
            role={error ? "alert" : "status"}
            className="border-2 border-black bg-white px-3 py-2 text-sm font-medium text-black"
          >
            {error ?? success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full min-h-11 rounded-2xl border-2 border-black bg-yellow-400 px-4 font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-700">
        <Link
          href="/login"
          className="font-semibold text-black underline-offset-2 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
