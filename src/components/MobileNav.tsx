"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ctaDemoClassName, ctaLoginClassName, navLinks } from "@/lib/nav";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");

    function onChange() {
      if (media.matches) {
        setOpen(false);
      }
    }

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 border-2 border-black bg-white md:hidden"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span className="block h-0.5 w-5 bg-black" aria-hidden="true" />
        <span className="block h-0.5 w-5 bg-black" aria-hidden="true" />
        <span className="block h-0.5 w-5 bg-black" aria-hidden="true" />
      </button>

      <nav
        ref={panelRef}
        id={menuId}
        aria-label="Mobile"
        hidden={!open}
        className="absolute inset-x-0 top-full z-20 border-b-2 border-black bg-white md:hidden"
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="block py-2 text-lg font-medium text-black"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 border-t-2 border-black px-6 py-4">
          <Link
            href="/login"
            className={ctaLoginClassName}
            onClick={() => setOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/request-demo"
            className={ctaDemoClassName}
            onClick={() => setOpen(false)}
          >
            Request a demo
          </Link>
        </div>
      </nav>
    </>
  );
}
