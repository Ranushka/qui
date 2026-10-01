import type { NoClass } from "../lib/no-class";
import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { Radio, type RadioProps } from "../atoms/Radio";
import { RadioGroup, type RadioGroupProps } from "../atoms/RadioGroup";
import { Field } from "./Field";
import {
  FieldItemRow,
  FieldOptionSizeContext,
  FieldRequiredMarker,
  fieldDescriptionVariants,
  fieldsetLegendVariants,
  useFieldOptionSize,
  type FieldSize,
} from "../lib/field-parts";

export interface RadioGroupFieldProps extends NoClass<Omit<RadioGroupProps, "children" | "className" | "render" | "style">> {
  /** The option rows, usually `RadioGroupFieldOption`s. */
  children: React.ReactNode;
  /** Visible legend naming the group. */
  label: React.ReactNode;
  /** Supporting text shown below the legend. */
  description?: React.ReactNode;
  /** Helper text shown below the group. Replaced by `error` when one is set. */
  hint?: React.ReactNode;
  /** Error text shown below the group. Overrides `hint` and marks the group invalid. */
  error?: React.ReactNode;
  /** Legend, option and helper text size. Option rows inherit it. @default "lg" */
  size?: FieldSize;
}

/**
 * A radio group field: a radiogroup named by its legend, with option rows, an optional description,
 * and a hint-or-error line beneath. `required` adds a marker after the legend and requires a choice
 * on submit. Fill it with `RadioGroupFieldOption` rows.
 */
export const RadioGroupField = React.forwardRef<HTMLDivElement, RadioGroupFieldProps>(
  ({ children, label, name, description, hint, error, required, density = "comfortable", size = "lg", disabled, ...groupProps }, ref) => (
    <Field name={name} disabled={disabled} size={size} hint={hint} error={error}>
      <BaseFieldset.Root ref={ref} disabled={disabled} render={<RadioGroup density={density} disabled={disabled} required={required} {...groupProps} />}>
        <BaseFieldset.Legend className={fieldsetLegendVariants({ size })}>
          {label}
          {required ? <FieldRequiredMarker /> : null}
        </BaseFieldset.Legend>
        {description != null ? <BaseField.Description className={fieldDescriptionVariants({ size })}>{description}</BaseField.Description> : null}
        <FieldOptionSizeContext.Provider value={size}>{children}</FieldOptionSizeContext.Provider>
      </BaseFieldset.Root>
    </Field>
  )
);
RadioGroupField.displayName = "RadioGroupField";

export interface RadioGroupFieldOptionProps extends NoClass<Omit<RadioProps, "className" | "children">> {
  /** Visible label beside the radio. */
  label: React.ReactNode;
  /** Supporting text under the label, announced as the radio's description. */
  description?: React.ReactNode;
  /** Label text size. Defaults to the enclosing `RadioGroupField`'s `size`. */
  size?: FieldSize;
}

/** A radio option row for a `RadioGroupField`: radio, label and optional description. */
export const RadioGroupFieldOption = React.forwardRef<HTMLButtonElement, RadioGroupFieldOptionProps>(
  ({ label, description, size, disabled, ...radioProps }, ref) => {
    const rowSize = useFieldOptionSize(size);
    return <FieldItemRow size={rowSize} disabled={disabled} label={label} description={description} control={<Radio ref={ref} disabled={disabled} {...radioProps} />} />;
  }
);
RadioGroupFieldOption.displayName = "RadioGroupFieldOption";

/* __DOC_BLOCK
<div className="flex max-w-md flex-col gap-6 p-4">
  <QUI.RadioGroupField label="Issue visibility" description="Who can see new issues in this project." hint="Admins always have access." defaultValue="members">
    <QUI.RadioGroupFieldOption value="public" label="Public" description="Anyone in the workspace." />
    <QUI.RadioGroupFieldOption value="members" label="Project members" />
    <QUI.RadioGroupFieldOption value="private" label="Only me (disabled)" disabled />
  </QUI.RadioGroupField>
  <QUI.RadioGroupField label="Estimate scale" required density="compact" error="Choose a scale.">
    <QUI.RadioGroupFieldOption value="points" label="Points" />
    <QUI.RadioGroupFieldOption value="tshirt" label="T-shirt sizes" />
  </QUI.RadioGroupField>
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "density": ["comfortable", "compact"], "required": "boolean", "disabled": "boolean" }
PROPS__ */
