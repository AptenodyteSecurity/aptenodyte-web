"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePassword, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = { error: null, success: null };
const fieldClassName =
  "mt-2 w-full min-h-11 border-2 border-black bg-white px-3 py-2 text-base text-black";

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState,
  );

  return (
    <div className="w-full max-w-md border-2 border-black bg-white p-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-black">
        Choose a new password
      </h1>
      <p className="mt-2 text-base text-zinc-800">
        Use at least eight characters. You can sign in after saving it.
      </p>
      <form action={formAction} className="mt-8 space-y-5">
        <input type="hidden" name="signOutAfter" value="true" />
        <label className="block text-sm font-semibold text-black">
          New password
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={fieldClassName}
          />
        </label>
        <label className="block text-sm font-semibold text-black">
          Confirm new password
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={fieldClassName}
          />
        </label>
        {state.error || state.success ? (
          <p
            role={state.error ? "alert" : "status"}
            className="border-2 border-black bg-white px-3 py-2 text-sm font-medium text-black"
          >
            {state.error ?? state.success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full min-h-11 rounded-2xl border-2 border-black bg-yellow-400 px-4 font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Updating…" : "Update password"}
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
