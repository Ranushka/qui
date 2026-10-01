import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { ChevronDown, Check } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { fieldControlSurfaceVariants } from "../lib/field-control-surface";
import { controlSize } from "../lib/control-group";
import { nodeSlotClass } from "../lib/node-slot";
import { Icon } from "../atoms/Icon";

/** The closed-field trigger: same bordered field surface as `Input`'s frame, plus popup-open chrome. */
const selectTriggerVariants = cva(
  cn(
    fieldControlSurfaceVariants({ focus: "visible" }),
    "group/control flex w-full min-w-40 cursor-default items-center justify-between text-primary outline-none transition-[color,background-color,border-color,box-shadow]",
    "hover:border-strong hover:bg-layer-2-hover",
    "data-popup-open:border-accent-strong data-popup-open:ring-2 data-popup-open:ring-accent-strong/20",
    "data-disabled:cursor-not-allowed data-disabled:border-subtle-1 data-disabled:bg-layer-2 data-disabled:text-disabled data-disabled:hover:border-subtle-1 data-disabled:hover:bg-layer-2"
  ),
  {
    variants: {
      size: {
        md: cn(controlSize.md, "gap-(--control-gap-md) rounded-(--control-radius-md) px-(--field-inset-md)"),
        lg: cn(controlSize.lg, "gap-(--control-gap-lg) rounded-(--control-radius-lg) px-(--field-inset-lg)"),
        xl: cn(controlSize.xl, "gap-(--control-gap-xl) rounded-(--control-radius-xl) px-(--field-inset-xl)"),
        "2xl": cn(controlSize["2xl"], "gap-(--control-gap-2xl) rounded-(--control-radius-2xl) px-(--field-inset-2xl)"),
      },
    },
    defaultVariants: { size: "md" },
  }
);

/** Shared 32px option-row chrome: full-width flex row, highlight fill, disabled treatment. */
const selectItemVariants = cva(
  cn(
    "group/item flex h-8 w-full cursor-default items-center gap-(--control-gap-md) rounded-md px-2 text-body-xs-regular text-primary outline-none select-none [--node-size:var(--control-glyph-md)]",
    "data-disabled:pointer-events-none data-disabled:text-disabled data-highlighted:bg-layer-transparent-hover"
  )
);

const selectListVariants = cva("p-1 outline-none");
const selectPopupVariants = cva(
  cn(
    "max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-md border-sm border-subtle bg-surface-1 p-1 shadow-overlay-100 outline-none",
    "transition-[opacity,transform] duration-150 motion-reduce:transition-none",
    "data-starting-style:scale-95 data-starting-style:opacity-0",
    "data-ending-style:scale-95 data-ending-style:opacity-0"
  )
);

export interface SelectTriggerProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Trigger>, "children">>, VariantProps<typeof selectTriggerVariants> {
  /** Placeholder shown while no value is selected. */
  placeholder?: React.ReactNode;
}

/** The field-look button that opens the select popup — `Select.Value` + a chevron, in the `Input` frame. */
export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ size = "md", placeholder, ...props }, ref) => {
    return (
      <BaseSelect.Trigger ref={ref} className={cn(selectTriggerVariants({ size }))} {...props}>
        <BaseSelect.Value placeholder={placeholder} className="min-w-0 flex-1 truncate text-start data-placeholder:text-placeholder" />
        <BaseSelect.Icon className={nodeSlotClass}>
          <Icon icon={ChevronDown} tint="secondary" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectContentProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Positioner>, "className">> {
  /** Classes for the popup surface itself (border/shadow/radius), distinct from the positioner. */
  popupClassName?: string;
}

/** `Portal` → `Positioner` → styled popup surface, wrapping the option `List`. Side/align/offset live here. */
export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ sideOffset = 4, popupClassName, children, ...props }, ref) => {
    return (
      <BaseSelect.Portal>
        <BaseSelect.Positioner ref={ref} sideOffset={sideOffset} className={cn("z-50 outline-none")} {...props}>
          <BaseSelect.Popup className={cn(selectPopupVariants(), popupClassName)}>
            <BaseSelect.List className={selectListVariants()}>{children}</BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    );
  }
);
SelectContent.displayName = "SelectContent";

export interface SelectItemProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Item>, "className">> {
}

/** A single option row: label text plus a trailing check that shows only while selected. */
export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(({ children, ...props }, ref) => {
  return (
    <BaseSelect.Item ref={ref} className={cn(selectItemVariants())} {...props}>
      <BaseSelect.ItemText className="min-w-0 flex-1 truncate">{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className={cn(nodeSlotClass, "h-5 w-4 text-icon-secondary not-data-selected:invisible")} keepMounted>
        <Check aria-hidden />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
});
SelectItem.displayName = "SelectItem";

/** Groups related items under a `SelectGroupLabel`. */
export const SelectGroup = BaseSelect.Group as React.ForwardRefExoticComponent<
  NoClass<React.ComponentPropsWithoutRef<typeof BaseSelect.Group>> & React.RefAttributes<HTMLDivElement>
>;

/** The label heading a `SelectGroup`. */
export function SelectGroupLabel({ ...props }: NoClass<React.ComponentPropsWithoutRef<typeof BaseSelect.GroupLabel>>) {
  return <BaseSelect.GroupLabel className={cn("px-2 py-1.5 text-caption-md-regular text-tertiary")} {...props} />;
}

/** A horizontal divider between items or groups. */
export function SelectSeparator({ ...props }: NoClass<React.ComponentPropsWithoutRef<typeof BaseSelect.Separator>>) {
  return <BaseSelect.Separator className={cn("-mx-1 my-1 border-t border-subtle")} {...props} />;
}

/** Groups all parts of the select — renders no element of its own. Compose with `SelectTrigger` + `SelectContent`. */
export const Select = BaseSelect.Root;

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <QUI.Select items={[{ label: "Backlog", value: "backlog" }, { label: "In Progress", value: "in-progress" }, { label: "Done", value: "done" }]} defaultValue="backlog">
    <div className="w-56"><QUI.SelectTrigger placeholder="Select a status" /></div>
    <QUI.SelectContent>
      <QUI.SelectGroup>
        <QUI.SelectGroupLabel>Status</QUI.SelectGroupLabel>
        <QUI.SelectItem value="backlog">Backlog</QUI.SelectItem>
        <QUI.SelectItem value="in-progress">In Progress</QUI.SelectItem>
        <QUI.SelectSeparator />
        <QUI.SelectItem value="done">Done</QUI.SelectItem>
      </QUI.SelectGroup>
    </QUI.SelectContent>
  </QUI.Select>
  <QUI.Select disabled>
    <div className="w-56"><QUI.SelectTrigger placeholder="Disabled" /></div>
    <QUI.SelectContent>
      <QUI.SelectItem value="a">Option A</QUI.SelectItem>
    </QUI.SelectContent>
  </QUI.Select>
</div>
DOC__ */

/* __PROPS
{ "size": ["md", "lg", "xl", "2xl"], "disabled": "boolean", "required": "boolean", "readOnly": "boolean", "multiple": "boolean" }
PROPS__ */
