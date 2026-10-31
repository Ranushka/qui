import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Plus } from "../icons";
import { Combobox, ComboboxChips, ComboboxContent, ComboboxInputGroup, ComboboxItem, defaultItemLabel } from "./Combobox";
import { Field } from "./Field";
import { Popover, PopoverContent, PopoverTitle } from "./Popover";
import { Icon } from "../atoms/Icon";
import type { FieldSize } from "../lib/field-parts";

/** What `create.form` gets: the text that was typed, and how to finish. */
export interface ComboboxCreateContext<Value> {
  /** What the person had typed in the field when they chose to add, e.g. a name or email to prefill. */
  query: string;
  /** Picks the new item (added to the picked values when `multiple`) and closes the form. Add it to `items` too. */
  done: (item: Value) => void;
  /** Closes the form without picking anything. */
  cancel: () => void;
}

export interface ComboboxCreate<Value> {
  /** The last row of the list, e.g. `(query) => query ? \`Invite "${query}"\` : "Invite someone"`. @default `Add "query"` */
  label?: (query: string) => React.ReactNode;
  /** Heading of the form's panel. */
  title?: React.ReactNode;
  /** The form, shown in a panel under the field when the row is chosen. Call `done` with the new item, or `cancel`. */
  form: (context: ComboboxCreateContext<Value>) => React.ReactNode;
}

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
  /** Shows a clear ("x") button once something is typed or selected. Single-value fields only. @default true */
  clearable?: boolean;
  /** Size of the control and its label/helper text. @default "lg" */
  size?: FieldSize;
  /**
   * Lets people add what they can't find: a row at the end of the list (always there, so it also stands in for "no
   * results") opens `form` in a panel under the field, prefilled from what they typed. E.g. inviting a user who
   * isn't in the list yet.
   */
  create?: ComboboxCreate<Value>;
};

/** Stands in the list for the "add" row; never reaches `onValueChange`. */
const CREATE_ROW = { __comboboxCreateRow: true } as const;
const isCreateRow = (item: unknown) => item === CREATE_ROW;

/**
 * A ready-made searchable select: `Field` (label, description, hint/error) around a `Combobox` filter input and a
 * popup listing `items`, each row checked while selected. Picks one value by default; `multiple` picks several,
 * shown as removable chips. `create` adds a row that opens a form for something not in the list. Every `Combobox`
 * root prop (`value`, `onValueChange`, `itemToStringLabel`, `filter`, ...) passes through.
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
  create,
  ...comboboxProps
}: ComboboxFieldProps<Value, Multiple>) {
  const { items, value: valueProp, defaultValue, onValueChange, inputValue: inputValueProp, onInputValueChange, filter, itemToStringLabel, multiple, ...rootProps } = comboboxProps;
  const toLabel = (item: unknown) => (itemToStringLabel ? itemToStringLabel(item as Value) : defaultItemLabel(item));

  // Value and input text are kept here too, so a created item can be picked and the typed text handed to the form.
  const [ownValue, setOwnValue] = React.useState<unknown>(defaultValue ?? (multiple ? [] : null));
  const value = valueProp !== undefined ? valueProp : ownValue;
  const [ownInput, setOwnInput] = React.useState("");
  const inputValue = inputValueProp !== undefined ? String(inputValueProp) : ownInput;
  const [formQuery, setFormQuery] = React.useState<string | null>(null);
  const frame = React.useRef<HTMLDivElement>(null);
  // What the person last typed: picking a row clears the input before the pick is reported.
  const typed = React.useRef("");

  const changeValue = (next: unknown, details?: unknown) => {
    if (valueProp === undefined) setOwnValue(next);
    (onValueChange as ((v: unknown, d: unknown) => void) | undefined)?.(next, details);
  };
  const changeInput = (next: string, details?: { reason?: string }) => {
    if (details?.reason === "input-change") typed.current = next;
    if (inputValueProp === undefined) setOwnInput(next);
    (onInputValueChange as ((v: string, d: unknown) => void) | undefined)?.(next, details);
  };

  const listItems = create && items ? [...(items as readonly unknown[]), CREATE_ROW] : items;
  // The add row survives every filter.
  const listFilter = create
    ? (item: unknown, query: string, itemToString?: (item: unknown) => string) =>
        isCreateRow(item) || (filter ? (filter as (i: unknown, q: string, s?: unknown) => boolean)(item, query, itemToString) : toLabel(item).toLocaleLowerCase().includes(query.toLocaleLowerCase()))
    : filter;

  const handleValueChange = (next: unknown, details: unknown) => {
    const picked = Array.isArray(next) ? next.some(isCreateRow) : isCreateRow(next);
    if (!picked) return changeValue(next, details);
    // Choosing the add row opens the form instead of picking it — once the list has closed and handed focus back,
    // so the form's panel isn't dismissed by that.
    const query = typed.current.trim();
    requestAnimationFrame(() => setFormQuery(query));
  };

  const context: ComboboxCreateContext<Value> = {
    query: formQuery ?? "",
    done: (item) => {
      changeValue(multiple ? [...((value as unknown[]) ?? []), item] : item);
      changeInput(multiple ? "" : toLabel(item));
      typed.current = "";
      setFormQuery(null);
    },
    cancel: () => setFormQuery(null),
  };

  return (
    <Field name={name} disabled={disabled} size={size} label={label} required={required} description={description} hint={hint} error={error}>
      <Combobox
        {...(rootProps as object)}
        items={listItems as any}
        multiple={multiple as any}
        value={value as any}
        onValueChange={handleValueChange as any}
        inputValue={inputValue}
        onInputValueChange={changeInput as any}
        filter={listFilter as any}
        itemToStringLabel={((item: unknown) => (isCreateRow(item) ? "" : toLabel(item))) as any}
        // With an add row, Enter on an unmatched search chooses it instead of doing nothing.
        autoHighlight={rootProps.autoHighlight ?? create != null}
        disabled={disabled}
        required={required}
      >
        {multiple ? (
          <ComboboxChips ref={frame} size={size} placeholder={placeholder} itemToLabel={toLabel} />
        ) : (
          <ComboboxInputGroup ref={frame} size={size} placeholder={placeholder} clearable={clearable} />
        )}
        <ComboboxContent emptyMessage={emptyMessage} anchor={frame}>
          {(item: unknown, index: number) =>
            isCreateRow(item) ? (
              <ComboboxItem key="__create" value={item} icon={<Icon icon={Plus} tint="secondary" />}>
                {create?.label ? create.label(inputValue.trim()) : inputValue.trim() ? `Add "${inputValue.trim()}"` : "Add new"}
              </ComboboxItem>
            ) : (
              <ComboboxItem key={typeof item === "object" ? index : String(item)} value={item}>
                {toLabel(item)}
              </ComboboxItem>
            )
          }
        </ComboboxContent>
      </Combobox>
      {create ? (
        <Popover open={formQuery !== null} onOpenChange={(open) => !open && setFormQuery(null)}>
          <PopoverContent anchor={frame} align="start" sideOffset={4}>
            {create.title ? <PopoverTitle>{create.title}</PopoverTitle> : null}
            {formQuery !== null ? create.form(context) : null}
          </PopoverContent>
        </Popover>
      ) : null}
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
