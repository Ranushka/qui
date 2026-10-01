import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Select, SelectContent, SelectGroup, SelectGroupLabel, SelectItem, SelectSeparator, SelectTrigger } from "./Select";
import { Field } from "./Field";
import type { FieldSize } from "../lib/field-parts";

/** One option in the popup. `value` is what it selects; `label` is shown in the row and the trigger. */
export interface SelectFieldOption<Value = string> {
  value: Value;
  label: string;
  disabled?: boolean;
}

/** A labeled group of options. `key` must be unique among the field's entries. */
export interface SelectFieldGroup<Value = string> {
  key: string;
  label: string;
  options: readonly SelectFieldOption<Value>[];
}

/** One entry in `SelectField`'s `options`: an option, a group of options, or a `"separator"` divider. */
export type SelectFieldEntry<Value = string> = SelectFieldOption<Value> | SelectFieldGroup<Value> | "separator";

export type SelectFieldProps<Value = string, Multiple extends boolean | undefined = false> = Omit<
  BaseSelect.Root.Props<Value, Multiple>,
  "children" | "items"
> & {
  /** Visible field label. */
  label: React.ReactNode;
  /** Supporting text shown below the label. Always shown, alongside `hint`/`error`. */
  description?: React.ReactNode;
  /** Helper text shown below the trigger. Replaced by `error` when one is set. */
  hint?: React.ReactNode;
  /** Error text shown below the trigger. Overrides `hint` and marks the field invalid. */
  error?: React.ReactNode;
  /** Trigger text while nothing is selected. */
  placeholder?: React.ReactNode;
  /** Size of the trigger and its label/helper text. @default "lg" */
  size?: FieldSize;
  /**
   * The popup's entries. A `"separator"` draws a divider where it sits; empty groups, separators at
   * either end, and back-to-back separators are dropped, so conditionally built lists never show a
   * bare heading or a stray line. Every option mounts when the popup opens — use `ComboboxField`
   * for long or searchable lists.
   */
  options: readonly SelectFieldEntry<Value>[];
  /** Classes for the field's outer wrapper (layout only — width, margins). */
  className?: string;
};

function isGroup<Value>(entry: SelectFieldOption<Value> | SelectFieldGroup<Value>): entry is SelectFieldGroup<Value> {
  return !("value" in entry) && Array.isArray((entry as SelectFieldGroup<Value>).options);
}

/** Drops empty groups plus leading, trailing and doubled separators. */
function tidyEntries<Value>(options: readonly SelectFieldEntry<Value>[]) {
  const kept = options.filter((entry) => entry === "separator" || !isGroup(entry) || entry.options.length > 0);
  const result: SelectFieldEntry<Value>[] = [];
  for (const entry of kept) {
    if (entry === "separator" && (result.length === 0 || result[result.length - 1] === "separator")) continue;
    result.push(entry);
  }
  while (result[result.length - 1] === "separator") result.pop();
  return result;
}

/**
 * A ready-made select: `Field` (label, description, hint/error) around a `SelectTrigger` and a popup
 * built from a flat `options` list (with optional groups and separators). Selected values show their
 * option `label` in the trigger. Every `Select` root prop (`value`, `onValueChange`, `multiple`, ...)
 * passes through.
 */
export function SelectField<Value = string, Multiple extends boolean | undefined = false>({
  label,
  description,
  hint,
  error,
  placeholder,
  size = "lg",
  options,
  name,
  disabled,
  required,
  className,
  ...selectProps
}: SelectFieldProps<Value, Multiple>) {
  const entries = React.useMemo(() => tidyEntries(options), [options]);
  const items = React.useMemo(
    () => entries.flatMap((entry) => (entry === "separator" ? [] : isGroup(entry) ? entry.options : [entry])).map(({ value, label }) => ({ value, label })),
    [entries]
  );

  const renderOption = (option: SelectFieldOption<Value>, index: number) => (
    <SelectItem key={`option:${typeof option.value === "object" ? index : String(option.value)}`} value={option.value} disabled={option.disabled}>
      {option.label}
    </SelectItem>
  );

  return (
    <Field name={name} disabled={disabled} size={size} label={label} required={required} description={description} hint={hint} error={error} className={className}>
      <Select<Value, Multiple> items={items} disabled={disabled} required={required} {...selectProps}>
        <SelectTrigger size={size} placeholder={placeholder} />
        <SelectContent>
          {entries.map((entry, index) => {
            if (entry === "separator") return <SelectSeparator key={`separator:${index}`} />;
            if (isGroup(entry)) {
              return (
                <SelectGroup key={`group:${entry.key}`}>
                  <SelectGroupLabel>{entry.label}</SelectGroupLabel>
                  {entry.options.map(renderOption)}
                </SelectGroup>
              );
            }
            return renderOption(entry, index);
          })}
        </SelectContent>
      </Select>
    </Field>
  );
}

/* __DOC_BLOCK
<div className="flex max-w-md flex-col gap-6 p-4">
  <QUI.SelectField label="Status" placeholder="Pick a status" hint="Moves the issue across the board." defaultValue="todo" options={[{ value: "backlog", label: "Backlog" }, { value: "todo", label: "Todo" }, "separator", { key: "active", label: "Active", options: [{ value: "in-progress", label: "In Progress" }, { value: "review", label: "In Review" }] }, { value: "done", label: "Done" }]} />
  <QUI.SelectField label="Priority" required placeholder="Select priority" error="Pick a priority." options={[{ value: "urgent", label: "Urgent" }, { value: "high", label: "High" }, { value: "low", label: "Low" }]} />
  <QUI.SelectField label="Assignee" disabled placeholder="Unassigned" options={[{ value: "me", label: "Me" }]} />
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "required": "boolean", "disabled": "boolean", "multiple": "boolean", "readOnly": "boolean" }
PROPS__ */
