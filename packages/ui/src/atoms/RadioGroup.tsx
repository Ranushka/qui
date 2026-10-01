import * as React from "react";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { optionGroupVariants } from "../lib/option-group";
import { Radio } from "./Radio";

export interface RadioGroupProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseRadioGroup>> {
  density?: "comfortable" | "compact";
  /** Stack options in a column, or lay them out in a wrapping row. @default "vertical" */
  orientation?: "vertical" | "horizontal";
}

/** Groups a set of `Radio` options so at most one can be selected at a time. */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(({ density = "comfortable", orientation = "vertical", ...props }, ref) => (
  <BaseRadioGroup ref={ref} className={cn(optionGroupVariants({ density, orientation }))} {...props} />
));
RadioGroup.displayName = "RadioGroup";

const radioLabelClass = cn(
  "inline-flex w-fit cursor-pointer items-center gap-2 rounded-sm px-2 py-1 align-top",
  "text-body-xs-regular text-secondary transition-colors",
  "not-has-[[data-disabled]]:hover:bg-layer-transparent-hover",
  "has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:text-disabled"
);

export interface RadioOptionProps extends NoClass<React.ComponentPropsWithoutRef<typeof Radio>> {
  label: React.ReactNode;
}

/** A `Radio` paired with a clickable label — the common case inside a `RadioGroup`. */
export const RadioOption = React.forwardRef<HTMLButtonElement, RadioOptionProps>(({ label, id, ...props }, ref) => {
  const generatedId = React.useId();
  const radioId = id ?? generatedId;
  return (
    <label htmlFor={radioId} className={radioLabelClass}>
      <Radio ref={ref} id={radioId} {...props} />
      {label}
    </label>
  );
});
RadioOption.displayName = "RadioOption";

/* __DOC_BLOCK
<QUI.RadioGroup defaultValue="md">
  <QUI.RadioOption value="sm" label="Small" />
  <QUI.RadioOption value="md" label="Medium" />
  <QUI.RadioOption value="lg" label="Large" />
  <QUI.RadioOption value="xl" label="Extra large (disabled)" disabled />
</QUI.RadioGroup>
DOC__ */

/* __PROPS
{ "density": ["comfortable", "compact"], "orientation": ["vertical", "horizontal"] }
PROPS__ */
