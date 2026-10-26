import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { controlChromeVariants } from "../lib/control-chrome";
import { Spinner } from "./Spinner";

/** Label-button geometry: height/padding/radius/type-scale per rung of the control ladder. */
const buttonGeometryVariants = cva("whitespace-nowrap", {
  variants: {
    size: {
      xs: "h-(--control-height-xs) min-w-10 gap-(--control-gap-xs) px-(--control-padding-x-xs) rounded-(--control-radius-xs) text-body-xs-medium [--node-size:var(--control-glyph-xs)]",
      sm: "h-(--control-height-sm) min-w-10 gap-(--control-gap-sm) px-(--control-padding-x-sm) rounded-(--control-radius-sm) text-body-xs-medium [--node-size:var(--control-glyph-sm)]",
      md: "h-(--control-height-md) min-w-12 gap-(--control-gap-md) px-(--control-padding-x-md) rounded-(--control-radius-md) text-body-xs-medium [--node-size:var(--control-glyph-md)]",
      lg: "h-(--control-height-lg) min-w-13 gap-(--control-gap-lg) px-(--control-padding-x-lg) rounded-(--control-radius-lg) text-body-sm-medium [--node-size:var(--control-glyph-lg)]",
      xl: "h-(--control-height-xl) min-w-14 gap-(--control-gap-xl) px-(--control-padding-x-xl) rounded-(--control-radius-xl) text-body-sm-medium [--node-size:var(--control-glyph-xl)]",
      "2xl": "h-(--control-height-2xl) min-w-16 gap-(--control-gap-2xl) px-(--control-padding-x-2xl) rounded-(--control-radius-2xl) text-body-md-medium [--node-size:var(--control-glyph-2xl)]",
    },
    stretch: {
      auto: "",
      full: "w-full",
    },
  },
  defaultVariants: { size: "md", stretch: "auto" },
});

/** On glass the end icon sits in a solid bubble that swells on hover, e.g. the arrow of a "Get started". */
const glassEndIconClass =
  "-me-[calc(var(--node-size)*0.5)] inline-flex size-[calc(var(--node-size)*1.75)] shrink-0 items-center justify-center rounded-(--control-radius-sm) bg-inverse text-inverse transition-transform duration-200 group-hover:scale-110 group-active:scale-95 group-disabled:bg-layer-disabled group-disabled:text-on-color-disabled [--node-size:calc(var(--control-glyph-md)*0.9)]";

export interface ButtonProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseButton>, "children" | "render">>, VariantProps<typeof controlChromeVariants>, VariantProps<typeof buttonGeometryVariants> {
  /** Visible button label. */
  label: string;
  /** Icon rendered beside the label (inline-start by default), e.g. `<Icon icon={Plus} />`. */
  icon?: React.ReactNode;
  /**
   * Which side of the label the icon sits on. The `loading` spinner takes the same slot.
   * @default "start"
   */
  iconPosition?: "start" | "end";
  /**
   * A second icon after the label, alongside `icon` — e.g. a `ChevronDown` on a button that opens a
   * menu, while `icon` names what the button is.
   */
  endIcon?: React.ReactNode;
  /** Shows a spinner in the icon slot, sets `aria-busy`, and makes the button non-interactive. */
  loading?: boolean;
}

/**
 * The ready-made Button: Base UI's `Button` behavior on qui's button chrome, with an optional icon
 * beside the label that swaps for a spinner while `loading`. Every button carries a visible
 * `label` — icon-only buttons are `IconButton`, not this with an empty label.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", stretch, label, icon, iconPosition = "start", endIcon, loading = false, disabled, ...props }, ref) => {
    const iconSlot = icon != null && loading ? <Spinner /> : (icon ?? <Spinner active={loading} />);

    return (
      <BaseButton
        ref={ref}
        disabled={disabled || loading}
        focusableWhenDisabled={loading || undefined}
        aria-busy={loading || undefined}
        className={cn(controlChromeVariants({ variant }), buttonGeometryVariants({ size, stretch }))}
        {...props}
      >
        {iconPosition === "start" ? iconSlot : null}
        <span className="truncate">{label}</span>
        {iconPosition === "end" ? iconSlot : null}
        {variant === "glass" && endIcon != null ? <span className={glassEndIconClass}>{endIcon}</span> : endIcon}
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
    <QUI.Button variant="glass" size="2xl" label="Get started" endIcon={<QUI.Icon icon={Icons.ChevronRight} />} />
    <QUI.Button variant="glass" size="lg" icon={<QUI.Icon icon={Icons.Sparkles} />} label="Glass" />
    <QUI.Button variant="glass" label="Disabled" disabled />
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Button size="xs" label="xs" />
    <QUI.Button size="sm" label="sm" />
    <QUI.Button size="md" label="md" />
    <QUI.Button size="lg" label="lg" />
    <QUI.Button size="xl" label="xl" />
    <QUI.Button size="2xl" label="2xl" />
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Button label="Loading" loading />
    <QUI.Button label="Disabled" disabled />
    <QUI.Button variant="secondary" label="Loading" loading />
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <QUI.Button variant="ghost" icon={<QUI.Icon icon={Icons.BookOpen} />} endIcon={<QUI.Icon icon={Icons.ChevronDown} />} label="Wiki" />
  </div>
</div>
DOC__ */

/* __PROPS
{ "variant": ["primary", "secondary", "tertiary", "ghost", "danger", "danger-outline", "glass"], "size": ["xs", "sm", "md", "lg", "xl", "2xl"], "stretch": ["auto", "full"], "iconPosition": ["start", "end"], "loading": "boolean", "disabled": "boolean" }
PROPS__ */
