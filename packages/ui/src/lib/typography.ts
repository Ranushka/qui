/**
 * Every typography style the design tokens define, as literal Tailwind classes (Tailwind only
 * generates classes it can read verbatim in source). Generated from `@qui/tokens` — a style that
 * isn't listed here doesn't exist in the design, so components can't ask for it.
 *
 * Deliberately small: three text sizes (16/14/12), headings h1–h6, and three weights. The token set carries more
 * (body 13/12, caption 11/10/9/8, bold) — components use only these classes, so text stays on a short, readable scale.
 */
export type FontWeight = "regular" | "medium" | "semibold";

/** One size scale for all running text: md 16, sm 14 (default), xs 12. xs has a tight line height, for labels and metadata. */
export const textStyles = {
  "md": { regular: "text-body-md-regular", medium: "text-body-md-medium", semibold: "text-body-md-semibold" },
  "sm": { regular: "text-body-sm-regular", medium: "text-body-sm-medium", semibold: "text-body-sm-semibold" },
  "xs": { regular: "text-caption-md-regular", medium: "text-caption-md-medium", semibold: "text-caption-md-semibold" },
} as const satisfies Record<string, Record<FontWeight, string>>;

export const headingStyles = {
  1: { regular: "text-h1-regular", medium: "text-h1-medium", semibold: "text-h1-semibold" },
  2: { regular: "text-h2-regular", medium: "text-h2-medium", semibold: "text-h2-semibold" },
  3: { regular: "text-h3-regular", medium: "text-h3-medium", semibold: "text-h3-semibold" },
  4: { regular: "text-h4-regular", medium: "text-h4-medium", semibold: "text-h4-semibold" },
  5: { regular: "text-h5-regular", medium: "text-h5-medium", semibold: "text-h5-semibold" },
  6: { regular: "text-h6-regular", medium: "text-h6-medium", semibold: "text-h6-semibold" },
} as const satisfies Record<number, Record<FontWeight, string>>;

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
