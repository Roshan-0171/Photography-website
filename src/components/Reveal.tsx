import type { ElementType, ReactNode } from "react";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

/**
 * Scroll reveal: fade + 24px rise as the element enters the viewport.
 *
 * This is now just a class. The motion is a native scroll-driven animation
 * (`animation-timeline: view()`) in globals.css, gated behind
 * prefers-reduced-motion and @supports — so there is no runtime here, nothing
 * to hydrate, and no way for content to be left hidden. Browsers without
 * scroll-driven animations simply render the element static.
 *
 * Never wrap the hero image in this: the LCP element must not wait on anything.
 */
export default function Reveal({ children, as: Tag = "div", className = "" }: Props) {
  return <Tag className={`reveal ${className}`}>{children}</Tag>;
}
