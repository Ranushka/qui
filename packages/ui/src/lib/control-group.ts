import { cn } from "./cn";
import { fieldControlSurfaceVariants } from "./field-control-surface";

/**
 * The shared interaction chrome for a bordered group that WRAPS a separately-focusable form
 * control — the input, textarea, and number-field frames. Composes the `focus: "within"` control
 * surface and adds the interaction design every input box shares: a color/border/shadow
 * transition, the rest hover, the focused-hover correction, and the disabled guard in both selector
 * forms (`has-[:disabled]` for a frame around a native control, `data-disabled` for a Base UI group
 * that mirrors state as an attribute).
 *
 * Families add only their own geometry: width, alignment, gap, radius, padding/size.
 */
export const controlGroupClass = cn(
  fieldControlSurfaceVariants({ focus: "within" }),
  "group/control flex transition-[color,background-color,border-color,box-shadow]",
  "hover:border-strong hover:bg-layer-2-hover",
  "focus-within:bg-layer-2 focus-within:hover:border-accent-strong focus-within:hover:bg-layer-2",
  "has-[:disabled]:cursor-not-allowed has-[:disabled]:border-subtle-1 has-[:disabled]:bg-layer-2 has-[:disabled]:ring-0 has-[:disabled]:hover:border-subtle-1",
  "data-disabled:cursor-not-allowed data-disabled:border-subtle-1 data-disabled:bg-layer-2 data-disabled:text-disabled data-disabled:ring-0 data-disabled:hover:border-subtle-1"
);

/**
 * THE single-line control size scale — one meaning per step across every bordered form control
 * (input, select trigger, ...): height, text size, and glyph `--node-size`.
 */
export const controlSize = {
  md: "min-h-(--control-height-md) text-body-xs-regular [--node-size:var(--control-glyph-md)]",
  lg: "min-h-(--control-height-lg) text-body-sm-regular [--node-size:var(--control-glyph-lg)]",
  xl: "min-h-(--control-height-xl) text-body-sm-regular [--node-size:var(--control-glyph-xl)]",
  "2xl": "min-h-(--control-height-2xl) text-body-md-regular [--node-size:var(--control-glyph-2xl)]",
} as const;

export type ControlSize = keyof typeof controlSize;
