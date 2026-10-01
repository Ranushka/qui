import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

export interface SeparatorProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseSeparator>> {
  /** Visual-only (no semantic meaning) vs. a real content boundary. @default false */
  decorative?: boolean;
}

/**
 * A thin rule that visually divides content. `orientation` (`"horizontal"` | `"vertical"`) and
 * `decorative` are both required calls per the design spec — spacing around the rule is the
 * surrounding layout's concern, not this component's.
 */
export function Separator({ decorative, ...props }: SeparatorProps) {
  const a11y = decorative ? { role: "none" as const, "aria-orientation": undefined, "aria-hidden": true } : null;
  return (
    <BaseSeparator
      className={cn(
        "shrink-0 border-subtle data-[orientation=horizontal]:h-0 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-t-sm data-[orientation=vertical]:w-0 data-[orientation=vertical]:self-stretch data-[orientation=vertical]:border-s-sm"
      )}
      {...a11y}
      {...props}
    />
  );
}

/* __DOC
<div className="flex w-full flex-col gap-3">
  <span className="text-sm text-secondary">Above</span>
  <QUI.Separator />
  <span className="text-sm text-secondary">Below</span>
  <div className="flex h-6 items-center gap-3">
    <span className="text-sm text-secondary">Left</span>
    <QUI.Separator orientation="vertical" />
    <span className="text-sm text-secondary">Right</span>
  </div>
</div>
DOC__ */

/* __PROPS
{ "orientation": ["horizontal", "vertical"], "decorative": "boolean" }
PROPS__ */
