import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

/** `sm` 24px, `md` 44px, `fluid` 24px stepping to 44px at the 640px (`sm:`) breakpoint. */
const logoSpinnerMarkVariants = cva("relative inline-flex shrink-0 items-center justify-center", {
  variants: {
    size: {
      sm: "size-6",
      md: "size-11",
      fluid: "size-6 sm:size-11",
    },
  },
  defaultVariants: { size: "md" },
});

export type LogoSpinnerSize = "sm" | "md" | "fluid";

export interface LogoSpinnerProps extends NoClass<Omit<React.HTMLAttributes<HTMLDivElement>, "children">> {
  /** Mark height: `sm` 24px, `md` 44px, `fluid` 24px stepping to 44px at the 640px breakpoint. */
  size: LogoSpinnerSize;
  /** Accessible name (required) — what the app is waiting on, e.g. "Loading workspace". */
  alt: string;
  /**
   * Your product's mark (an `<img>`, an inline `<svg>`, …). It sits centered inside the orbiting
   * ring and breathes gently; it should fill its box (`size-full`). Omit for the brand-neutral
   * ring-and-dot mark.
   */
  logo?: React.ReactNode;
}

/**
 * A full-screen-scale loading mark for the moments a whole surface is waiting — app boot, a splash
 * screen, a full-page route transition. For pending state inside a control or a section, use
 * `Spinner`/`CircularProgress` instead: this is brand furniture, not a status glyph.
 *
 * qui ships no brand artwork: by default it draws a neutral orbiting ring around a dot in theme
 * tokens; pass `logo` to put your own mark at its center. Under `prefers-reduced-motion: reduce`
 * all motion stops and the fully drawn mark shows still.
 */
export const LogoSpinner = React.forwardRef<HTMLDivElement, LogoSpinnerProps>(({ size, alt, logo, ...props }, ref) => (
  <div ref={ref} role="img" aria-label={alt} className={cn("flex items-center justify-center")} {...props}>
    <span aria-hidden="true" className={logoSpinnerMarkVariants({ size })}>
      <svg viewBox="0 0 44 44" fill="none" className="absolute inset-0 size-full animate-spin [animation-duration:1.2s] motion-reduce:animate-none">
        <circle cx="22" cy="22" r="19" strokeWidth="3" className="stroke-(--border-color-subtle)" />
        <circle cx="22" cy="22" r="19" strokeWidth="3" strokeLinecap="round" strokeDasharray="30 90" className="stroke-(--border-color-accent-strong)" />
      </svg>
      {logo != null ? (
        <span className="relative flex size-[55%] items-center justify-center animate-pulse motion-reduce:animate-none [&>*]:size-full [&>*]:object-contain">
          {logo}
        </span>
      ) : (
        <span className="relative size-[22%] rounded-full bg-accent-primary animate-pulse motion-reduce:animate-none" />
      )}
    </span>
  </div>
));
LogoSpinner.displayName = "LogoSpinner";

/* __DOC
<div className="flex items-center gap-8">
  <QUI.LogoSpinner size="sm" alt="Loading" />
  <QUI.LogoSpinner size="md" alt="Loading workspace" />
  <QUI.LogoSpinner size="md" alt="Loading" logo={<Icons.Rocket className="text-icon-secondary" />} />
</div>
DOC__ */

/* __PROPS
{ "size": ["sm", "md", "fluid"] }
PROPS__ */
