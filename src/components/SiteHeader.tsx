"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { nav, site } from "@/data/site";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-6 px-6 py-4 sm:px-8">
        <Link
          href="/"
          className="font-display text-base font-medium tracking-tight text-fg sm:text-lg"
        >
          {site.name}
          <span className="sr-only"> — home</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {nav.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`inline-flex min-h-11 items-center border-b text-sm transition-colors duration-200 hover:text-fg ${
                isActive(item.href)
                  ? "border-fg text-fg"
                  : "border-transparent text-muted-fg"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="cursor-pointer bg-fg px-5 py-2.5 text-sm text-bg transition-colors duration-200 hover:bg-secondary active:bg-secondary"
          >
            Book a shoot
          </Link>
          <ThemeToggle className="-mr-3" />
        </nav>

        <div className="flex items-center md:hidden">
          <ThemeToggle />
          <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="-mr-2 grid size-11 cursor-pointer place-items-center text-fg md:hidden"
        >
          {open ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <Menu className="size-6" aria-hidden="true" />
          )}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-t border-line bg-bg px-6 pb-6 md:hidden"
        >
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block border-b border-line py-4 text-base ${
                    isActive(item.href) ? "text-fg" : "text-muted-fg"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-6 block cursor-pointer bg-fg px-5 py-3.5 text-center text-base text-bg transition-colors duration-200 active:bg-secondary"
          >
            Book a shoot
          </Link>
        </nav>
      )}
    </header>
  );
}
