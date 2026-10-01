import * as React from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * Behavior base shared by both toggle looks. The pressed look is gated on not-disabled so a
 * disabled-but-pressed toggle reads as disabled, not selected — the same rule `ToolbarToggle` follows.
 */
const toggleBaseClass =
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-strong disabled:cursor-not-allowed data-disabled:cursor-not-allowed";

/** Per-rung hit-area padding: the `xs` box is under the 24px minimum, so a pseudo-element grows its target. */
const xsHitArea = "before:absolute before:-inset-0.5 before:content-['']";

/** Label-toggle chrome: a raised, bordered chip that brightens on hover and holds its border + fill while pressed. */
const toggleVariants = cva(
  cn(
    toggleBaseClass,
    "max-w-[120px] overflow-clip border border-subtle-1 bg-layer-2 text-placeholder",
    "hover:border-strong hover:bg-layer-2-hover hover:text-secondary active:border-strong active:bg-layer-2-active active:text-secondary",
    "not-disabled:not-data-disabled:data-pressed:border-strong not-disabled:not-data-disabled:data-pressed:bg-layer-2-selected not-disabled:not-data-disabled:data-pressed:text-primary",
    "disabled:border-subtle-1 disabled:bg-transparent disabled:text-disabled data-disabled:border-subtle-1 data-disabled:bg-transparent data-disabled:text-disabled"
  ),
  {
    variants: {
      size: {
        xs: cn(
          "h-(--control-height-xs) gap-(--control-gap-xs) rounded-(--control-radius-xs) px-(--control-padding-x-xs) text-caption-md-regular [--node-size:var(--control-glyph-xs)]",
          xsHitArea
        ),
        sm: "h-(--control-height-sm) gap-(--control-gap-sm) rounded-(--control-radius-sm) px-(--control-padding-x-sm) text-body-xs-regular [--node-size:var(--control-glyph-sm)]",
        md: "h-(--control-height-md) gap-(--control-gap-md) rounded-(--control-radius-md) px-(--control-padding-x-md) text-body-xs-regular [--node-size:var(--control-glyph-md)]",
      },
    },
    defaultVariants: { size: "md" },
  }
);

/** Icon-toggle chrome: a square box per rung, either the raised bordered look or a transparent ghost. */
const iconToggleVariants = cva(toggleBaseClass, {
  variants: {
    variant: {
      secondary: cn(
        "border border-subtle-1 bg-layer-2 text-icon-placeholder shadow-raised-100",
        "hover:border-strong hover:bg-layer-2-hover hover:text-icon-secondary active:border-strong active:bg-layer-2-active active:text-icon-secondary",
        "not-disabled:not-data-disabled:data-pressed:border-strong not-disabled:not-data-disabled:data-pressed:bg-layer-2-selected not-disabled:not-data-disabled:data-pressed:text-icon-secondary",
        "disabled:border-subtle-1 disabled:bg-transparent disabled:text-icon-disabled data-disabled:border-subtle-1 data-disabled:bg-transparent data-disabled:text-icon-disabled"
      ),
      ghost: cn(
        "bg-layer-transparent text-icon-secondary hover:bg-layer-transparent-hover active:bg-layer-transparent-active",
        "not-disabled:not-data-disabled:data-pressed:bg-layer-transparent-selected",
        "disabled:bg-transparent disabled:text-icon-disabled data-disabled:bg-transparent data-disabled:text-icon-disabled"
      ),
    },
    size: {
      xs: cn("size-(--control-height-xs) rounded-(--control-radius-xs) [--node-size:var(--control-glyph-xs)]", xsHitArea),
      sm: "size-(--control-height-sm) rounded-(--control-radius-sm) [--node-size:var(--control-glyph-sm)]",
      md: "size-(--control-height-md) rounded-(--control-radius-md) [--node-size:var(--control-glyph-md)]",
    },
  },
  defaultVariants: { variant: "secondary", size: "md" },
});

type BaseToggleProps = Omit<React.ComponentPropsWithoutRef<typeof BaseToggle>, "children" | "className" | "render">;

export interface ToggleProps extends BaseToggleProps, VariantProps<typeof toggleVariants> {
  /** Visible label. Truncates past the 120px cap; the full text is kept in a native `title`. */
  label: string;
  /** Element before the label, e.g. `<Icon icon={Tag} />`. */
  startIcon?: React.ReactNode;
  /** Element after the label, e.g. `<Icon icon={X} />`. */
  endIcon?: React.ReactNode;
  className?: string;
}

/**
 * A two-state labeled chip (a filter, a view option) on Base UI's `Toggle`: `aria-pressed` with
 * `pressed`/`defaultPressed` + `onPressedChange`, and a `value` for use inside a Base UI
 * `ToggleGroup`. The selected look is the pressed state; inside a `Toolbar` use `ToolbarToggle`.
 */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(({ size, label, startIcon, endIcon, className, ...props }, ref) => (
  <BaseToggle ref={ref} className={cn(toggleVariants({ size }), className)} {...props}>
    {startIcon}
    <span className="min-w-0 truncate" title={label}>
      {label}
    </span>
    {endIcon}
  </BaseToggle>
));
Toggle.displayName = "Toggle";

export interface IconToggleProps extends BaseToggleProps, VariantProps<typeof iconToggleVariants> {
  /** Icon element filling the square box, e.g. `<Icon icon={Star} />`. */
  icon: React.ReactNode;
  /** Required accessible name — an icon-only toggle has no visible text. */
  "aria-label": string;
  className?: string;
}

/** The icon-only `Toggle`: a square raised (`secondary`) or transparent (`ghost`) box holding a single glyph. */
export const IconToggle = React.forwardRef<HTMLButtonElement, IconToggleProps>(({ variant, size, icon, className, ...props }, ref) => (
  <BaseToggle ref={ref} className={cn(iconToggleVariants({ variant, size }), className)} {...props}>
    {icon}
  </BaseToggle>
));
IconToggle.displayName = "IconToggle";

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Toggle label="Assigned to me" defaultPressed />
    <QUI.Toggle label="High priority" startIcon={<QUI.Icon icon={Icons.Flag} />} />
    <QUI.Toggle label="A very long filter label that truncates" />
    <QUI.Toggle label="Disabled" disabled />
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Toggle size="xs" label="xs" />
    <QUI.Toggle size="sm" label="sm" />
    <QUI.Toggle size="md" label="md" />
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <QUI.IconToggle aria-label="Star" icon={<QUI.Icon icon={Icons.Star} />} defaultPressed />
    <QUI.IconToggle aria-label="Pin" icon={<QUI.Icon icon={Icons.Pin} />} />
    <QUI.IconToggle variant="ghost" aria-label="Bold" icon={<QUI.Icon icon={Icons.Bold} />} defaultPressed />
    <QUI.IconToggle variant="ghost" aria-label="Italic" icon={<QUI.Icon icon={Icons.Italic} />} />
    <QUI.IconToggle size="sm" aria-label="Bell" icon={<QUI.Icon icon={Icons.Bell} />} />
    <QUI.IconToggle size="xs" aria-label="Eye" icon={<QUI.Icon icon={Icons.Eye} />} />
    <QUI.IconToggle aria-label="Lock" icon={<QUI.Icon icon={Icons.Lock} />} disabled />
  </div>
</div>
DOC__ */

/* __PROPS
{ "Toggle.size": ["xs", "sm", "md"], "Toggle.pressed": "boolean", "Toggle.disabled": "boolean", "IconToggle.variant": ["secondary", "ghost"], "IconToggle.size": ["xs", "sm", "md"], "IconToggle.pressed": "boolean" }
PROPS__ */
