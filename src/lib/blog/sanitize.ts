import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });

const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "b",
  "i",
  "code",
  "pre",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isSafeImgSrc(src: string): boolean {
  const trimmed = src.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Compile Markdown to HTML, then strip scripts, event handlers, and unsafe URLs. */
export function markdownToSafeHtml(markdown: string): string {
  const raw = marked.parse(markdown) as string;
  return sanitizeHtml(raw, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "width", "height"],
      th: ["align"],
      td: ["align"],
    },
    allowedSchemes: ["http", "https"],
    allowedSchemesByTag: {
      img: ["https"],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        if (!isSafeHref(href)) {
          return { tagName, attribs: {} };
        }
        return {
          tagName,
          attribs: {
            href,
            rel: "noopener noreferrer",
            ...(href.startsWith("http") ? { target: "_blank" } : {}),
          },
        };
      },
      img: (tagName, attribs) => {
        const src = attribs.src ?? "";
        if (!isSafeImgSrc(src)) {
          return { tagName: "span", attribs: {} as Record<string, string> };
        }
        return {
          tagName,
          attribs: {
            src,
            alt: attribs.alt ?? "",
          },
        };
      },
    },
  });
}

export function readingTimeMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
