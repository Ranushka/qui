import * as React from "react";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { Icon } from "../atoms/Icon";

/**
 * Floats centred over the bottom of the nearest positioned container (e.g. `<Box position="relative">` around a
 * table). The outer strip lets clicks through so only the bar itself covers the rows beneath it.
 */
const actionBarAnchorClass = "pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4";

const actionBarClass =
  "pointer-events-auto relative flex max-w-full animate-slide-up items-center gap-3 rounded-lg bg-inverse py-1.5 ps-4 pe-1.5 text-caption-md-regular text-inverse shadow-overlay-200";

/** Inverse-surface action: a hairline outline that lights on hover, dimmed when it can't run. */
const actionBarButtonVariants = cva(
  cn(
    "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-caption-md-medium text-inverse outline-none transition-colors [--node-size:var(--control-glyph-sm)]",
    "shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--txt-inverse)_22%,transparent)] hover:bg-inverse-hover active:bg-inverse-active data-popup-open:bg-inverse-active",
    "focus-visible:ring-2 focus-visible:ring-accent-strong",
    "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
  )
);

export interface ActionBarProps extends NoClass<Omit<React.HTMLAttributes<HTMLDivElement>, "className">> {
  /** Show the bar. It mounts with a short rise and unmounts when closed. */
  open: boolean;
  /** What the actions apply to, e.g. `"2 selected · Sum of purchases: 838.32 AED"`. Announced politely when it changes. */
  summary: React.ReactNode;
  /** Clears the selection; draws the ✕ badge on the bar's corner. */
  onClear?: () => void;
  /** Label for the clear badge. @default "Clear selection" */
  clearLabel?: string;
  /** `ActionBarButton`s, or menus triggered by one. */
  children?: React.ReactNode;
}

/**
 * A dark bar that floats over a table while rows are selected: the selection summary on the left, bulk actions on the
 * right, and a ✕ badge on its corner to clear the selection.
 */
export const ActionBar = React.forwardRef<HTMLDivElement, ActionBarProps>(
  ({ open, summary, onClear, clearLabel = "Clear selection", children, ...props }, ref) => {
    if (!open) return null;
    return (
      <div className={actionBarAnchorClass}>
        <div ref={ref} role="toolbar" aria-orientation="horizontal" className={actionBarClass} {...props}>
          <span aria-live="polite" className="min-w-0 truncate tabular-nums">
            {summary}
          </span>
          {children ? <div className="flex shrink-0 items-center gap-1.5">{children}</div> : null}
          {onClear ? (
            <button
              type="button"
              aria-label={clearLabel}
              onClick={onClear}
              className="absolute -end-2 -top-2 inline-flex size-5 cursor-pointer items-center justify-center rounded-full bg-inverse text-icon-inverse shadow-[0_0_0_2px_var(--bg-surface-1)] outline-none [--node-size:12px] hover:bg-inverse-hover focus-visible:ring-2 focus-visible:ring-accent-strong"
            >
              <Icon icon={X} />
            </button>
          ) : null}
        </div>
      </div>
    );
  }
);
ActionBar.displayName = "ActionBar";

export interface ActionBarButtonProps extends NoClass<Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">> {
  label: string;
  /** Leading glyph, e.g. `<Icon icon={Send} />`. */
  icon?: React.ReactNode;
  /** Trailing glyph, e.g. a chevron when the button opens a menu. */
  endIcon?: React.ReactNode;
}

/**
 * An action on the `ActionBar`. Forwards its ref and props, so it can be a `MenuTrigger`'s `render`. On phones a button
 * with an icon drops to icon-only (the label stays for screen readers) so the bar fits the screen.
 */
export const ActionBarButton = React.forwardRef<HTMLButtonElement, ActionBarButtonProps>(({ label, icon, endIcon, type = "button", ...props }, ref) => (
  <button ref={ref} type={type} title={icon ? label : undefined} className={actionBarButtonVariants()} {...props}>
    {icon}
    <span className={cn(icon && "max-sm:sr-only")}>{label}</span>
    {endIcon}
  </button>
));
ActionBarButton.displayName = "ActionBarButton";

/* __DOC_BLOCK
<QUI.Box position="relative" width="full" background="layer-1" border="subtle" radius="lg" paddingX="4" paddingTop="4" paddingBottom="16">
  <QUI.Text size="xs" color="tertiary">Table rows…</QUI.Text>
  <QUI.ActionBar open summary="2 selected · Sum of purchases: 838.32 AED" onClear={() => {}}>
    <QUI.ActionBarButton label="Edit" disabled />
    <QUI.ActionBarButton label="Approve" />
    <QUI.ActionBarButton label="Request receipts" />
  </QUI.ActionBar>
</QUI.Box>
DOC__ */

/* __PROPS
{ "open": "boolean" }
PROPS__ */
