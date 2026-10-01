import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Combobox, ComboboxContent, ComboboxInputGroup, ComboboxItem } from "./Combobox";
import { Field } from "./Field";
import type { FieldSize } from "../lib/field-parts";

export type ComboboxFieldProps<Value, Multiple extends boolean | undefined = false> = Omit<BaseCombobox.Root.Props<Value, Multiple>, "children"> & {
  /** Visible field label. */
  label: React.ReactNode;
  /** Supporting text shown below the label. Always shown, alongside `hint`/`error`. */
  description?: React.ReactNode;
  /** Helper text shown below the control. Replaced by `error` when one is set. */
  hint?: React.ReactNode;
  /** Error text shown below the control. Overrides `hint` and marks the field invalid. */
  error?: React.ReactNode;
  /** Placeholder for the filter input. */
  placeholder?: string;
  /** Message shown in the popup when nothing matches. @default "No results found." */
  emptyMessage?: React.ReactNode;
  /** Shows a clear ("x") button once something is typed or selected. @default true */
  clearable?: boolean;
  /** Size of the control and its label/helper text. @default "lg" */
  size?: FieldSize;
};

/** An option's display text: `itemToStringLabel`, else a record's `label`, else the value itself. */
function defaultLabel(item: unknown): string {
  if (item != null && typeof item === "object" && "label" in item) return String((item as { label: unknown }).label);
  return String(item);
}

/**
 * A ready-made searchable select: `Field` (label, description, hint/error) around a `Combobox`
 * filter input and a popup listing `items`, each row checked while selected. Picks one value by
 * default; `multiple` picks several. Every `Combobox` root prop (`value`, `onValueChange`,
 * `itemToStringLabel`, `filter`, ...) passes through.
 */
export function ComboboxField<Value, Multiple extends boolean | undefined = false>({
  label,
  description,
  hint,
  error,
  placeholder,
  emptyMessage,
  clearable = true,
  size = "lg",
  name,
  disabled,
  required,
  
  ...comboboxProps
}: ComboboxFieldProps<Value, Multiple>) {
  const toLabel = comboboxProps.itemToStringLabel ?? defaultLabel;
  return (
    <Field name={name} disabled={disabled} size={size} label={label} required={required} description={description} hint={hint} error={error}>
      <Combobox<Value, Multiple> disabled={disabled} required={required} {...comboboxProps}>
        <ComboboxInputGroup size={size} placeholder={placeholder} clearable={clearable} />
        <ComboboxContent emptyMessage={emptyMessage}>
          {(item: Value, index: number) => (
            <ComboboxItem key={typeof item === "object" ? index : String(item)} value={item}>
              {toLabel(item)}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
    </Field>
  );
}

/* __DOC_BLOCK
<div className="flex max-w-md flex-col gap-6 p-4">
  <QUI.ComboboxField label="Label" placeholder="Search labels…" hint="Type to filter." items={["Bug", "Feature", "Improvement", "Documentation", "Design"]} defaultValue="Feature" />
  <QUI.ComboboxField label="Watchers" multiple description="Everyone here is notified of changes." placeholder="Add people…" items={["Ava", "Ben", "Chloe", "Dev", "Eli"]} defaultValue={["Ava", "Dev"]} />
  <QUI.ComboboxField label="Cycle" required placeholder="Pick a cycle…" items={["Cycle 12", "Cycle 13"]} error="A cycle is required." />
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "multiple": "boolean", "clearable": "boolean", "required": "boolean", "disabled": "boolean" }
PROPS__ */
