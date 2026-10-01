import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

/**
 * An 8px filled disc drawn as an `::after` pseudo-element, centred inside a `--node-size` box so the
 * swatch occupies exactly the footprint an icon would in the same slot. The fill comes from the
 * `--swatch-fill` custom property, which `Swatch` sets from its `fill` prop.
 */
const swatchVariants = cva(
  cn(
    "inline-flex size-(--node-size) shrink-0 items-center justify-center",
    "after:size-2 after:rounded-full after:bg-(--swatch-fill) after:content-['']"
  )
);

export interface SwatchProps extends NoClass<Omit<React.HTMLAttributes<HTMLSpanElement>, "children">> {
  /**
   * Any CSS color for the disc (`"#3f76ff"`, `"oklch(...)"`, `"var(--some-token)"`). Colour here is
   * data — a label's or state's own colour — rather than a design token, so it's a prop.
   */
  fill: string;
}

/**
 * A small colour disc that drops into any icon slot — a label pill's leading node, a `MenuItem`'s
 * `icon`, a select option — and sizes itself off the inherited `--node-size`. Decorative
 * (`aria-hidden`): the text next to it carries the meaning.
 */
export const Swatch = React.forwardRef<HTMLSpanElement, SwatchProps>(({ fill, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    className={cn(swatchVariants())}
    style={{ ["--swatch-fill" as string]: fill } as React.CSSProperties}
    {...props}
  />
));
Swatch.displayName = "Swatch";

/* __DOC_BLOCK
<div className="flex flex-col gap-3 p-4">
  <div className="flex items-center gap-2 [--node-size:16px]">
    <QUI.Swatch fill="#3f76ff" />
    <QUI.Swatch fill="#ef4444" />
    <QUI.Swatch fill="#f59e0b" />
    <QUI.Swatch fill="#22c55e" />
    <QUI.Swatch fill="#a855f7" />
  </div>
  <div className="flex items-center gap-2">
    <QUI.Pill variant="outline" label="Bug" startIcon={<QUI.Swatch fill="#ef4444" />} />
    <QUI.Pill variant="outline" label="Feature" startIcon={<QUI.Swatch fill="#22c55e" />} />
  </div>
</div>
DOC__ */

/* __PROPS
{ "fill": ["#3f76ff", "#ef4444", "#22c55e"] }
PROPS__ */
