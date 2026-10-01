import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * qui's composite typography tokens (`text-body-xs-medium`, `text-caption-md-regular`,
 * `text-h3-semibold`, …) and its numeric scale (`text-13`). Stock tailwind-merge can't tell these
 * apart from `text-<color>` utilities, so a token and a color in one class list evict each other.
 */
const isTypographyToken = (value: string) =>
  /^(?:(?:body|caption)-[a-z0-9]+-|h[1-6]-)(?:regular|medium|semibold|bold)$/.test(value) || /^\d+$/.test(value);

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [isTypographyToken] }],
    },
  },
});

/** Joins class lists and resolves Tailwind conflicts; a typography token and a text color both survive. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
