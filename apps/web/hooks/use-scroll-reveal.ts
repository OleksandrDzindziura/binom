"use client";

import { useEffect, useRef } from "react";

/**
 * Hook that adds scroll-triggered reveal animations to elements.
 * Applies the `is-visible` class when the element enters the viewport.
 *
 * Pair with CSS classes: scroll-reveal, scroll-reveal-left,
 * scroll-reveal-right, scroll-reveal-scale (defined in globals.css).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, ...options }
    );

    // Observe the container and all children with scroll-reveal classes
    const targets = el.querySelectorAll(
      ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale"
    );

    // Also observe the element itself if it has a reveal class
    if (
      el.classList.contains("scroll-reveal") ||
      el.classList.contains("scroll-reveal-left") ||
      el.classList.contains("scroll-reveal-right") ||
      el.classList.contains("scroll-reveal-scale")
    ) {
      observer.observe(el);
    }

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [options]);

  return ref;
}
