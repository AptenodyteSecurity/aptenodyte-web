"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  applyA11ySettings,
  defaultA11ySettings,
  readA11ySettings,
  resetA11ySettings,
  saveA11ySettings,
  type A11ySettings,
  type TextSize,
} from "@/lib/a11y";

function getFocusable(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("hidden"));
}

function AccessibleIcon() {
  return (
    // Official Accessible Icon Project graphic: https://accessibleicon.org/
    <img
      src="/accessible-icon.svg"
      alt=""
      width={22}
      height={22}
      className="h-[22px] w-[22px]"
      aria-hidden="true"
    />
  );
}

export default function AccessibilitySettings() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(defaultA11ySettings);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const initial = readA11ySettings();
    setSettings(initial);
    applyA11ySettings(initial);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const focusable = dialog ? getFocusable(dialog) : [];
    focusable[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialog) {
        return;
      }

      const items = getFocusable(dialog);
      if (items.length === 0) {
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open]);

  function update(next: A11ySettings) {
    setSettings(next);
    saveA11ySettings(next);
  }

  function toggle(key: Exclude<keyof A11ySettings, "textSize">) {
    update({ ...settings, [key]: !settings[key] });
  }

  function setTextSize(textSize: TextSize) {
    update({ ...settings, textSize });
  }

  function reset() {
    resetA11ySettings();
    setSettings(defaultA11ySettings);
  }

  return (
    <>
      <button
        ref={buttonRef}
        id="accessibility-settings"
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-black bg-white text-black"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? "accessibility-dialog" : undefined}
        onClick={() => setOpen(true)}
      >
        <AccessibleIcon />
        <span className="sr-only">Accessibility settings</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            ref={dialogRef}
            id="accessibility-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto border-2 border-black bg-white p-5 text-black"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id={titleId} className="text-lg font-bold">
                Accessibility settings
              </h2>
              <button
                type="button"
                className="min-h-11 min-w-11 border-2 border-black px-3 text-sm font-semibold"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-zinc-700">
              Changes apply immediately and are saved in this browser.
            </p>

            <form className="mt-5 flex flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
              <fieldset>
                <legend className="text-sm font-bold">Text size</legend>
                <div className="mt-2 flex flex-col gap-2">
                  {(
                    [
                      ["default", "Default"],
                      ["large", "Large"],
                      ["larger", "Larger"],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className="flex min-h-11 items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="text-size"
                        value={value}
                        checked={settings.textSize === value}
                        onChange={() => setTextSize(value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-bold">Display</legend>
                <div className="mt-2 flex flex-col gap-2">
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.readableFont}
                      onChange={() => toggle("readableFont")}
                    />
                    Readable font
                  </label>
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.highContrast}
                      onChange={() => toggle("highContrast")}
                    />
                    High contrast
                  </label>
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.underlineLinks}
                      onChange={() => toggle("underlineLinks")}
                    />
                    Underline links
                  </label>
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.textSpacing}
                      onChange={() => toggle("textSpacing")}
                    />
                    Extra text spacing
                  </label>
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.strongFocus}
                      onChange={() => toggle("strongFocus")}
                    />
                    Stronger keyboard focus
                  </label>
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.reduceMotion}
                      onChange={() => toggle("reduceMotion")}
                    />
                    Reduce motion
                  </label>
                </div>
              </fieldset>

              <button
                type="button"
                className="min-h-11 border-2 border-black bg-white px-4 text-sm font-semibold"
                onClick={reset}
              >
                Reset to defaults
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
