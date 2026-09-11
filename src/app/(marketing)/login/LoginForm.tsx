"use client";

import Link from "next/link";
import { useActionState } from "react";
import { authenticate, type AuthActionState } from "@/lib/auth/actions";
import { ctaLoginClassName } from "@/lib/nav";

const initialState: AuthActionState = { error: null };

const fieldClassName =
  "mt-2 w-full min-h-11 border-2 border-black bg-white px-3 py-2 text-base text-black";

const labelClassName = "block text-sm font-semibold text-black";

type LoginFormProps = {
  nextPath: string;
};

export default function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    authenticate,
    initialState,
  );

  return (
    <div className="w-full max-w-md border-2 border-black bg-white p-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-black">
        Welcome back
      </h1>
      <p className="mt-2 text-base text-zinc-800">
        Sign in to access your Aptenodyte workspace.
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        <input type="hidden" name="next" value={nextPath} />

        <div>
          <label htmlFor="email" className={labelClassName}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClassName}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={fieldClassName}
          />
        </div>

        {state.error ? (
          <p
            role="alert"
            className="border-2 border-black bg-white px-3 py-2 text-sm font-medium text-black"
          >
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className={`w-full ${ctaLoginClassName} disabled:opacity-60`}
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-700">
        Have an access code?{" "}
        <Link
          href="/signup"
          className="font-semibold text-black underline-offset-2 hover:underline"
        >
          Sign up
        </Link>
      </p>

      <p className="mt-3 text-center text-sm text-zinc-700">
        <Link
          href="/"
          className="font-semibold text-black underline-offset-2 hover:underline"
        >
          Back to home
        </Link>
      </p>
    </div>
  );
}
