import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../lib/cn";
import { nodeSlotClass } from "../lib/node-slot";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Whether the spinner is showing. Keep it mounted with `active={loading}` inside a control whose
   * box should widen/narrow smoothly as loading starts/stops (Button, IconButton) — it stays
   * mounted through the exit animation and unmounts itself after. For a control that doesn't
   * resize with it, just mount it conditionally instead.
   * @default true
   */
  active?: boolean;
  children?: React.ReactNode;
}

const CONCEAL_TIMEOUT_MS = 250;

/**
 * The shared loading glyph slot: sizes to the inherited `--node-size` and animates in/out of a
 * control (grow-and-fade in via `--animate-spinner-reveal`, shrink-and-fade via
 * `--animate-spinner-conceal`) instead of snapping, so a control's box widens/narrows smoothly as
 * it enters/leaves its loading state.
 */
export function Spinner({ active = true, children, className, ...props }: SpinnerProps) {
  const [mounted, setMounted] = React.useState(active);
  if (active && !mounted) setMounted(true);

  React.useEffect(() => {
    if (active || !mounted) return;
    const id = window.setTimeout(() => setMounted(false), CONCEAL_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [active, mounted]);

  if (!mounted) return null;

  return (
    <span
      aria-hidden="true"
      className={cn(nodeSlotClass, "overflow-hidden [&>svg]:animate-spin", active ? "animate-spinner-reveal motion-reduce:animate-none" : "animate-spinner-conceal motion-reduce:animate-none", className)}
      onAnimationEnd={(e) => {
        if (!active && e.target === e.currentTarget) setMounted(false);
      }}
      {...props}
    >
      {children ?? <LoaderCircle />}
    </span>
  );
}

/* __DOC
<div className="[--node-size:20px] text-icon-secondary">
  <QUI.Spinner />
</div>
DOC__ */

/* __PROPS
{ "active": "boolean" }
PROPS__ */
