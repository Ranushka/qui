import type { NoClass } from "../lib/no-class";
import * as React from "react";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Field as BaseField } from "@base-ui/react/field";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { Checkbox, type CheckboxProps } from "../atoms/Checkbox";
import { Field } from "./Field";
import { optionGroupVariants } from "../lib/option-group";
import {
  FieldItemRow,
  FieldOptionSizeContext,
  FieldRequiredMarker,
  fieldDescriptionVariants,
  fieldsetLegendVariants,
  useFieldOptionSize,
  type FieldSize,
} from "../lib/field-parts";

export interface CheckboxGroupFieldProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseCheckboxGroup>, "children" | "className" | "render" | "style">> {
  /** The option rows, usually `CheckboxGroupFieldOption`s. */
  children: React.ReactNode;
  /** Visible legend naming the group. */
  label: React.ReactNode;
  /** Submitted field name. */
  name?: string;
  /** Supporting text shown below the legend. */
  description?: React.ReactNode;
  /** Helper text shown below the group. Replaced by `error` when one is set. */
  hint?: React.ReactNode;
  /** Error text shown below the group. Overrides `hint` and marks the group invalid. */
  error?: React.ReactNode;
  /** Shows a required marker after the legend. Purely visual. */
  required?: boolean;
  /** Spacing between option rows. @default "comfortable" */
  density?: "comfortable" | "compact";
  /** Legend, option and helper text size. Option rows inherit it. @default "lg" */
  size?: FieldSize;
}

/**
 * A checkbox group field: a `<fieldset>`-style group named by its legend, with option rows, an
 * optional description, and a hint-or-error line beneath. The group owns the checked-values state
 * (`value`/`defaultValue`/`onValueChange` hold the checked options' `value`s). Fill it with
 * `CheckboxGroupFieldOption` rows.
 */
export const CheckboxGroupField = React.forwardRef<HTMLDivElement, CheckboxGroupFieldProps>(
  ({ children, label, name, description, hint, error, required, density = "comfortable", size = "lg", disabled, ...groupProps }, ref) => (
    <Field name={name} disabled={disabled} size={size} hint={hint} error={error}>
      <BaseFieldset.Root
        ref={ref}
        disabled={disabled}
        render={<BaseCheckboxGroup className={optionGroupVariants({ density })} disabled={disabled} {...groupProps} />}
      >
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
CheckboxGroupField.displayName = "CheckboxGroupField";

export interface CheckboxGroupFieldOptionProps extends NoClass<Omit<CheckboxProps, "label" | "icon" | "stretch" | "className" | "children" | "value">> {
  /** The value this option adds to the group's checked values. */
  value: string;
  /** Visible label beside the checkbox. */
  label: React.ReactNode;
  /** Supporting text under the label, announced as the checkbox's description. */
  description?: React.ReactNode;
  /** Label text size. Defaults to the enclosing `CheckboxGroupField`'s `size`. */
  size?: FieldSize;
}

/** A checkbox option row for a `CheckboxGroupField`: checkbox, label and optional description. */
export const CheckboxGroupFieldOption = React.forwardRef<HTMLButtonElement, CheckboxGroupFieldOptionProps>(
  ({ label, description, size, disabled, ...checkboxProps }, ref) => {
    const rowSize = useFieldOptionSize(size);
    return <FieldItemRow size={rowSize} disabled={disabled} label={label} description={description} control={<Checkbox ref={ref} disabled={disabled} {...checkboxProps} />} />;
  }
);
CheckboxGroupFieldOption.displayName = "CheckboxGroupFieldOption";

/* __DOC_BLOCK
<div className="flex max-w-md flex-col gap-6 p-4">
  <QUI.CheckboxGroupField label="Notify me about" description="Email notifications for this project." hint="You can change this any time." defaultValue={["mentions", "assigned"]}>
    <QUI.CheckboxGroupFieldOption value="mentions" label="Mentions" description="When someone @-mentions you." />
    <QUI.CheckboxGroupFieldOption value="assigned" label="Assigned issues" />
    <QUI.CheckboxGroupFieldOption value="comments" label="All comments" />
    <QUI.CheckboxGroupFieldOption value="digest" label="Weekly digest (coming soon)" disabled />
  </QUI.CheckboxGroupField>
  <QUI.CheckboxGroupField label="Platforms" required density="compact" error="Pick at least one platform.">
    <QUI.CheckboxGroupFieldOption value="web" label="Web" />
    <QUI.CheckboxGroupFieldOption value="ios" label="iOS" />
    <QUI.CheckboxGroupFieldOption value="android" label="Android" />
  </QUI.CheckboxGroupField>
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "density": ["comfortable", "compact"], "required": "boolean", "disabled": "boolean" }
PROPS__ */
