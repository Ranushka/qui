import * as React from "react";

/**
 * Masks a horizontal scroller's edges so clipped content fades out instead of being cut off. Each edge fades only
 * while there is content scrolled past it (`data-fade-start` / `data-fade-end`, set by `useScrollFade`). The fade
 * stops short of a classic vertical scrollbar (`--scrollbar-width`) so the bar itself stays solid.
 */
export const scrollFadeClass =
  "[--fade-end:black] [--fade-start:black] data-fade-end:[--fade-end:transparent] data-fade-start:[--fade-start:transparent] [mask-image:linear-gradient(to_right,var(--fade-start),black_2rem,black_calc(100%-var(--scrollbar-width,0px)-2rem),var(--fade-end)_calc(100%-var(--scrollbar-width,0px)),black_calc(100%-var(--scrollbar-width,0px)))]";

/** Keeps `scrollFadeClass`'s edge attributes in sync with the element's horizontal scroll position and size. */
export function useScrollFade(ref: React.RefObject<HTMLElement | null>) {
  // No deps: re-run after every render so newly rendered children are observed for size changes too.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      el.toggleAttribute("data-fade-start", el.scrollLeft > 1);
      el.toggleAttribute("data-fade-end", el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
      el.style.setProperty("--scrollbar-width", `${el.offsetWidth - el.clientWidth - el.clientLeft * 2}px`);
    };
    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(el);
    for (const child of el.children) observer?.observe(child);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer?.disconnect();
      el.removeEventListener("scroll", update);
    };
  });
}
