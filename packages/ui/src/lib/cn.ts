import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge, twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * tailwind-merge configured to know qui's composite typography tokens (`text-body-xs-medium`,
 * `text-caption-md-regular`, `text-h3-semibold`, …) are font sizes, not text colors. Stock
 * `twMerge` treats them as colors, so a token and a `text-<color>` in one class list evict each
 * other.
 */
const twMergeTypography = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [(value: string) => /^(body|caption|h[1-6])-[a-z0-9]+-(regular|medium|semibold|bold)$/.test(value)] }],
    },
  },
});

/**
 * `cn` for class lists that pair a typography token with a text color (e.g. `text-body-xs-medium
 * text-tertiary`) — both survive, while a later token/color still overrides an earlier one of the
 * same kind. `cn` keeps stock behavior for existing components.
 */
export function cnTypography(...inputs: ClassValue[]) {
  return twMergeTypography(clsx(inputs));
}
