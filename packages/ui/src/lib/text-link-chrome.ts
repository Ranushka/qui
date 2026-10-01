/**
 * The chromeless "text-link look" shared by `TextButton` (an action) and `AnchorButton` (a link):
 * no fill, no border, no fixed height — just tinted inline text with a flanking glyph slot, a
 * hairline-rounded focus ring, and a hover tint shift. Each surface composes this with its own
 * gap, size ladder and disabled affordance (`:disabled` for a button, `aria-disabled` for a link).
 */
export const textLinkBaseClass =
  "inline-flex cursor-pointer items-center whitespace-nowrap rounded-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:ring-offset-1";

/** Tint palette per `variant`: `primary` is the accent link color, `secondary` a muted neutral that brightens on hover. */
export const textLinkPalette = {
  primary: "text-link-primary hover:text-link-primary-hover",
  secondary: "text-tertiary hover:text-primary",
} as const;

export type TextLinkVariant = keyof typeof textLinkPalette;
