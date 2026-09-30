import * as React from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Minus, Plus } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { controlGroupClass } from "../lib/control-group";
import { controlInputClass } from "../lib/control-input";
import { IconButton } from "./IconButton";
import { Icon } from "./Icon";

const numberFieldGroupVariants = cva(
  cn(controlGroupClass, "w-fit items-center p-px shadow-raised-100 focus-within:shadow-none has-[:disabled]:shadow-none data-disabled:shadow-none"),
  {
    variants: {
      size: {
        sm: "h-(--control-height-sm) rounded-(--control-radius-sm)",
        md: "h-(--control-height-md) rounded-(--control-radius-md)",
        lg: "h-(--control-height-lg) rounded-(--control-radius-lg)",
      },
    },
    defaultVariants: { size: "md" },
  }
);

const numberFieldInputVariants = cva(cn(controlInputClass, "field-sizing-content h-full px-1 text-center"), {
  variants: {
    size: {
      sm: "min-w-9 text-body-xs-medium",
      md: "min-w-10 text-body-xs-medium",
      lg: "min-w-10 text-body-sm-medium",
    },
  },
  defaultVariants: { size: "md" },
});

/** IconButton `size` that keeps steppers flush inside a field of the given `size`. */
const stepperSize = { sm: "xs", md: "sm", lg: "md" } as const;

export interface NumberFieldProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseNumberField.Root>, "render" | "children">,
    VariantProps<typeof numberFieldGroupVariants> {
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/**
 * A numeric input flanked by decrement/increment buttons. Drive it with `value`/`defaultValue` +
 * `onValueChange`, bound it with `min`/`max`/`step`, and pass `format` (an `Intl.NumberFormatOptions`)
 * to format the displayed value. Name the input with `aria-label` or `aria-labelledby` — there's no
 * baked visible label.
 */
export function NumberField({ size = "md", "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, ...props }: NumberFieldProps) {
  const resolvedSize = size ?? "md";
  return (
    <BaseNumberField.Root {...props}>
      <BaseNumberField.Group className={numberFieldGroupVariants({ size: resolvedSize })}>
        <BaseNumberField.Decrement
          render={<IconButton size={stepperSize[resolvedSize]} variant="ghost" showTooltip={false} aria-label="Decrement" icon={<Icon icon={Minus} />} />}
        />
        <BaseNumberField.Input
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className={numberFieldInputVariants({ size: resolvedSize })}
        />
        <BaseNumberField.Increment
          render={<IconButton size={stepperSize[resolvedSize]} variant="ghost" showTooltip={false} aria-label="Increment" icon={<Icon icon={Plus} />} />}
        />
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
}

/* __DOC
<div className="flex items-center gap-4 p-4">
  <QUI.NumberField size="sm" aria-label="Quantity" defaultValue={1} min={0} max={10} />
  <QUI.NumberField size="md" aria-label="Quantity" defaultValue={1} min={0} max={10} />
  <QUI.NumberField size="lg" aria-label="Quantity" defaultValue={1} min={0} max={10} />
  <QUI.NumberField size="md" aria-label="Quantity" defaultValue={1} disabled />
</div>
DOC__ */
