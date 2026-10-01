import * as React from "react";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { fieldDescriptionVariants, fieldsetLegendVariants, type FieldSize } from "../lib/field-parts";

/** The group frame: a column of legend block + body, optionally boxed in a subtle border. */
const fieldsetVariants = cva("flex min-w-0 flex-col gap-3", {
  variants: {
    bordered: {
      true: "rounded-md border-sm border-subtle p-4",
      false: "",
    },
  },
  defaultVariants: { bordered: false },
});

/** The grouped controls, spaced like the fields of a form. */
const fieldsetBodyVariants = cva("flex min-w-0 flex-col gap-4");

export interface FieldsetProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseFieldset.Root>, "className" | "children">>, VariantProps<typeof fieldsetVariants> {
  /** The legend text naming the group. */
  legend: React.ReactNode;
  /** Supporting text shown below the legend. */
  description?: React.ReactNode;
  /** Text size for the legend and its description. @default "lg" */
  legendSize?: FieldSize;
  /** The grouped controls — typically several `InputField`s / `SelectField`s. */
  children: React.ReactNode;
}

/**
 * Groups related fields under a shared legend, as a native `<fieldset>`. `disabled` disables every
 * Base UI-backed control inside it. `bordered` boxes the group for use in a longer form.
 */
export const Fieldset = React.forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ legend, description, legendSize = "lg", bordered, children, ...props }, ref) => (
    <BaseFieldset.Root ref={ref} className={cn(fieldsetVariants({ bordered }))} {...props}>
      <BaseFieldset.Legend className={fieldsetLegendVariants({ size: legendSize })}>{legend}</BaseFieldset.Legend>
      {description != null ? <p className={fieldDescriptionVariants({ size: legendSize })}>{description}</p> : null}
      <div className={fieldsetBodyVariants()}>{children}</div>
    </BaseFieldset.Root>
  )
);
Fieldset.displayName = "Fieldset";

/* __DOC_BLOCK
<div className="flex max-w-md flex-col gap-6 p-4">
  <QUI.Fieldset legend="Billing address" description="Printed on every invoice." bordered>
    <QUI.InputField label="Street" placeholder="221B Baker Street" />
    <QUI.InputField label="City" placeholder="London" />
  </QUI.Fieldset>
  <QUI.Fieldset legend="Danger zone (disabled)" disabled>
    <QUI.InputField label="Workspace slug" defaultValue="acme" />
    <QUI.SwitchField label="Allow guests" />
  </QUI.Fieldset>
</div>
DOC__ */

/* __PROPS
{ "legendSize": ["md", "lg", "xl", "2xl"], "bordered": "boolean", "disabled": "boolean" }
PROPS__ */
