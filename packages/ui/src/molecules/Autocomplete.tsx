import * as React from "react";
import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { controlGroupClass, controlSize } from "../lib/control-group";
import { controlInputClass } from "../lib/control-input";

/** The bordered frame wrapping the free-text input — the `Input` frame family, `focus-within` keyed. */
const autocompleteInputGroupVariants = cva(cn(controlGroupClass, "w-full items-center"), {
  variants: {
    size: {
      md: cn(controlSize.md, "gap-(--control-gap-md) rounded-(--control-radius-md) px-(--field-inset-md)"),
      lg: cn(controlSize.lg, "gap-(--control-gap-lg) rounded-(--control-radius-lg) px-(--field-inset-lg)"),
      xl: cn(controlSize.xl, "gap-(--control-gap-xl) rounded-(--control-radius-xl) px-(--field-inset-xl)"),
      "2xl": cn(controlSize["2xl"], "gap-(--control-gap-2xl) rounded-(--control-radius-2xl) px-(--field-inset-2xl)"),
    },
  },
  defaultVariants: { size: "md" },
});

const autocompleteInputVariants = cva(cn(controlInputClass, "flex-1"));

const autocompletePopupVariants = cva(
  cn(
    "max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-md border-sm border-subtle bg-surface-1 p-1 shadow-overlay-100 outline-none",
    "transition-[opacity,transform] duration-150 motion-reduce:transition-none",
    "data-starting-style:scale-95 data-starting-style:opacity-0",
    "data-ending-style:scale-95 data-ending-style:opacity-0"
  )
);

/**
 * The autocomplete family's own option row (no selection marker — a suggestion is inserted into
 * the text, not toggled on/off): a flush flex row with a size axis for height + text size.
 */
const autocompleteItemVariants = cva(
  cn(
    "flex cursor-default items-center rounded-sm px-2 text-primary outline-none",
    "data-highlighted:bg-layer-transparent-hover data-highlighted:text-primary",
    "data-disabled:cursor-not-allowed data-disabled:text-disabled"
  ),
  {
    variants: {
      size: {
        md: "min-h-(--control-height-md) gap-(--control-gap-md) text-body-xs-regular [--node-size:var(--control-glyph-md)]",
        lg: "min-h-(--control-height-lg) gap-(--control-gap-lg) text-body-sm-regular [--node-size:var(--control-glyph-lg)]",
        xl: "min-h-(--control-height-xl) gap-(--control-gap-xl) text-body-sm-regular [--node-size:var(--control-glyph-xl)]",
        "2xl": "min-h-(--control-height-2xl) gap-(--control-gap-2xl) text-body-md-regular [--node-size:var(--control-glyph-2xl)]",
      },
    },
    defaultVariants: { size: "md" },
  }
);

const autocompleteEmptyVariants = cva("text-body-xs-regular text-tertiary not-empty:px-2 not-empty:py-1.5");

export interface AutocompleteInputGroupProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseAutocomplete.InputGroup>, "className">> {
  size?: "md" | "lg" | "xl" | "2xl";
  placeholder?: string;
}

/** The bordered free-text field: `Input` inside the `Input` frame. */
export const AutocompleteInputGroup = React.forwardRef<HTMLDivElement, AutocompleteInputGroupProps>(
  ({ size = "md", placeholder, ...props }, ref) => {
    return (
      <BaseAutocomplete.InputGroup ref={ref} className={cn(autocompleteInputGroupVariants({ size }))} {...props}>
        <BaseAutocomplete.Input placeholder={placeholder} className={autocompleteInputVariants()} />
      </BaseAutocomplete.InputGroup>
    );
  }
);
AutocompleteInputGroup.displayName = "AutocompleteInputGroup";

export interface AutocompleteContentProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseAutocomplete.Positioner>, "className" | "children">> {
  /** Message shown when nothing matches the current text. */
  emptyMessage?: React.ReactNode;
  /** The per-item render function (or static content) forwarded to Base UI's `Autocomplete.List`. */
  children?: React.ReactNode | ((item: any, index: number) => React.ReactNode);
}

/** `Portal` → `Positioner` → styled popup surface, wrapping the suggestion `List` plus an `Empty` state. */
export const AutocompleteContent = React.forwardRef<HTMLDivElement, AutocompleteContentProps>(
  ({ sideOffset = 4, emptyMessage = "No matches.", children, ...props }, ref) => {
    return (
      <BaseAutocomplete.Portal>
        <BaseAutocomplete.Positioner ref={ref} sideOffset={sideOffset} className={cn("z-50 outline-none")} {...props}>
          <BaseAutocomplete.Popup className={cn(autocompletePopupVariants())}>
            <BaseAutocomplete.Empty className={autocompleteEmptyVariants()}>{emptyMessage}</BaseAutocomplete.Empty>
            <BaseAutocomplete.List className="p-1 outline-none">{children}</BaseAutocomplete.List>
          </BaseAutocomplete.Popup>
        </BaseAutocomplete.Positioner>
      </BaseAutocomplete.Portal>
    );
  }
);
AutocompleteContent.displayName = "AutocompleteContent";

export interface AutocompleteItemProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseAutocomplete.Item>, "className">> {
  size?: "md" | "lg" | "xl" | "2xl";
}

/** A single suggestion row — plain text, no selection marker (a pick fills the input, it isn't toggled). */
export const AutocompleteItem = React.forwardRef<HTMLDivElement, AutocompleteItemProps>(({ size = "md", ...props }, ref) => {
  return <BaseAutocomplete.Item ref={ref} className={cn(autocompleteItemVariants({ size }))} {...props} />;
});
AutocompleteItem.displayName = "AutocompleteItem";

/** A horizontal divider between suggestion groups. */
export function AutocompleteSeparator({ ...props }: NoClass<React.ComponentPropsWithoutRef<typeof BaseAutocomplete.Separator>>) {
  return <BaseAutocomplete.Separator className={cn("-mx-1 my-1 border-t border-subtle")} {...props} />;
}

/**
 * Groups all parts of the autocomplete — renders no element of its own. A free-text input that
 * suggests matches as you type; picking one fills the text rather than toggling a selection (that's
 * `Combobox`). Compose with `AutocompleteInputGroup` + `AutocompleteContent`.
 */
export const Autocomplete = BaseAutocomplete.Root;

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <QUI.Autocomplete items={["Afghanistan", "Albania", "Algeria", "Andorra", "Angola"]}>
    <div className="w-64"><QUI.AutocompleteInputGroup placeholder="Search countries…" /></div>
    <QUI.AutocompleteContent>
      {(item) => <QUI.AutocompleteItem key={item} value={item}>{item}</QUI.AutocompleteItem>}
    </QUI.AutocompleteContent>
  </QUI.Autocomplete>
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "disabled": "boolean", "autoHighlight": ["true", "always"], "openOnInputClick": "boolean" }
PROPS__ */
