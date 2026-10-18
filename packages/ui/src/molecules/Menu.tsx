import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { cn } from "../lib/cn";
import type { NoClass, NoStyle } from "../lib/no-class";
import { nodeSlotClass } from "../lib/node-slot";

/**
 * Raised popup surface: elevation, radius, border, and the pointer-anchored open/close transform.
 * Shared with `ContextMenu` (rule 4a in propel's own terms — chrome that must stay byte-identical
 * across the dropdown and right-click families).
 */
export const menuPopupSurfaceClass = cn(
  "z-50 min-w-(--popup-width-min) rounded-lg border-sm border-subtle bg-layer-1 p-1 shadow-overlay-100 outline-none",
  "origin-(--transform-origin) transition-[opacity,transform] duration-150",
  "data-starting-style:scale-95 data-starting-style:opacity-0",
  "data-ending-style:scale-95 data-ending-style:opacity-0"
);

/** Interactive row chrome shared by every row kind: full-width flex, control-scale type, glyph slot, disabled treatment. */
const menuRowBaseClass = cn(
  "group/item flex h-8 w-full cursor-default items-center gap-(--control-gap-md) rounded-md px-2 text-body-xs-regular outline-none select-none [--node-size:var(--control-glyph-md)]",
  "data-disabled:pointer-events-none data-disabled:text-disabled",
  "data-highlighted:bg-layer-transparent-hover"
);

/** Row look palette: `neutral` the standard hierarchy, `accent` the primary action, `danger` destructive. */
export const menuRowVariants = cva(menuRowBaseClass, {
  variants: {
    variant: {
      neutral: "text-primary",
      accent: "text-accent-primary data-disabled:text-disabled data-highlighted:text-accent-primary",
      danger: "text-danger-primary data-disabled:text-disabled data-highlighted:text-danger-primary",
    },
  },
  defaultVariants: { variant: "neutral" },
});

/** Trailing single-select check gutter — reserves its column even unselected, so a toggle never re-truncates the label. */
const menuItemIndicatorBaseClass = cn(nodeSlotClass, "h-5 w-4 text-icon-secondary [--node-size:1rem]");
/** `MenuItem`'s `selected` prop is plain `data-selected` on a bare `<span>`. */
const menuItemIndicatorClass = cn(menuItemIndicatorBaseClass, "not-data-selected:invisible");
/** `Menu.RadioItemIndicator` stamps `data-checked`/`data-unchecked` on itself instead — same chrome, different state attribute. */
const menuRadioItemCheckClass = cn(menuItemIndicatorBaseClass, "data-unchecked:invisible");

/** Leading control slot of a checkbox/radio row, holding the visual toggle. */
const menuItemControlClass = "flex shrink-0 items-center";

/** Checkbox-row box: the 16px bordered square that fills accent once checked, empty box kept visible while off. */
const menuCheckboxBoxClass = cn(
  nodeSlotClass,
  "inline-flex size-4 shrink-0 items-center justify-center rounded-sm border-sm border-transparent bg-clip-padding [--node-size:0.75rem]",
  "shadow-[inset_0_0_0_1px_var(--border-color-icon-tertiary)]",
  "data-checked:bg-accent-primary data-checked:text-icon-on-color data-checked:shadow-none",
  "data-unchecked:[&>*]:invisible"
);

/** Radio-row ring: the same 16px ring the standalone `Radio` draws, dot hides while unchecked. */
const menuRadioRingClass = cn(
  "flex size-4 shrink-0 items-center justify-center rounded-full border-sm border-transparent bg-clip-padding",
  "shadow-[inset_0_0_0_1px_currentColor] text-icon-tertiary",
  "data-checked:text-icon-accent-primary",
  "data-unchecked:[&>*]:invisible"
);

/** Divider spanning the popup's own horizontal padding. */
const menuSeparatorClass = "-mx-1 my-1 border-t border-subtle";

/** Section heading row above a `MenuGroup`'s items. */
const menuGroupLabelClass = "flex min-h-6 items-center gap-1.5 px-2 text-caption-md-medium text-tertiary";

export interface MenuProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseMenu.Root>> {}

/**
 * The dropdown menu root — Base UI's `Menu.Root` passthrough, providing open state and context to
 * every part below. Renders nothing itself; pair with `MenuTrigger` and `MenuPositioner`/`MenuPopup`
 * (or the bundled `MenuContent`).
 */
export function Menu(props: MenuProps) {
  return <BaseMenu.Root {...props} />;
}

export interface MenuTriggerProps extends NoStyle<React.ComponentPropsWithoutRef<typeof BaseMenu.Trigger>> {}

/**
 * The element that opens the menu. qui ships no trigger chrome of its own — graft the open/close
 * behavior onto any control via `render`, e.g. `<MenuTrigger render={<Button label="Open" />} />`.
 */
export const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>((props, ref) => (
  <BaseMenu.Trigger ref={ref} {...props} />
));
MenuTrigger.displayName = "MenuTrigger";

export interface MenuPositionerProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseMenu.Positioner>> {}

/** Positions the popup against the trigger, portaled to `<body>`. Wraps `MenuPopup` as a child. */
export const MenuPositioner = React.forwardRef<HTMLDivElement, MenuPositionerProps>(
  ({ sideOffset = 6, align = "start", ...props }, ref) => (
    <BaseMenu.Portal>
      <BaseMenu.Positioner ref={ref} sideOffset={sideOffset} align={align} className={cn("z-50 outline-none")} {...props} />
    </BaseMenu.Portal>
  )
);
MenuPositioner.displayName = "MenuPositioner";

export interface MenuPopupProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseMenu.Popup>> {}

/** The raised, elevated panel holding the menu's rows. */
export const MenuPopup = React.forwardRef<HTMLDivElement, MenuPopupProps>(({ ...props }, ref) => (
  <BaseMenu.Popup ref={ref} className={cn(menuPopupSurfaceClass)} {...props} />
));
MenuPopup.displayName = "MenuPopup";

export interface MenuContentProps extends NoClass<MenuPositionerProps> {}

/** Convenience bundle: `MenuPortal` + `MenuPositioner` + `MenuPopup` in one — the common case when the popup needs no extra chrome around it. */
export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(({ children, ...positionerProps }, ref) => (
  <MenuPositioner {...positionerProps}>
    <MenuPopup ref={ref}>
      {children}
    </MenuPopup>
  </MenuPositioner>
));
MenuContent.displayName = "MenuContent";

export interface MenuItemProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseMenu.Item>, "className">>, VariantProps<typeof menuRowVariants> {
  /** Leading icon, e.g. `<Icon icon={Trash} />`. */
  icon?: React.ReactNode;
  /** Trailing content — a shortcut hint, a badge. */
  trailing?: React.ReactNode;
  /** Marks the row as the current single-select choice; renders the trailing check when `true`/`false` is given. */
  selected?: boolean;
}

/** A selectable menu row: icon, label, optional trailing content, and a single-select check gutter. */
export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ variant, icon, trailing, selected, children, ...props }, ref) => (
    <BaseMenu.Item
      ref={ref}
      {...(selected !== undefined ? { role: "menuitemradio", "aria-checked": selected } : {})}
      className={cn(menuRowVariants({ variant }))}
      {...props}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {selected !== undefined ? (
        <span data-selected={selected ? "" : undefined} className={menuItemIndicatorClass}>
          <Check aria-hidden />
        </span>
      ) : null}
      {trailing}
    </BaseMenu.Item>
  )
);
MenuItem.displayName = "MenuItem";

export interface MenuSeparatorProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseMenu.Separator>> {}

/** A divider between groups of rows. */
export const MenuSeparator = React.forwardRef<HTMLDivElement, MenuSeparatorProps>(({ ...props }, ref) => (
  <BaseMenu.Separator ref={ref} className={cn(menuSeparatorClass)} {...props} />
));
MenuSeparator.displayName = "MenuSeparator";

export interface MenuGroupProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseMenu.Group>> {}

/** Groups related rows with their `MenuGroupLabel` heading. Structural only — no styling of its own. */
export const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>((props, ref) => <BaseMenu.Group ref={ref} {...props} />);
MenuGroup.displayName = "MenuGroup";

export interface MenuGroupLabelProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>> {}

/** The non-interactive heading above a `MenuGroup`'s rows. */
export const MenuGroupLabel = React.forwardRef<HTMLDivElement, MenuGroupLabelProps>(({ ...props }, ref) => (
  <BaseMenu.GroupLabel ref={ref} className={cn(menuGroupLabelClass)} {...props} />
));
MenuGroupLabel.displayName = "MenuGroupLabel";

export interface MenuCheckboxItemProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseMenu.CheckboxItem>, "className">>, VariantProps<typeof menuRowVariants> {
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}

/** A toggleable multi-select row: leading checkbox box (kept mounted, empty while unchecked) + label. */
export const MenuCheckboxItem = React.forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
  ({ variant, icon, trailing, children, ...props }, ref) => (
    <BaseMenu.CheckboxItem ref={ref} className={cn(menuRowVariants({ variant }))} {...props}>
      <span className={menuItemControlClass}>
        <BaseMenu.CheckboxItemIndicator keepMounted className={menuCheckboxBoxClass}>
          <Check aria-hidden />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </BaseMenu.CheckboxItem>
  )
);
MenuCheckboxItem.displayName = "MenuCheckboxItem";

export interface MenuRadioGroupProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseMenu.RadioGroup>> {}

/** Wraps a set of `MenuRadioItem` rows, tracking which `value` is currently selected. */
export const MenuRadioGroup = React.forwardRef<HTMLDivElement, MenuRadioGroupProps>((props, ref) => (
  <BaseMenu.RadioGroup ref={ref} {...props} />
));
MenuRadioGroup.displayName = "MenuRadioGroup";

export interface MenuRadioItemProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseMenu.RadioItem>, "className">>, VariantProps<typeof menuRowVariants> {
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  /** `check` (default) marks the selected row with the same trailing tick every single-select row uses; `radio` draws a leading ring instead — use it only when the popup also mixes in a checkbox group and the two kinds of choice need telling apart. */
  marker?: "check" | "radio";
}

/** A single-select row within a `MenuRadioGroup`: marks the current choice with a trailing check (default) or a leading ring. */
export const MenuRadioItem = React.forwardRef<HTMLDivElement, MenuRadioItemProps>(
  ({ variant, icon, trailing, marker = "check", children, ...props }, ref) => (
    <BaseMenu.RadioItem ref={ref} className={cn(menuRowVariants({ variant }))} {...props}>
      {marker === "radio" ? (
        <span className={menuItemControlClass}>
          <BaseMenu.RadioItemIndicator keepMounted className={menuRadioRingClass}>
            <span aria-hidden className="size-2 rounded-full bg-current" />
          </BaseMenu.RadioItemIndicator>
        </span>
      ) : null}
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {marker === "check" ? (
        <BaseMenu.RadioItemIndicator keepMounted className={menuRadioItemCheckClass}>
          <Check aria-hidden />
        </BaseMenu.RadioItemIndicator>
      ) : null}
      {trailing}
    </BaseMenu.RadioItem>
  )
);
MenuRadioItem.displayName = "MenuRadioItem";

/* __DOC_BLOCK
<div className="flex flex-wrap items-start gap-6 p-4">
  <QUI.Menu>
    <QUI.MenuTrigger render={<QUI.Button label="Open menu" />} />
    <QUI.MenuContent>
      <QUI.MenuItem icon={<QUI.Icon icon={Icons.Pencil} />}>Rename</QUI.MenuItem>
      <QUI.MenuItem icon={<QUI.Icon icon={Icons.Copy} />} trailing={<span className="text-caption-md-regular text-tertiary">⌘D</span>}>
        Duplicate
      </QUI.MenuItem>
      <QUI.MenuSeparator />
      <QUI.MenuGroup>
        <QUI.MenuGroupLabel>Danger zone</QUI.MenuGroupLabel>
        <QUI.MenuItem variant="danger" icon={<QUI.Icon icon={Icons.Trash} />}>
          Delete
        </QUI.MenuItem>
      </QUI.MenuGroup>
    </QUI.MenuContent>
  </QUI.Menu>

  <QUI.Menu>
    <QUI.MenuTrigger render={<QUI.Button variant="secondary" label="View options" />} />
    <QUI.MenuContent>
      <QUI.MenuRadioGroup defaultValue="board">
        <QUI.MenuGroupLabel>Show as</QUI.MenuGroupLabel>
        <QUI.MenuRadioItem value="list">List</QUI.MenuRadioItem>
        <QUI.MenuRadioItem value="board">Board</QUI.MenuRadioItem>
        <QUI.MenuRadioItem value="calendar">Calendar</QUI.MenuRadioItem>
      </QUI.MenuRadioGroup>
      <QUI.MenuSeparator />
      <QUI.MenuCheckboxItem defaultChecked>Show sub-issues</QUI.MenuCheckboxItem>
      <QUI.MenuCheckboxItem>Show completed</QUI.MenuCheckboxItem>
    </QUI.MenuContent>
  </QUI.Menu>
</div>
DOC__ */

/* __PROPS
{ "MenuItem.variant": ["neutral", "accent", "danger"], "MenuItem.selected": "boolean", "MenuCheckboxItem.variant": ["neutral", "accent", "danger"], "MenuRadioItem.variant": ["neutral", "accent", "danger"], "MenuRadioItem.marker": ["check", "radio"] }
PROPS__ */
