import Link from "next/link";
import { login } from "../actions";

const MESSAGES: Record<string, string> = {
  invalid: "Incorrect password.",
  unconfigured:
    "The editor is not configured. Set BLOG_STUDIO_PASSWORD and BLOG_STUDIO_SECRET.",
  session: "Your session expired. Please sign in again.",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function StudioLoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;
  const message = error ? MESSAGES[error] ?? "Unable to sign in." : null;

  return (
    <div className="mx-auto max-w-sm">
      <div className="border-2 border-black bg-white p-6">
        <span className="border-2 border-black bg-black px-2 py-0.5 text-xs font-bold tracking-wide text-white">
          STUDIO
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-black">
          Sign in to edit the blog
        </h1>
        <p className="mt-2 text-sm text-zinc-700">
          This area is restricted. Enter the shared editor password.
        </p>

        {message ? (
          <p
            role="alert"
            className="mt-4 border-2 border-black bg-yellow-100 px-3 py-2 text-sm text-black"
          >
            {message}
          </p>
        ) : null}

        <form action={login} className="mt-5 flex flex-col gap-3">
          <input type="hidden" name="next" value={next ?? "/studio"} />
          <label htmlFor="password" className="text-sm font-bold text-black">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            className="min-h-11 w-full border-2 border-black px-3 py-2 text-sm text-black"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center border-2 border-yellow-500 bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-500"
          >
            Sign in
          </button>
        </form>
      </div>

      <p className="mt-4 text-sm">
        <Link href="/" className="text-black underline underline-offset-4">
          ← Back to site
        </Link>
      </p>
    </div>
  );
}
