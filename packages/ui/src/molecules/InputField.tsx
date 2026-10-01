import type { NoClass } from "../lib/no-class";
import * as React from "react";
import { Input, type InputProps } from "../atoms/Input";
import { Field } from "./Field";
import type { FieldSize } from "../lib/field-parts";

export interface InputFieldProps extends NoClass<Omit<InputProps, "size" | "startSlot" | "endSlot" | "className" | "groupClassName" | "required">> {
  /** Size of the control and its label/helper text. @default "lg" */
  size?: FieldSize;
  /** Label placement: above the control, or beside it. @default "vertical" */
  orientation?: "vertical" | "horizontal";
  /** Label naming the input. */
  label?: React.ReactNode;
  /**
   * Marks the field required: adds a `*` marker and sets `aria-required`. The native `required`
   * attribute is deliberately not rendered, so browser constraint validation never pre-empts the
   * app's own validation on submit.
   */
  required?: boolean;
  /** Supporting text shown directly below the label. */
  description?: React.ReactNode;
  /** Helper text shown below the control. Replaced by `error` when one is set. */
  hint?: React.ReactNode;
  /** Error text shown below the control. Overrides `hint` and marks the field invalid. */
  error?: React.ReactNode;
  /** Content at the inline start of the input frame, e.g. `<Icon icon={Search} />`. */
  startIcon?: React.ReactNode;
  /** Content at the inline end of the input frame. */
  endIcon?: React.ReactNode;
}

/**
 * A single-line text field: `Field` (label, description, hint/error) around an `Input`. Supports
 * start/end icons inside the input frame and a `horizontal` orientation where the label sits beside
 * the control. The ref goes to the `<input>`.
 */
export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ size = "lg", orientation = "vertical", name, label, required, description, hint, error, startIcon, endIcon, disabled, ...inputProps }, ref) => (
    <Field
      name={name}
      disabled={disabled}
      size={size}
      orientation={orientation}
      label={label}
      required={required}
      description={description}
      hint={hint}
      error={error}

    >
      <Input ref={ref} size={size} startSlot={startIcon} endSlot={endIcon} aria-required={required || undefined} {...inputProps} />
    </Field>
  )
);
InputField.displayName = "InputField";

/* __DOC_BLOCK
<div className="flex max-w-md flex-col gap-6 p-4">
  <QUI.InputField label="Email" placeholder="you@company.com" hint="We'll never share it." startIcon={<QUI.Icon icon={Icons.Mail} tint="placeholder" />} />
  <QUI.InputField label="Workspace URL" required description="Lowercase letters and dashes only." defaultValue="Acme Inc" error="Use lowercase letters and dashes." />
  <QUI.InputField label="Display name" orientation="horizontal" placeholder="Jane Doe" />
  <QUI.InputField label="API key" disabled defaultValue="sk-••••••••" size="xl" />
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "orientation": ["vertical", "horizontal"], "required": "boolean", "disabled": "boolean" }
PROPS__ */
