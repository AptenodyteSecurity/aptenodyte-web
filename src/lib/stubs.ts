export const stubPages = {
  about: "About",
  blog: "Blog",
  contact: "Contact",
  login: "Login",
  "request-demo": "Request a demo",
  privacy: "Privacy Policy",
  terms: "Terms",
  linkedin: "LinkedIn",
  x: "X",
  github: "GitHub",
} as const;

export type StubSlug = keyof typeof stubPages;

export function isStubSlug(value: string): value is StubSlug {
  return value in stubPages;
}

export const socialLinks = [
  { href: "/linkedin", label: "LinkedIn" },
  { href: "/x", label: "X" },
  { href: "/github", label: "GitHub" },
] as const;
