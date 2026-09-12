"use client";

import { useActionState } from "react";
import {
  updatePassword,
  updateProfile,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState = { error: null, success: null };
const fieldClassName =
  "mt-2 w-full min-h-11 border-2 border-black bg-white px-3 py-2 text-base text-black";
const labelClassName = "block text-sm font-semibold text-black";

function Feedback({ state }: { state: AuthActionState }) {
  if (!state.error && !state.success) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className="border-2 border-black bg-white px-3 py-2 text-sm font-medium text-black"
    >
      {state.error ?? state.success}
    </p>
  );
}

export default function AccountSettingsForm({
  profile,
}: {
  profile: {
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string;
  };
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    initialState,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updatePassword,
    initialState,
  );

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="border-2 border-black bg-white p-6">
        <h2 className="text-xl font-bold text-black">Profile</h2>
        <p className="mt-2 text-sm text-zinc-700">
          Keep your contact details current. Changing your email requires
          confirmation at the new address.
        </p>
        <form action={profileAction} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClassName}>
              First name
              <input
                name="firstName"
                defaultValue={profile.firstName ?? ""}
                autoComplete="given-name"
                required
                className={fieldClassName}
              />
            </label>
            <label className={labelClassName}>
              Last name
              <input
                name="lastName"
                defaultValue={profile.lastName ?? ""}
                autoComplete="family-name"
                required
                className={fieldClassName}
              />
            </label>
          </div>
          <label className={labelClassName}>
            Email
            <input
              name="email"
              type="email"
              defaultValue={profile.email}
              autoComplete="email"
              required
              className={fieldClassName}
            />
          </label>
          <label className={labelClassName}>
            Phone number
            <input
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ""}
              autoComplete="tel"
              className={fieldClassName}
            />
          </label>
          <Feedback state={profileState} />
          <button
            type="submit"
            disabled={profilePending}
            className="min-h-11 rounded-2xl border-2 border-black bg-yellow-400 px-4 font-semibold text-black disabled:opacity-60"
          >
            {profilePending ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>

      <section className="border-2 border-black bg-white p-6">
        <h2 className="text-xl font-bold text-black">Password</h2>
        <p className="mt-2 text-sm text-zinc-700">
          Choose a new password for your Aptenodyte account.
        </p>
        <form action={passwordAction} className="mt-5 space-y-4">
          <input type="hidden" name="signOutAfter" value="true" />
          <label className={labelClassName}>
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
          <label className={labelClassName}>
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
          <Feedback state={passwordState} />
          <button
            type="submit"
            disabled={passwordPending}
            className="min-h-11 rounded-2xl border-2 border-black bg-yellow-400 px-4 font-semibold text-black disabled:opacity-60"
          >
            {passwordPending ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
