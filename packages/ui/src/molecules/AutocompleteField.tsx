import * as React from "react";
import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { Autocomplete, AutocompleteContent, AutocompleteInputGroup, AutocompleteItem } from "./Autocomplete";
import { Field } from "./Field";
import type { FieldSize } from "../lib/field-parts";

export type AutocompleteFieldProps<Value> = Omit<BaseAutocomplete.Root.Props<Value>, "children" | "items"> & {
  /** The suggestions to filter as the user types. */
  items: readonly Value[];
  /** Visible field label. */
  label: React.ReactNode;
  /** Supporting text shown below the label. Always shown, alongside `hint`/`error`. */
  description?: React.ReactNode;
  /** Helper text shown below the input. Replaced by `error` when one is set. */
  hint?: React.ReactNode;
  /** Error text shown below the input. Overrides `hint` and marks the field invalid. */
  error?: React.ReactNode;
  /** Input placeholder. */
  placeholder?: string;
  /** Message shown in the popup when nothing matches. @default "No matches." */
  emptyMessage?: React.ReactNode;
  /** Size of the input, its suggestion rows, and its label/helper text. @default "lg" */
  size?: FieldSize;
  /** Classes for the field's outer wrapper (layout only — width, margins). */
  className?: string;
};

/**
 * A ready-made autocomplete: `Field` (label, description, hint/error) around a free-text input that
 * suggests matching `items` as the user types. Picking a suggestion fills the text — the value is
 * whatever is typed, not a selection (that's `ComboboxField`). Every `Autocomplete` root prop
 * (`value`, `onValueChange`, `itemToStringValue`, `limit`, ...) passes through.
 */
export function AutocompleteField<Value>({
  label,
  description,
  hint,
  error,
  placeholder,
  emptyMessage,
  size = "lg",
  name,
  disabled,
  required,
  className,
  items,
  ...autocompleteProps
}: AutocompleteFieldProps<Value>) {
  const toText = autocompleteProps.itemToStringValue ?? ((item: Value) => String(item));
  return (
    <Field name={name} disabled={disabled} size={size} label={label} required={required} description={description} hint={hint} error={error} className={className}>
      <Autocomplete<Value> items={items} disabled={disabled} required={required} {...autocompleteProps}>
        <AutocompleteInputGroup size={size} placeholder={placeholder} />
        <AutocompleteContent emptyMessage={emptyMessage}>
          {(item: Value, index: number) => (
            <AutocompleteItem key={typeof item === "object" ? index : String(item)} value={item} size={size}>
              {toText(item)}
            </AutocompleteItem>
          )}
        </AutocompleteContent>
      </Autocomplete>
    </Field>
  );
}

/* __DOC_BLOCK
<div className="flex max-w-md flex-col gap-6 p-4">
  <QUI.AutocompleteField label="Country" placeholder="Start typing…" hint="Pick a suggestion or type your own." items={["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia"]} />
  <QUI.AutocompleteField label="City" required description="Where the office is." placeholder="e.g. Sharjah" items={["Sharjah", "Dubai", "Abu Dhabi"]} error="Enter a city." />
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "required": "boolean", "disabled": "boolean", "openOnInputClick": "boolean" }
PROPS__ */
