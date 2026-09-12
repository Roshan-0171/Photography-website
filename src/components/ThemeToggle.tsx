"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * A single on/off switch for the theme.
 *
 * Its visual state — knob position and which icon shows — is decided entirely in
 * CSS from the `data-theme` attribute an inline script writes onto <html> before
 * first paint. React renders identical markup on the server and in the browser,
 * so hydration has nothing to compare.
 *
 * The site opens light regardless of the visitor's system preference — dark is
 * opt-in only, via this toggle, and persists through `localStorage`.
 *
 * `aria-pressed` cannot be expressed in CSS, so it is written from an effect as a
 * DOM attribute React does not own. The header renders this twice (desktop and
 * mobile bars), so the sync is document-wide and both copies stay truthful.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";

  const syncPressed = () => {
    const dark = String(isDark());
    for (const el of document.querySelectorAll("[data-theme-switch]")) {
      el.setAttribute("aria-pressed", dark);
    }
  };

  useEffect(() => {
    syncPressed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private browsing or blocked storage: the choice just does not persist.
    }
    syncPressed();
  };

  return (
    <button
      type="button"
      data-theme-switch=""
      onClick={toggle}
      aria-label="Dark mode"
      title="Switch between light and dark mode"
      className={`grid min-h-11 min-w-11 cursor-pointer place-items-center ${className}`}
    >
      <span className="relative flex h-7 w-12 items-center rounded-full border border-line bg-muted transition-colors duration-200">
        <span className="theme-switch-knob absolute left-0.5 grid size-6 place-items-center rounded-full bg-fg text-bg transition-transform duration-200">
          <Sun className="theme-icon-light size-3.5" aria-hidden="true" />
          <Moon className="theme-icon-dark size-3.5" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}
