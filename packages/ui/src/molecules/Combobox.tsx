import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { ChevronDown, X, Check } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { controlGroupClass, controlSize } from "../lib/control-group";
import { controlInputClass } from "../lib/control-input";
import { nodeSlotClass } from "../lib/node-slot";
import { Icon } from "../atoms/Icon";

/** The bordered frame wrapping the filter input — the `Input` frame family, `focus-within` keyed. */
const comboboxInputGroupVariants = cva(cn(controlGroupClass, "w-full items-center has-[button]:pr-1"), {
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

const comboboxInputVariants = cva(cn(controlInputClass, "flex-1"));

/** Shared 32px option-row chrome, matching `Select`'s item look. */
const comboboxItemVariants = cva(
  cn(
    "group/item flex h-8 w-full cursor-default items-center gap-(--control-gap-md) rounded-md px-2 text-body-xs-regular text-primary outline-none select-none [--node-size:var(--control-glyph-md)]",
    "data-disabled:pointer-events-none data-disabled:text-disabled data-highlighted:bg-layer-transparent-hover"
  )
);

const comboboxPopupVariants = cva(
  cn(
    "max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-md border-sm border-subtle bg-surface-1 p-1 shadow-overlay-100 outline-none",
    "transition-[opacity,transform] duration-150 motion-reduce:transition-none",
    "data-starting-style:scale-95 data-starting-style:opacity-0",
    "data-ending-style:scale-95 data-ending-style:opacity-0"
  )
);

const comboboxListVariants = cva("p-1 outline-none");

/** The "no matches" live region — kept mounted, padded only while it holds content. */
const comboboxEmptyVariants = cva("text-body-xs-regular text-tertiary not-empty:px-2 not-empty:py-1.5");

export interface ComboboxInputGroupProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseCombobox.InputGroup>, "className">> {
  size?: "md" | "lg" | "xl" | "2xl";
  /** Placeholder shown in the filter input. */
  placeholder?: string;
  /** Shows a clear ("x") button once a value is typed/selected. */
  clearable?: boolean;
}

/** The bordered field: filter `Input` + an optional `Clear` button + a chevron `Icon`, in the `Input` frame. */
export const ComboboxInputGroup = React.forwardRef<HTMLDivElement, ComboboxInputGroupProps>(
  ({ size = "md", placeholder, clearable = true, ...props }, ref) => {
    return (
      <BaseCombobox.InputGroup ref={ref} className={cn(comboboxInputGroupVariants({ size }))} {...props}>
        <BaseCombobox.Input placeholder={placeholder} className={comboboxInputVariants()} />
        {clearable ? (
          <BaseCombobox.Clear className="shrink-0 [&>*:not([data-visible])]:invisible">
            <Icon icon={X} tint="secondary" />
          </BaseCombobox.Clear>
        ) : null}
        <BaseCombobox.Icon className={nodeSlotClass}>
          <Icon icon={ChevronDown} tint="secondary" />
        </BaseCombobox.Icon>
      </BaseCombobox.InputGroup>
    );
  }
);
ComboboxInputGroup.displayName = "ComboboxInputGroup";

export interface ComboboxContentProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseCombobox.Positioner>, "className" | "children">> {
  popupClassName?: string;
  /** Message shown when nothing matches the current filter. */
  emptyMessage?: React.ReactNode;
  /** The per-item render function (or static content) forwarded to Base UI's `Combobox.List`. */
  children?: React.ReactNode | ((item: any, index: number) => React.ReactNode);
}

/** `Portal` → `Positioner` → styled popup surface, wrapping the filtered `List` plus an `Empty` state. */
export const ComboboxContent = React.forwardRef<HTMLDivElement, ComboboxContentProps>(
  ({ sideOffset = 4, popupClassName, emptyMessage = "No results found.", children, ...props }, ref) => {
    return (
      <BaseCombobox.Portal>
        <BaseCombobox.Positioner ref={ref} sideOffset={sideOffset} className={cn("z-50 outline-none")} {...props}>
          <BaseCombobox.Popup className={cn(comboboxPopupVariants(), popupClassName)}>
            <BaseCombobox.Empty className={comboboxEmptyVariants()}>{emptyMessage}</BaseCombobox.Empty>
            <BaseCombobox.List className={comboboxListVariants()}>{children}</BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    );
  }
);
ComboboxContent.displayName = "ComboboxContent";

export interface ComboboxItemProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseCombobox.Item>, "className">> {
}

/** A single option row: label text plus a trailing check that shows only while selected. */
export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(({ children, ...props }, ref) => {
  return (
    <BaseCombobox.Item ref={ref} className={cn(comboboxItemVariants())} {...props}>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <BaseCombobox.ItemIndicator className={cn(nodeSlotClass, "h-5 w-4 text-icon-secondary not-data-selected:invisible")} keepMounted>
        <Check aria-hidden />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
});
ComboboxItem.displayName = "ComboboxItem";

/** Groups related items under a `ComboboxGroupLabel`. */
export const ComboboxGroup = BaseCombobox.Group as React.ForwardRefExoticComponent<
  NoClass<React.ComponentPropsWithoutRef<typeof BaseCombobox.Group>> & React.RefAttributes<HTMLDivElement>
>;

/** The label heading a `ComboboxGroup`. */
export function ComboboxGroupLabel({ ...props }: NoClass<React.ComponentPropsWithoutRef<typeof BaseCombobox.GroupLabel>>) {
  return <BaseCombobox.GroupLabel className={cn("px-2 py-1.5 text-caption-md-regular text-tertiary")} {...props} />;
}

/** A horizontal divider between items or groups. */
export function ComboboxSeparator({ ...props }: NoClass<React.ComponentPropsWithoutRef<typeof BaseCombobox.Separator>>) {
  return <BaseCombobox.Separator className={cn("-mx-1 my-1 border-t border-subtle")} {...props} />;
}

/**
 * Groups all parts of the combobox — renders no element of its own. Compose with
 * `ComboboxInputGroup` (the filter field) + `ComboboxContent` (the filtered dropdown).
 */
export const Combobox = BaseCombobox.Root;

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <QUI.Combobox items={["Apple", "Banana", "Cherry", "Date", "Elderberry"]} defaultValue="Banana">
    <div className="w-64"><QUI.ComboboxInputGroup placeholder="Search fruit…" /></div>
    <QUI.ComboboxContent>
      {(item) => <QUI.ComboboxItem key={item} value={item}>{item}</QUI.ComboboxItem>}
    </QUI.ComboboxContent>
  </QUI.Combobox>
  <QUI.Combobox items={["Apple", "Banana", "Cherry"]} multiple defaultValue={["Apple"]}>
    <div className="w-64"><QUI.ComboboxInputGroup placeholder="Search fruit…" /></div>
    <QUI.ComboboxContent>
      {(item) => <QUI.ComboboxItem key={item} value={item}>{item}</QUI.ComboboxItem>}
    </QUI.ComboboxContent>
  </QUI.Combobox>
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "clearable": "boolean", "disabled": "boolean", "multiple": "boolean", "autoHighlight": "boolean" }
PROPS__ */
