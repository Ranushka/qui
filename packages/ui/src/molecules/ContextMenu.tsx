import * as React from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import type { VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { cn } from "../lib/cn";
import { menuPopupSurfaceClass, menuRowVariants } from "./Menu";

/**
 * The right-click variant of `Menu` — same list-row chrome (imported from `Menu.tsx`, rule 4a: a
 * dropdown and a right-click menu are the same list opened two ways, so the row/popup classes stay
 * byte-identical rather than duplicated), different trigger (a right-click/long-press surface
 * instead of a button) and different default positioning (anchored to the pointer, not the trigger
 * element). Checkbox/radio rows aren't reproduced here — reach for `Menu`'s if a right-click surface
 * ever needs one; every row kind here still gets the shared `menuRowVariants` look.
 */

/** Trailing single-select check gutter, matching `Menu`'s (kept local: `Menu`'s copy isn't exported, and this is one class). */
const contextMenuItemIndicatorClass = cn(
  "inline-flex h-5 w-4 shrink-0 items-center justify-center text-icon-secondary [--node-size:1rem] [&>svg]:size-(--node-size)",
  "not-data-selected:invisible"
);

export interface ContextMenuProps extends React.ComponentPropsWithoutRef<typeof BaseContextMenu.Root> {}

/**
 * The context-menu root: holds the open state and the pointer position the popup anchors to.
 * Renders nothing itself. Wrap a `ContextMenuTrigger` and `ContextMenuContent` (or
 * `ContextMenuPositioner`/`ContextMenuPopup`) in it — the menu opens on right click or long press
 * anywhere inside the trigger.
 */
export function ContextMenu(props: ContextMenuProps) {
  return <BaseContextMenu.Root {...props} />;
}

export interface ContextMenuTriggerProps extends React.ComponentPropsWithoutRef<typeof BaseContextMenu.Trigger> {}

/** The area that opens the menu on right click or long press. Renders a `<div>` around `children`. */
export const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>((props, ref) => (
  <BaseContextMenu.Trigger ref={ref} {...props} />
));
ContextMenuTrigger.displayName = "ContextMenuTrigger";

export interface ContextMenuPositionerProps extends React.ComponentPropsWithoutRef<typeof BaseContextMenu.Positioner> {}

/** Positions the popup against the pointer (root menus) or the trigger (submenus), portaled to `<body>`. */
export const ContextMenuPositioner = React.forwardRef<HTMLDivElement, ContextMenuPositionerProps>(({ className, ...props }, ref) => (
  <BaseContextMenu.Portal>
    <BaseContextMenu.Positioner ref={ref} className={cn("z-50 outline-none", className)} {...props} />
  </BaseContextMenu.Portal>
));
ContextMenuPositioner.displayName = "ContextMenuPositioner";

export interface ContextMenuPopupProps extends React.ComponentPropsWithoutRef<typeof BaseContextMenu.Popup> {}

/** The raised, elevated panel holding the menu's rows — same surface as `MenuPopup`. */
export const ContextMenuPopup = React.forwardRef<HTMLDivElement, ContextMenuPopupProps>(({ className, ...props }, ref) => (
  <BaseContextMenu.Popup ref={ref} className={cn(menuPopupSurfaceClass, className)} {...props} />
));
ContextMenuPopup.displayName = "ContextMenuPopup";

export interface ContextMenuContentProps extends Omit<ContextMenuPositionerProps, "className">, Pick<ContextMenuPopupProps, "className"> {}

/** Convenience bundle: `ContextMenuPortal` + `ContextMenuPositioner` + `ContextMenuPopup` in one. */
export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(({ children, className, ...positionerProps }, ref) => (
  <ContextMenuPositioner {...positionerProps}>
    <ContextMenuPopup ref={ref} className={className}>
      {children}
    </ContextMenuPopup>
  </ContextMenuPositioner>
));
ContextMenuContent.displayName = "ContextMenuContent";

export interface ContextMenuItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseContextMenu.Item>, "className">,
    VariantProps<typeof menuRowVariants> {
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Marks the row as the current single-select choice; renders the trailing check when `true`/`false` is given. */
  selected?: boolean;
  className?: string;
}

/** A selectable row in the context menu: icon, label, optional trailing content, single-select check gutter. */
export const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ variant, icon, trailing, selected, className, children, ...props }, ref) => (
    <BaseContextMenu.Item
      ref={ref}
      {...(selected !== undefined ? { role: "menuitemradio", "aria-checked": selected } : {})}
      className={cn(menuRowVariants({ variant }), className)}
      {...props}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {selected !== undefined ? (
        <span data-selected={selected ? "" : undefined} className={contextMenuItemIndicatorClass}>
          <Check aria-hidden />
        </span>
      ) : null}
      {trailing}
    </BaseContextMenu.Item>
  )
);
ContextMenuItem.displayName = "ContextMenuItem";

export interface ContextMenuSeparatorProps extends React.ComponentPropsWithoutRef<typeof BaseContextMenu.Separator> {}

/** A divider between groups of rows — same chrome as `MenuSeparator`. */
export const ContextMenuSeparator = React.forwardRef<HTMLDivElement, ContextMenuSeparatorProps>(({ className, ...props }, ref) => (
  <BaseContextMenu.Separator ref={ref} className={cn("-mx-1 my-1 border-t border-subtle", className)} {...props} />
));
ContextMenuSeparator.displayName = "ContextMenuSeparator";

export interface ContextMenuGroupProps extends React.ComponentPropsWithoutRef<typeof BaseContextMenu.Group> {}

/** Groups related rows with their `ContextMenuGroupLabel` heading. Structural only — no styling of its own. */
export const ContextMenuGroup = React.forwardRef<HTMLDivElement, ContextMenuGroupProps>((props, ref) => (
  <BaseContextMenu.Group ref={ref} {...props} />
));
ContextMenuGroup.displayName = "ContextMenuGroup";

export interface ContextMenuGroupLabelProps extends React.ComponentPropsWithoutRef<typeof BaseContextMenu.GroupLabel> {}

/** The non-interactive heading above a `ContextMenuGroup`'s rows — same chrome as `MenuGroupLabel`. */
export const ContextMenuGroupLabel = React.forwardRef<HTMLDivElement, ContextMenuGroupLabelProps>(({ className, ...props }, ref) => (
  <BaseContextMenu.GroupLabel ref={ref} className={cn("flex min-h-6 items-center gap-1.5 px-2 text-caption-md-medium text-tertiary", className)} {...props} />
));
ContextMenuGroupLabel.displayName = "ContextMenuGroupLabel";

/* __DOC_BLOCK
<QUI.ContextMenu>
  <QUI.ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-subtle text-body-xs-regular text-tertiary">
    Right-click this area
  </QUI.ContextMenuTrigger>
  <QUI.ContextMenuContent>
    <QUI.ContextMenuItem icon={<QUI.Icon icon={Icons.Pencil} />}>Rename</QUI.ContextMenuItem>
    <QUI.ContextMenuItem icon={<QUI.Icon icon={Icons.Copy} />} trailing={<span className="text-caption-md-regular text-tertiary">⌘D</span>}>
      Duplicate
    </QUI.ContextMenuItem>
    <QUI.ContextMenuSeparator />
    <QUI.ContextMenuGroup>
      <QUI.ContextMenuGroupLabel>Danger zone</QUI.ContextMenuGroupLabel>
      <QUI.ContextMenuItem variant="danger" icon={<QUI.Icon icon={Icons.Trash} />}>
        Delete
      </QUI.ContextMenuItem>
    </QUI.ContextMenuGroup>
  </QUI.ContextMenuContent>
</QUI.ContextMenu>
DOC__ */

/* __PROPS
{ "ContextMenuItem.variant": ["neutral", "accent", "danger"], "ContextMenuItem.selected": "boolean" }
PROPS__ */
