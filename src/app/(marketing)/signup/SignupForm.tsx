"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpWithAccessCode, type AuthActionState } from "@/lib/auth/actions";
import { ctaLoginClassName } from "@/lib/nav";

const initialState: AuthActionState = { error: null };

const fieldClassName =
  "mt-2 w-full min-h-11 border-2 border-black bg-white px-3 py-2 text-base text-black";

const labelClassName = "block text-sm font-semibold text-black";

type SignupFormProps = {
  nextPath: string;
};

export default function SignupForm({ nextPath }: SignupFormProps) {
  const [state, formAction, pending] = useActionState(
    signUpWithAccessCode,
    initialState,
  );

  return (
    <div className="w-full max-w-md border-2 border-black bg-white p-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-black">
        Create your account
      </h1>
      <p className="mt-2 text-base text-zinc-800">
        Use your access code to join your organization&apos;s Aptenodyte
        workspace.
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        <input type="hidden" name="next" value={nextPath} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={labelClassName}>
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              className={fieldClassName}
            />
          </div>

          <div>
            <label htmlFor="lastName" className={labelClassName}>
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              className={fieldClassName}
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className={labelClassName}>
            Phone number{" "}
            <span className="font-normal text-zinc-600">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClassName}>
            Work email
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
            autoComplete="new-password"
            required
            minLength={8}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClassName}>
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="accessCode" className={labelClassName}>
            Access code
          </label>
          <input
            id="accessCode"
            name="accessCode"
            type="text"
            autoComplete="one-time-code"
            required
            spellCheck={false}
            className={`${fieldClassName} uppercase tracking-wider`}
            placeholder="XXXX-XXXX"
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
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-700">
        Need access?{" "}
        <Link
          href="/request-demo"
          className="font-semibold text-black underline-offset-2 hover:underline"
        >
          Request access
        </Link>
      </p>

      <p className="mt-3 text-center text-sm text-zinc-700">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-black underline-offset-2 hover:underline"
        >
          Sign in
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
