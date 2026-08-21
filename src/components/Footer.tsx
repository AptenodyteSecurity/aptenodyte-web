import Image from "next/image";
import Link from "next/link";
import AccessibilitySettings from "@/components/AccessibilitySettings";
import { navLinks } from "@/lib/nav";
import { socialLinks } from "@/lib/stubs";

export default function Footer() {
  return (
    <footer className="border-t-2 border-black bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/AptenodyteLogo9.png"
              alt="Aptenodyte"
              width={64}
              height={64}
              className="h-10 w-10 object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-black">
              Aptenodyte
            </span>
          </Link>
          <p className="mt-3 text-sm text-zinc-700">Compliance made easy.</p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-black">Contact</h2>
          <address className="mt-3 not-italic">
            <p className="text-sm text-zinc-700">
              <a href="UNAVAILABLE">UNAVAILABLE@aptenodyte.com</a>
            </p>
            <p className="mt-2 text-sm text-zinc-700">United States</p>
          </address>
        </div>

        <div>
          <h2 className="text-sm font-bold text-black">Quick links</h2>
          <nav aria-label="Footer" className="mt-3 flex flex-col gap-2">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm text-black">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-bold text-black">Social</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {socialLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-black">
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <label
              htmlFor="newsletter-email"
              className="text-sm font-bold text-black"
            >
              Newsletter
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-describedby="newsletter-status"
                className="min-h-11 w-full border-2 border-black px-3 py-2 text-sm text-black placeholder:text-zinc-600"
              />
              <button
                type="button"
                aria-describedby="newsletter-status"
                className="min-h-11 border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black"
              >
                Subscribe
              </button>
            </div>
            <p id="newsletter-status" className="mt-2 text-xs text-zinc-700">
              Signup is not connected yet. This does not send email.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-black">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3 text-sm text-zinc-700 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Aptenodyte. All rights reserved.</p>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <nav aria-label="Legal" className="flex gap-4">
              <Link href="/privacy" className="text-black">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-black">
                Terms
              </Link>
            </nav>
            <AccessibilitySettings />
          </div>
        </div>
      </div>
    </footer>
  );
}
