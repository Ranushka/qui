import * as React from "react";
import { Switch, type SwitchProps } from "../atoms/Switch";
import { Field } from "./Field";
import { FieldItemRow, type FieldSize } from "../lib/field-parts";

export interface SwitchFieldProps extends Omit<SwitchProps, "size" | "className" | "children"> {
  /** Visible label beside the switch. */
  label: React.ReactNode;
  /** Supporting text under the label, announced as the switch's description. */
  description?: React.ReactNode;
  /** Helper text shown below the row. Replaced by `error` when one is set. */
  hint?: React.ReactNode;
  /** Error text shown below the row. Overrides `hint` and marks the switch invalid. */
  error?: React.ReactNode;
  /** Label and helper text size. @default "lg" */
  size?: FieldSize;
  /** Size of the switch track itself. @default "md" */
  switchSize?: SwitchProps["size"];
  /** Classes for the field's outer wrapper (layout only — width, margins). */
  className?: string;
}

/**
 * A switch field: a clickable row (switch, label, optional description) with a hint-or-error line
 * beneath it. Clicking anywhere on the row flips the switch. The ref goes to the switch control.
 */
export const SwitchField = React.forwardRef<HTMLButtonElement, SwitchFieldProps>(
  ({ label, description, hint, error, size = "lg", switchSize, name, disabled, className, ...switchProps }, ref) => (
    <Field name={name} disabled={disabled} size={size} hint={hint} error={error} className={className}>
      <FieldItemRow
        size={size}
        disabled={disabled}
        label={label}
        description={description}
        // Base UI's Switch doesn't read the row's description, so it's wired by hand.
        control={(descriptionId) => (
          <Switch ref={ref} size={switchSize} disabled={disabled} aria-describedby={descriptionId} {...switchProps} />
        )}
      />
    </Field>
  )
);
SwitchField.displayName = "SwitchField";

/* __DOC_BLOCK
<div className="flex max-w-md flex-col gap-4 p-4">
  <QUI.SwitchField label="Auto-archive closed issues" description="After 3 months in Done or Cancelled." defaultChecked />
  <QUI.SwitchField label="Public workspace" hint="Anyone with the link can view." switchSize="lg" />
  <QUI.SwitchField label="Single sign-on" disabled hint="Available on the Business plan." />
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "switchSize": ["sm", "md", "lg"], "disabled": "boolean", "readOnly": "boolean", "defaultChecked": "boolean" }
PROPS__ */
