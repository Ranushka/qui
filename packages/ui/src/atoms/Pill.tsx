import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { Spinner } from "./Spinner";

const pillVariants = cva(
  "relative inline-flex max-w-[224px] shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md border-sm align-middle text-secondary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-strong data-placeholder:not-disabled:not-aria-busy:text-placeholder",
  {
    variants: {
      size: {
        xs: "h-(--control-height-xs) px-1.5 text-caption-md-regular [--node-size:var(--control-glyph-xs)]",
        sm: "h-(--control-height-sm) px-(--control-padding-x-sm) text-caption-md-regular [--node-size:var(--control-glyph-sm)]",
        md: "h-(--control-height-md) px-2 text-body-xs-regular [--node-size:var(--control-glyph-md)]",
      },
      variant: {
        outline:
          "border-subtle-1 bg-layer-2 hover:border-strong hover:bg-layer-2-hover active:border-strong active:bg-layer-2-active active:text-primary data-popup-open:border-strong data-popup-open:bg-layer-2-active data-popup-open:text-primary disabled:cursor-not-allowed disabled:border-subtle-1 disabled:bg-layer-transparent disabled:text-disabled aria-busy:cursor-default aria-busy:border-subtle-1 aria-busy:bg-layer-transparent aria-busy:text-disabled",
        soft: "border-transparent bg-layer-3 hover:bg-layer-3-hover active:bg-layer-3-active active:text-primary data-popup-open:bg-layer-3-active data-popup-open:text-primary disabled:cursor-not-allowed disabled:bg-layer-transparent disabled:text-disabled aria-busy:cursor-default aria-busy:bg-layer-transparent aria-busy:text-disabled",
        ghost:
          "border-transparent bg-layer-transparent hover:bg-layer-transparent-hover active:bg-layer-transparent-active active:text-primary data-popup-open:bg-layer-transparent-active data-popup-open:text-primary disabled:cursor-not-allowed disabled:bg-layer-transparent disabled:text-disabled aria-busy:cursor-default aria-busy:bg-layer-transparent aria-busy:text-disabled",
      },
    },
    defaultVariants: { size: "md", variant: "outline" },
  }
);

export interface PillProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseButton>, "children" | "render">,
    VariantProps<typeof pillVariants> {
  label?: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  placeholder?: boolean;
}

/**
 * A compact filter/select-style button: an optional leading node, a `label`, an optional trailing
 * node, swapping the trailing slot for a spinner while `loading`. With no `label` the label part is
 * skipped entirely so the pill doesn't render lopsided from an empty flex child.
 */
export const Pill = React.forwardRef<HTMLButtonElement, PillProps>(
  ({ size = "md", variant = "outline", label, startIcon, endIcon, loading = false, placeholder, disabled, className, ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        data-placeholder={placeholder || undefined}
        disabled={disabled || loading}
        focusableWhenDisabled={loading || undefined}
        aria-busy={loading || undefined}
        className={cn(pillVariants({ size, variant }), className)}
        {...props}
      >
        {!loading ? startIcon : null}
        {label != null ? <span className="min-w-0 truncate">{label}</span> : null}
        {endIcon != null && loading ? <Spinner /> : (endIcon ?? <Spinner active={loading} />)}
      </BaseButton>
    );
  }
);
Pill.displayName = "Pill";

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Pill variant="outline" label="Outline" startIcon={<QUI.Icon icon={Icons.Filter} />} />
    <QUI.Pill variant="soft" label="Soft" startIcon={<QUI.Icon icon={Icons.Filter} />} />
    <QUI.Pill variant="ghost" label="Ghost" startIcon={<QUI.Icon icon={Icons.Filter} />} />
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Pill size="xs" label="xs" />
    <QUI.Pill size="sm" label="sm" />
    <QUI.Pill size="md" label="md" />
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Pill label="Placeholder" placeholder />
    <QUI.Pill label="Loading" loading />
    <QUI.Pill label="Disabled" disabled />
  </div>
</div>
DOC__ */

/* __PROPS
{ "variant": ["outline", "soft", "ghost"], "size": ["xs", "sm", "md"], "loading": "boolean", "placeholder": "boolean", "disabled": "boolean" }
PROPS__ */
