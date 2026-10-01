/**
 * Every typography style the design tokens define, as literal Tailwind classes (Tailwind only
 * generates classes it can read verbatim in source). Generated from `@qui/tokens` — a style that
 * isn't listed here doesn't exist in the design, so components can't ask for it.
 */
export type FontWeight = "regular" | "medium" | "semibold" | "bold";

export const bodyStyles = {
  "2xs": { regular: "text-body-2xs-regular", medium: "text-body-2xs-medium", semibold: "text-body-2xs-semibold" },
  "xs": { regular: "text-body-xs-regular", medium: "text-body-xs-medium", semibold: "text-body-xs-semibold", bold: "text-body-xs-bold" },
  "sm": { regular: "text-body-sm-regular", medium: "text-body-sm-medium", semibold: "text-body-sm-semibold", bold: "text-body-sm-bold" },
  "md": { regular: "text-body-md-regular", medium: "text-body-md-medium", semibold: "text-body-md-semibold", bold: "text-body-md-bold" },
} as const satisfies Record<string, Partial<Record<FontWeight, string>>>;

export const captionStyles = {
  "3xs": { regular: "text-caption-3xs-regular", medium: "text-caption-3xs-medium", semibold: "text-caption-3xs-semibold" },
  "2xs": { regular: "text-caption-2xs-regular", medium: "text-caption-2xs-medium", semibold: "text-caption-2xs-semibold" },
  "xs": { regular: "text-caption-xs-regular", medium: "text-caption-xs-medium", semibold: "text-caption-xs-semibold", bold: "text-caption-xs-bold" },
  "sm": { regular: "text-caption-sm-regular", medium: "text-caption-sm-medium", semibold: "text-caption-sm-semibold", bold: "text-caption-sm-bold" },
  "md": { regular: "text-caption-md-regular", medium: "text-caption-md-medium", semibold: "text-caption-md-semibold", bold: "text-caption-md-bold" },
} as const satisfies Record<string, Partial<Record<FontWeight, string>>>;

export const headingStyles = {
  1: { regular: "text-h1-regular", medium: "text-h1-medium", semibold: "text-h1-semibold", bold: "text-h1-bold" },
  2: { regular: "text-h2-regular", medium: "text-h2-medium", semibold: "text-h2-semibold", bold: "text-h2-bold" },
  3: { regular: "text-h3-regular", medium: "text-h3-medium", semibold: "text-h3-semibold", bold: "text-h3-bold" },
  4: { regular: "text-h4-regular", medium: "text-h4-medium", semibold: "text-h4-semibold", bold: "text-h4-bold" },
  5: { regular: "text-h5-regular", medium: "text-h5-medium", semibold: "text-h5-semibold", bold: "text-h5-bold" },
  6: { regular: "text-h6-regular", medium: "text-h6-medium", semibold: "text-h6-semibold", bold: "text-h6-bold" },
} as const satisfies Record<number, Partial<Record<FontWeight, string>>>;

/** Text colors from the token set. */
export const textColorClass = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  placeholder: "text-placeholder",
  disabled: "text-disabled",
  accent: "text-accent-primary",
  danger: "text-danger-primary",
  success: "text-success-primary",
  warning: "text-warning-primary",
  info: "text-info-primary",
  link: "text-link-primary",
  "on-color": "text-on-color",
  inverse: "text-inverse",
  inherit: "",
} as const;

export type TextColor = keyof typeof textColorClass;

/** Picks the requested weight, or the nearest lighter one the style defines (e.g. `bold` → `semibold` for 2xs). */
export function resolveWeight(styles: Partial<Record<FontWeight, string>>, weight: FontWeight): string {
  const order: FontWeight[] = ["regular", "medium", "semibold", "bold"];
  for (let i = order.indexOf(weight); i >= 0; i--) {
    const cls = styles[order[i]!];
    if (cls) return cls;
  }
  return Object.values(styles)[0]!;
}
