"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

import { nav, site } from "@/data/site";
import { byCategory, categories } from "@/data/photos";
import ThemeToggle from "./ThemeToggle";

// Categories with no photos in them drop out here too, matching /work's own
// filter — the hover menu should never offer a link that lands on an empty page.
const workCategories = categories.filter((c) => byCategory(c.id).length > 0);

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/home" ? pathname === "/home" : pathname.startsWith(href);

  const navLinkClass = (href: string) =>
    `inline-flex min-h-11 items-center border-b text-sm transition-colors duration-200 hover:text-fg ${
      isActive(href) ? "border-fg text-fg" : "border-transparent text-muted-fg"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-sm">
      <div className="header-bar wrap flex items-center justify-between gap-6 py-4">
        <Link href="/home" className="flex items-center">
          {pathname.startsWith("/admin") ? (
            <span className="font-display text-base font-medium tracking-tight text-fg sm:text-lg">
              Dashboard
            </span>
          ) : (
            <>
              <Image
                src="/photos/logo/logo.png"
                alt={site.name}
                width={901}
                height={756}
                priority
                className="header-logo logo-light h-12 w-auto sm:h-14"
              />
              <Image
                src="/photos/logo/logo2.png"
                alt={site.name}
                width={901}
                height={756}
                priority
                className="header-logo logo-dark h-12 w-auto sm:h-14"
              />
            </>
          )}
          <span className="sr-only"> — home</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {nav.map((item) =>
            item.href === "/work" ? (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`${navLinkClass(item.href)} gap-1`}
                >
                  {item.label}
                  <ChevronDown
                    className="size-3.5 transition-transform duration-200 group-hover:rotate-180"
                    aria-hidden="true"
                  />
                </Link>

                {/* The padding-top bridges the gap to the link above so the pointer
                    never leaves the hoverable area on its way down to the menu. */}
                <div className="invisible absolute left-1/2 top-full z-50 w-48 -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="print-frame divide-y divide-line bg-bg">
                    {workCategories.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/work?type=${c.id}`}
                          className="block px-4 py-2.5 text-sm text-muted-fg transition-colors duration-150 hover:bg-muted hover:text-fg"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={navLinkClass(item.href)}
              >
                {item.label}
              </Link>
            ),
          )}
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
                    item.href === "/work" ? "pb-0" : ""
                  } ${isActive(item.href) ? "text-fg" : "text-muted-fg"}`}
                >
                  {item.label}
                </Link>

                {item.href === "/work" && (
                  <ul className="flex flex-wrap gap-x-4 gap-y-2 border-b border-line py-4">
                    {workCategories.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/work?type=${c.id}`}
                          onClick={() => setOpen(false)}
                          className="text-sm text-muted-fg underline-offset-4 hover:text-fg hover:underline"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
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
