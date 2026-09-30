import { cn } from "./cn";

/**
 * The shared text treatment for the bare control INSIDE a bordered group — the input, textarea,
 * and number-field's numeric input. Transparent (the group owns the surface), primary text over
 * placeholder color, no outline (the group draws focus), disabled shows the not-allowed cursor +
 * disabled text.
 */
export const controlInputClass = cn(
  "min-w-0 bg-transparent text-primary outline-none",
  "caret-(--border-color-accent-strong)",
  "placeholder:text-placeholder",
  "disabled:cursor-not-allowed disabled:text-disabled"
);
