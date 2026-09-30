import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { controlChromeVariants } from "../lib/control-chrome";
import { Spinner } from "./Spinner";

/** Label-button geometry: height/padding/radius/type-scale per rung of the control ladder. */
const buttonGeometryVariants = cva("whitespace-nowrap", {
  variants: {
    size: {
      xs: "h-(--control-height-xs) min-w-10 gap-(--control-gap-xs) px-(--control-padding-x-xs) rounded-(--control-radius-xs) text-xs font-medium [--node-size:var(--control-glyph-xs)]",
      sm: "h-(--control-height-sm) min-w-10 gap-(--control-gap-sm) px-(--control-padding-x-sm) rounded-(--control-radius-sm) text-xs font-medium [--node-size:var(--control-glyph-sm)]",
      md: "h-(--control-height-md) min-w-12 gap-(--control-gap-md) px-(--control-padding-x-md) rounded-(--control-radius-md) text-xs font-medium [--node-size:var(--control-glyph-md)]",
      lg: "h-(--control-height-lg) min-w-13 gap-(--control-gap-lg) px-(--control-padding-x-lg) rounded-(--control-radius-lg) text-sm font-medium [--node-size:var(--control-glyph-lg)]",
    },
    stretch: {
      auto: "",
      full: "w-full",
    },
  },
  defaultVariants: { size: "md", stretch: "auto" },
});

export interface ButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseButton>, "children" | "render">,
    VariantProps<typeof controlChromeVariants>,
    VariantProps<typeof buttonGeometryVariants> {
  /** Visible button label. */
  label: string;
  /** Icon rendered beside the label (inline-start by default), e.g. `<Icon icon={Plus} />`. */
  icon?: React.ReactNode;
  /**
   * Which side of the label the icon sits on. The `loading` spinner takes the same slot.
   * @default "start"
   */
  iconPosition?: "start" | "end";
  /** Shows a spinner in the icon slot, sets `aria-busy`, and makes the button non-interactive. */
  loading?: boolean;
}

/**
 * The ready-made Button: Base UI's `Button` behavior on qui's button chrome, with an optional icon
 * beside the label that swaps for a spinner while `loading`. Every button carries a visible
 * `label` — icon-only buttons are `IconButton`, not this with an empty label.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", stretch, label, icon, iconPosition = "start", loading = false, disabled, className, ...props }, ref) => {
    const iconSlot = icon != null && loading ? <Spinner /> : (icon ?? <Spinner active={loading} />);

    return (
      <BaseButton
        ref={ref}
        disabled={disabled || loading}
        focusableWhenDisabled={loading || undefined}
        aria-busy={loading || undefined}
        className={cn(controlChromeVariants({ variant }), buttonGeometryVariants({ size, stretch }), className)}
        {...props}
      >
        {iconPosition === "start" ? iconSlot : null}
        <span className="truncate">{label}</span>
        {iconPosition === "end" ? iconSlot : null}
      </BaseButton>
    );
  }
);
Button.displayName = "Button";

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Button variant="primary" label="Primary" />
    <QUI.Button variant="secondary" label="Secondary" />
    <QUI.Button variant="tertiary" label="Tertiary" />
    <QUI.Button variant="ghost" label="Ghost" />
    <QUI.Button variant="danger" label="Danger" />
    <QUI.Button variant="danger-outline" label="Danger outline" />
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Button size="xs" label="xs" />
    <QUI.Button size="sm" label="sm" />
    <QUI.Button size="md" label="md" />
    <QUI.Button size="lg" label="lg" />
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Button label="Loading" loading />
    <QUI.Button label="Disabled" disabled />
    <QUI.Button variant="secondary" label="Loading" loading />
  </div>
</div>
DOC__ */

/* __PROPS
{ "variant": ["primary", "secondary", "tertiary", "ghost", "danger", "danger-outline"], "size": ["xs", "sm", "md", "lg"], "stretch": ["auto", "full"], "iconPosition": ["start", "end"], "loading": "boolean", "disabled": "boolean" }
PROPS__ */
