import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * qui's composite typography tokens (`text-body-xs-medium`, `text-caption-md-regular`,
 * `text-h3-semibold`, …) and its numeric scale (`text-13`). Stock tailwind-merge can't tell these
 * apart from `text-<color>` utilities, so a token and a color in one class list evict each other.
 */
const isTypographyToken = (value: string) =>
  /^(?:(?:body|caption)-[a-z0-9]+-|h[1-6]-)(?:regular|medium|semibold|bold)$/.test(value) || /^\d+$/.test(value);

/**
 * Border widths are tokens too (`border-sm` = 1px, …). Stock tailwind-merge reads `border-sm` as a
 * border color, so it evicted the width whenever a color like `border-subtle` came along.
 */
const borderWidths = ["xs", "sm", "md", "lg"];

/** Elevation tokens (`shadow-raised-100`, `shadow-overlay-200`); stock tailwind-merge reads them as shadow colors. */
const isShadowToken = (value: string) => /^(?:raised|overlay)-\d+$/.test(value);

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [isTypographyToken] }],
      "border-w": [{ border: borderWidths }],
      "border-w-x": [{ "border-x": borderWidths }],
      "border-w-y": [{ "border-y": borderWidths }],
      "border-w-s": [{ "border-s": borderWidths }],
      "border-w-e": [{ "border-e": borderWidths }],
      "border-w-t": [{ "border-t": borderWidths }],
      "border-w-r": [{ "border-r": borderWidths }],
      "border-w-b": [{ "border-b": borderWidths }],
      "border-w-l": [{ "border-l": borderWidths }],
      shadow: [{ shadow: [isShadowToken] }],
    },
  },
});

/** Joins class lists and resolves Tailwind conflicts; qui's typography, border-width and shadow tokens survive next to colors. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
