import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";
import { nodeSlotClass } from "./node-slot";

/**
 * Core chrome for a button that reveals content (Collapsible's trigger today): carries `group` so a
 * nested {@link DisclosureIndicator} can read Base UI's `data-panel-open`, plus the shared type,
 * focus ring and disabled dimming. Callers add their own geometry and `--node-size`.
 */
export const disclosureTriggerClass = cn(
  "group flex items-center gap-2 text-start text-body-sm-medium text-primary",
  "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-strong",
  "disabled:cursor-not-allowed disabled:opacity-60 data-disabled:cursor-not-allowed data-disabled:opacity-60"
);

/**
 * The rotating caret. One glyph (a chevron-down) everywhere; the slot rotates it.
 * `disclose` points inline-end while closed and down while open (mirrored in RTL).
 */
const disclosureIndicatorVariants = cva(cn(nodeSlotClass, "transition-transform duration-200 motion-reduce:transition-none"), {
  variants: {
    motion: {
      disclose: cn("-rotate-90 group-data-panel-open:rotate-0", "rtl:rotate-90 rtl:group-data-panel-open:rotate-0"),
      flip: "group-data-popup-open:rotate-180 group-data-panel-open:rotate-180",
    },
    tint: {
      secondary: "text-icon-secondary",
      tertiary: "text-icon-tertiary",
    },
  },
  defaultVariants: { motion: "disclose", tint: "secondary" },
});

export interface DisclosureIndicatorProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof disclosureIndicatorVariants> {}

/** The disclosure caret: sized by the host's `--node-size`, rotated off the nearest `group`'s open state. */
export function DisclosureIndicator({ motion, tint, className, ...props }: DisclosureIndicatorProps) {
  return (
    <span aria-hidden="true" data-slot="disclosure-indicator" className={cn(disclosureIndicatorVariants({ motion, tint }), className)} {...props}>
      <ChevronDown />
    </span>
  );
}

/** Height-animating panel geometry, driven by Base UI's `--collapsible-panel-height`. */
export const collapsiblePanelClass = cn(
  "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out motion-reduce:transition-none",
  "data-starting-style:h-0 data-ending-style:h-0"
);
