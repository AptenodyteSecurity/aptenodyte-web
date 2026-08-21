import Image from "next/image";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import { ctaDemoClassName, ctaLoginClassName, navLinks } from "@/lib/nav";

export default function Header() {
  return (
    <header className="relative border-b-2 border-black bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/AptenodyteLogo9.png"
            alt="Aptenodyte"
            width={64}
            height={64}
            className="h-12 w-12 object-contain"
            priority
          />
          <span className="text-lg font-bold tracking-tight text-black">
            Aptenodyte
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xl font-medium text-black hover:bg-zinc-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className={ctaLoginClassName}>
            Login
          </Link>
          <Link href="/request-demo" className={ctaDemoClassName}>
            Request a demo
          </Link>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
