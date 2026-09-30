import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { controlChromeVariants } from "../lib/control-chrome";
import { Spinner } from "./Spinner";
import { Tooltip } from "./Tooltip";

/** Icon-button geometry: a square box per rung of the control ladder, sized to `--node-size`. */
const iconButtonGeometryVariants = cva("", {
  variants: {
    size: {
      xs: "size-(--control-height-xs) rounded-(--control-radius-xs) [--node-size:var(--control-glyph-xs)]",
      sm: "size-(--control-height-sm) rounded-(--control-radius-sm) [--node-size:var(--control-glyph-sm)]",
      md: "size-(--control-height-md) rounded-(--control-radius-md) [--node-size:var(--control-glyph-md)]",
      lg: "size-(--control-height-lg) rounded-(--control-radius-lg) [--node-size:var(--control-glyph-lg)]",
    },
  },
  defaultVariants: { size: "md" },
});

export interface IconButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseButton>, "children" | "render">,
    VariantProps<typeof controlChromeVariants>,
    VariantProps<typeof iconButtonGeometryVariants> {
  /** Icon element filling the button, e.g. `<Icon icon={Plus} />`. Swapped for a spinner while `loading`. */
  icon: React.ReactNode;
  /** Required accessible name — there's no visible label, so this is also what the tooltip shows. */
  "aria-label": string;
  /** Shows the `aria-label` as a hover/focus tooltip. @default true */
  showTooltip?: boolean;
  loading?: boolean;
}

/**
 * The ready-made icon-only button: Base UI's `Button` behavior on qui's square button chrome,
 * filled with the given icon and swapping in a spinner while `loading`. An accessible name is
 * required via `aria-label` and doubles as the default tooltip.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "primary", size = "md", icon, loading = false, disabled, showTooltip = true, className, "aria-label": ariaLabel, ...props }, ref) => {
    const button = (
      <BaseButton
        ref={ref}
        aria-label={ariaLabel}
        disabled={disabled || loading}
        focusableWhenDisabled={loading || undefined}
        aria-busy={loading || undefined}
        className={cn(controlChromeVariants({ variant }), iconButtonGeometryVariants({ size }), className)}
        {...props}
      >
        {loading ? <Spinner /> : icon}
      </BaseButton>
    );

    if (!showTooltip) return button;
    return <Tooltip label={ariaLabel}>{button}</Tooltip>;
  }
);
IconButton.displayName = "IconButton";

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <div className="flex flex-wrap items-center gap-3">
    <QUI.IconButton variant="primary" aria-label="Add" icon={<QUI.Icon icon={Icons.Plus} />} />
    <QUI.IconButton variant="secondary" aria-label="Settings" icon={<QUI.Icon icon={Icons.Settings} />} />
    <QUI.IconButton variant="tertiary" aria-label="More" icon={<QUI.Icon icon={Icons.MoreHorizontal} />} />
    <QUI.IconButton variant="ghost" aria-label="Close" icon={<QUI.Icon icon={Icons.X} />} />
    <QUI.IconButton variant="danger" aria-label="Delete" icon={<QUI.Icon icon={Icons.Trash2} />} />
    <QUI.IconButton variant="danger-outline" aria-label="Delete" icon={<QUI.Icon icon={Icons.Trash2} />} />
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <QUI.IconButton size="xs" aria-label="Add" icon={<QUI.Icon icon={Icons.Plus} />} />
    <QUI.IconButton size="sm" aria-label="Add" icon={<QUI.Icon icon={Icons.Plus} />} />
    <QUI.IconButton size="md" aria-label="Add" icon={<QUI.Icon icon={Icons.Plus} />} />
    <QUI.IconButton size="lg" aria-label="Add" icon={<QUI.Icon icon={Icons.Plus} />} />
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <QUI.IconButton aria-label="Loading" icon={<QUI.Icon icon={Icons.Plus} />} loading />
    <QUI.IconButton aria-label="Disabled" icon={<QUI.Icon icon={Icons.Plus} />} disabled />
  </div>
</div>
DOC__ */
