import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

const badgeVariants = cva("inline-flex w-fit shrink-0 items-center justify-center align-middle whitespace-nowrap", {
  variants: {
    size: {
      xs: "h-(--control-height-xs) gap-(--control-gap-xs) px-(--control-padding-x-xs) rounded-(--control-radius-xs) text-caption-md-medium [--node-size:var(--control-glyph-xs)]",
      sm: "h-(--control-height-sm) gap-(--control-gap-sm) px-1.5 rounded-(--control-radius-sm) text-body-xs-medium [--node-size:var(--control-glyph-sm)]",
      md: "h-(--control-height-md) gap-(--control-gap-md) px-2 rounded-(--control-radius-md) text-body-sm-medium [--node-size:var(--control-glyph-md)]",
    },
    variant: {
      neutral: "bg-layer-3 text-primary",
      brand: "bg-accent-subtle text-accent-primary",
      info: "bg-info-subtle text-info-primary",
      success: "bg-success-subtle text-success-primary",
      warning: "bg-warning-subtle text-warning-primary",
      danger: "bg-danger-subtle text-danger-primary",
    },
  },
  defaultVariants: { size: "md", variant: "neutral" },
});

export interface BadgeProps extends NoClass<React.HTMLAttributes<HTMLSpanElement>>, VariantProps<typeof badgeVariants> {
  label?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

/**
 * A small status/category pill: optional leading/trailing icon slots around a `label`. With no
 * `label` it's icon-only and defaults to `role="img"` so an author-supplied `aria-label` is valid
 * ARIA (a bare `<span>`'s generic role can't be named).
 */
export function Badge({ size, variant, label, startIcon, endIcon, ...props }: BadgeProps) {
  return (
    <span role={label == null ? "img" : undefined} className={cn(badgeVariants({ size, variant }))} {...props}>
      {startIcon}
      {label != null ? <span className="min-w-0 truncate">{label}</span> : null}
      {endIcon}
    </span>
  );
}

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <div className="flex flex-wrap items-center gap-2">
    <QUI.Badge label="Neutral" />
    <QUI.Badge variant="brand" label="Brand" />
    <QUI.Badge variant="info" label="Info" />
    <QUI.Badge variant="success" label="Success" />
    <QUI.Badge variant="warning" label="Warning" />
    <QUI.Badge variant="danger" label="Danger" />
  </div>
  <div className="flex flex-wrap items-center gap-2">
    <QUI.Badge size="xs" variant="brand" label="xs" />
    <QUI.Badge size="sm" variant="brand" label="sm" />
    <QUI.Badge size="md" variant="brand" label="md" />
    <QUI.Badge variant="success" label="With icon" startIcon={<QUI.Icon icon={Icons.Check} />} />
  </div>
</div>
DOC__ */

/* __PROPS
{ "variant": ["neutral", "brand", "info", "success", "warning", "danger"], "size": ["xs", "sm", "md"] }
PROPS__ */
