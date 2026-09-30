import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { controlGroupClass, controlSize } from "../lib/control-group";
import { controlInputClass } from "../lib/control-input";

const inputVariants = cva(cn(controlInputClass, "flex-1"), {
  variants: {
    size: {
      md: "text-body-xs-regular",
      lg: "text-body-sm-regular",
      xl: "text-body-sm-regular",
      "2xl": "text-body-md-regular",
    },
  },
});

const inputGroupVariants = cva(cn(controlGroupClass, "w-full items-center"), {
  variants: {
    size: {
      md: cn(controlSize.md, "gap-(--control-gap-md) rounded-(--control-radius-md) px-(--field-inset-md)"),
      lg: cn(controlSize.lg, "gap-(--control-gap-lg) rounded-(--control-radius-lg) px-(--field-inset-lg)"),
      xl: cn(controlSize.xl, "gap-(--control-gap-xl) rounded-(--control-radius-xl) px-(--field-inset-xl)"),
      "2xl": cn(controlSize["2xl"], "gap-(--control-gap-2xl) rounded-(--control-radius-2xl) px-(--field-inset-2xl)"),
    },
  },
  defaultVariants: { size: "md" },
});

export interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseInput>, "size">,
    VariantProps<typeof inputVariants> {
  /** Leading content inside the bordered frame, e.g. `<Icon icon={Search} />`. */
  startSlot?: React.ReactNode;
  /** Trailing content inside the bordered frame. */
  endSlot?: React.ReactNode;
  className?: string;
  /** Classes for the bordered frame around the input, when `startSlot`/`endSlot` are used. */
  groupClassName?: string;
}

/**
 * Single-line text field. The bordered frame (focus ring, hover, disabled/invalid chrome) is a
 * separate element from the `<input>` itself so `startSlot`/`endSlot` content can sit inside the
 * same frame without being part of the focusable control.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size = "md", startSlot, endSlot, className, groupClassName, ...props }, ref) => {
    return (
      <div className={cn(inputGroupVariants({ size }), groupClassName)}>
        {startSlot}
        <BaseInput ref={ref} className={cn(inputVariants({ size }), className)} {...props} />
        {endSlot}
      </div>
    );
  }
);
Input.displayName = "Input";

/* __DOC_BLOCK
<div className="flex flex-col gap-3 p-4">
  <QUI.Input placeholder="Search…" size="md" startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />} />
  <QUI.Input placeholder="Large" size="lg" />
  <QUI.Input placeholder="Extra large" size="xl" />
  <QUI.Input placeholder="2xl" size="2xl" />
  <QUI.Input placeholder="Disabled" disabled />
</div>
DOC__ */
