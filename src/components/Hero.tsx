import Link from "next/link";
import { ctaDemoClassName, ctaLoginClassName } from "@/lib/nav";

export default function Hero() {
  return (
    <div className="mx-auto max-w-2xl px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
        Aptenodyte
      </h1>
      <p className="mt-4 text-xl font-semibold text-zinc-800 md:text-2xl">
        Compliance made easy.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link href="/login" className={ctaLoginClassName}>
          Login
        </Link>
        <Link href="/request-demo" className={ctaDemoClassName}>
          Book demo
        </Link>
      </div>
    </div>
  );
}
