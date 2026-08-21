export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

/** Gold CTA — black text on yellow for WCAG contrast. */
export const ctaLoginClassName =
  "inline-flex min-h-11 items-center justify-center border-2 border-yellow-500 bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-500";

/** Orange CTA — black text (not white) so contrast stays readable. */
export const ctaDemoClassName =
  "inline-flex min-h-11 items-center justify-center border-2 border-orange-600 bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-600";
