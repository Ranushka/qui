import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

const shortcutVariants = cva("shrink-0 text-tertiary", {
  variants: {
    size: {
      sm: "text-caption-sm-regular",
      md: "text-caption-md-regular",
    },
  },
  defaultVariants: { size: "md" },
});

export type ShortcutSize = "sm" | "md";

export interface ShortcutProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The key combination as display text, e.g. `"⌘ K"` or `"Ctrl Shift P"`. */
  keys: string;
  /** @default "md" */
  size?: ShortcutSize;
}

/**
 * A muted keyboard-shortcut hint — the trailing `⌘ K` in a menu row or beside a button label.
 * Purely visual: it is `aria-hidden` by default, so put the canonical `aria-keyshortcuts` on the
 * actionable element itself (pass `aria-hidden={false}` to have it read out anyway).
 */
export const Shortcut = React.forwardRef<HTMLSpanElement, ShortcutProps>(
  ({ keys, size, "aria-hidden": ariaHidden = true, className, ...props }, ref) => (
    <span ref={ref} aria-hidden={ariaHidden} className={cn(shortcutVariants({ size }), className)} {...props}>
      {keys}
    </span>
  )
);
Shortcut.displayName = "Shortcut";

/* __DOC
<div className="flex items-center gap-4">
  <QUI.Shortcut keys="⌘ K" />
  <QUI.Shortcut keys="Ctrl Shift P" size="sm" />
</div>
DOC__ */

/* __PROPS
{ "size": ["sm", "md"] }
PROPS__ */
