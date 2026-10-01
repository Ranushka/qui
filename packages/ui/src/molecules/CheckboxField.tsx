import type { NoClass } from "../lib/no-class";
import * as React from "react";
import { Checkbox, type CheckboxProps } from "../atoms/Checkbox";
import { Field } from "./Field";
import { FieldItemRow, type FieldSize } from "../lib/field-parts";

export interface CheckboxFieldProps extends NoClass<Omit<CheckboxProps, "label" | "icon" | "stretch" | "className" | "children">> {
  /** Visible label beside the checkbox. */
  label: React.ReactNode;
  /** Supporting text under the label, announced as the checkbox's description. */
  description?: React.ReactNode;
  /** Helper text shown below the row. Replaced by `error` when one is set. */
  hint?: React.ReactNode;
  /** Error text shown below the row. Overrides `hint` and marks the checkbox invalid. */
  error?: React.ReactNode;
  /** Label and helper text size. @default "lg" */
  size?: FieldSize;
}

/**
 * A single checkbox field: a clickable row (checkbox, label, optional description) with a
 * hint-or-error line beneath it. Clicking anywhere on the row toggles the box. The ref goes to the
 * checkbox control.
 */
export const CheckboxField = React.forwardRef<HTMLButtonElement, CheckboxFieldProps>(
  ({ label, description, hint, error, size = "lg", name, disabled, ...checkboxProps }, ref) => (
    <Field name={name} disabled={disabled} size={size} hint={hint} error={error}>
      <FieldItemRow size={size} disabled={disabled} label={label} description={description} control={<Checkbox ref={ref} disabled={disabled} {...checkboxProps} />} />
    </Field>
  )
);
CheckboxField.displayName = "CheckboxField";

/* __DOC_BLOCK
<div className="flex max-w-md flex-col gap-4 p-4">
  <QUI.CheckboxField label="Email me about mentions" description="Only when someone @-mentions you." defaultChecked />
  <QUI.CheckboxField label="I accept the terms" required error="You must accept the terms to continue." />
  <QUI.CheckboxField label="Archived projects" hint="Read-only." disabled />
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "indeterminate": "boolean", "required": "boolean", "disabled": "boolean", "defaultChecked": "boolean" }
PROPS__ */
