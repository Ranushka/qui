import type { NoClass } from "../lib/no-class";
import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { mergeProps } from "@base-ui/react/merge-props";
import { TextArea, type TextAreaProps } from "../atoms/TextArea";
import { Field } from "./Field";
import type { FieldSize } from "../lib/field-parts";

export interface TextAreaFieldProps extends NoClass<Omit<TextAreaProps, "size" | "className" | "groupClassName" | "required" | "value" | "defaultValue">> {
  /** Size of the control and its label/helper text. @default "lg" */
  size?: FieldSize;
  /** Label naming the text area. */
  label?: React.ReactNode;
  /** Adds a `*` marker and sets `aria-required` (no native `required`, so the app's own validation runs first). */
  required?: boolean;
  /** Supporting text shown directly below the label. */
  description?: React.ReactNode;
  /** Helper text shown below the control. Replaced by `error` when one is set. */
  hint?: React.ReactNode;
  /** Error text shown below the control. Overrides `hint` and marks the field invalid. */
  error?: React.ReactNode;
  /** The value (controlled). */
  value?: string;
  /** The initial value (uncontrolled). */
  defaultValue?: string;
  /** Called with the new text on every edit. */
  onValueChange?: (value: string) => void;
}

/**
 * A multi-line text field: `Field` (label, description, hint/error) around a `TextArea`, with the
 * `<textarea>` registered as the field's control so the label, description and validity state are
 * wired to it. Vertical layout only. `autoResize` grows the control with its value and turns off the
 * native resize handle.
 */
export const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  (
    { size = "lg", name, label, required, description, hint, error, disabled, resize, autoResize = false, maxRows, value, defaultValue, onValueChange, ...textAreaProps },
    ref
  ) => (
    <Field name={name} disabled={disabled} size={size} label={label} required={required} description={description} hint={hint} error={error}>
      <BaseField.Control
        ref={ref as React.Ref<HTMLElement>}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
        render={(controlProps) => (
          <TextArea
            {...mergeProps<"textarea">(controlProps as React.ComponentPropsWithRef<"textarea">, { "aria-required": required || undefined, ...textAreaProps })}
            size={size}
            resize={resize}
            autoResize={autoResize}
            maxRows={maxRows}
          />
        )}
      />
    </Field>
  )
);
TextAreaField.displayName = "TextAreaField";

/* __DOC_BLOCK
<div className="flex max-w-md flex-col gap-6 p-4">
  <QUI.TextAreaField label="Description" placeholder="What is this project about?" hint="Markdown is supported." />
  <QUI.TextAreaField label="Release notes" required description="Shown in the changelog." autoResize maxRows={6} error="Release notes can't be empty." />
  <QUI.TextAreaField label="Archived note" disabled defaultValue="Read-only history." size="xl" />
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "resize": ["none", "vertical", "both"], "autoResize": "boolean", "required": "boolean", "disabled": "boolean" }
PROPS__ */
