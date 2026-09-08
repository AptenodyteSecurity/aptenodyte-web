import { ctaDemoClassName, ctaLoginClassName } from "@/lib/nav";
import { signOut } from "@/lib/auth/actions";
import Link from "next/link";

export default function HeaderAuth({
  signedIn,
  isAdmin,
}: {
  signedIn: boolean;
  isAdmin: boolean;
}) {
  if (!signedIn) {
    return (
      <>
        <Link href="/login" className={ctaLoginClassName}>
          Login
        </Link>
        <Link href="/request-demo" className={ctaDemoClassName}>
          Request a demo
        </Link>
      </>
    );
  }

  return (
    <>
      {isAdmin ? (
        <Link
          href="/studio"
          className="inline-flex min-h-11 items-center justify-center border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-100"
        >
          Studio
        </Link>
      ) : null}
      <Link
        href="/dashboard"
        className="inline-flex min-h-11 items-center justify-center border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-100"
      >
        Dashboard
      </Link>
      <form action={signOut}>
        <button type="submit" className={ctaLoginClassName}>
          Sign out
        </button>
      </form>
    </>
  );
}
