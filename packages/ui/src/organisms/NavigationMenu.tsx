import * as React from "react";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { nodeSlotClass } from "../lib/node-slot";

/**
 * The raised popup surface, kept in step with `MenuPopup`'s chrome (layer-1 fill, subtle border,
 * overlay shadow, 150ms scale/fade from the transform origin) — only the padding differs, since a
 * navigation panel holds roomier link cards rather than dense rows.
 */
const navigationMenuPopupClass = cn(
  "rounded-lg border-sm border-subtle bg-layer-1 p-2 shadow-overlay-100 outline-none",
  "origin-(--transform-origin) transition-[opacity,transform] duration-150 motion-reduce:transition-none",
  "data-starting-style:scale-95 data-starting-style:opacity-0",
  "data-ending-style:scale-95 data-ending-style:opacity-0"
);

/** Hover / open / focus treatment shared by top-level triggers and links, so the row reads as one strip. */
const navigationMenuInteractiveClass = cn(
  "cursor-pointer rounded-md text-body-sm-medium text-secondary outline-none transition-colors",
  "hover:bg-layer-transparent-hover data-popup-open:bg-layer-transparent-selected",
  "focus-visible:ring-2 focus-visible:ring-accent-strong"
);

const navigationMenuLinkVariants = cva(navigationMenuInteractiveClass, {
  variants: {
    /** `item` is a top-level pill beside the triggers; `card` is a stacked title + description entry inside a panel. */
    appearance: {
      item: "inline-flex h-8 items-center gap-1 px-3",
      card: "flex flex-col gap-0.5 px-3 py-2 text-start",
    },
  },
  defaultVariants: { appearance: "item" },
});

export interface NavigationMenuProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Root>> {}

/**
 * The navigation menu root — Base UI's `NavigationMenu.Root` passthrough. Renders an unstyled
 * `<nav>` (a `<div>` when nested) and owns which item is open. Holds a `NavigationMenuList` plus
 * one shared `NavigationMenuPanel` that every item's content is rendered into.
 */
export const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>((props, ref) => (
  <BaseNavigationMenu.Root ref={ref} {...props} />
));
NavigationMenu.displayName = "NavigationMenu";

export interface NavigationMenuListProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.List>, "className">> {
}

/** The top-level row of `NavigationMenuItem`s, with roving arrow-key focus between them. */
export const NavigationMenuList = React.forwardRef<HTMLUListElement, NavigationMenuListProps>(({ ...props }, ref) => (
  <BaseNavigationMenu.List ref={ref} className={cn("flex items-center gap-1")} {...props} />
));
NavigationMenuList.displayName = "NavigationMenuList";

export interface NavigationMenuItemProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Item>> {}

/** One `<li>` in the list — scopes a `NavigationMenuTrigger` to its `NavigationMenuContent`, or holds a lone `NavigationMenuLink`. Structural only. */
export const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>((props, ref) => (
  <BaseNavigationMenu.Item ref={ref} {...props} />
));
NavigationMenuItem.displayName = "NavigationMenuItem";

export interface NavigationMenuTriggerProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Trigger>, "children" | "className">> {
  /** Visible trigger text. */
  label: React.ReactNode;
  /** Replaces the default chevron caret, which rotates while the item is open. */
  icon?: React.ReactNode;
}

/** Opens its item's content on hover or click. Renders the label plus a disclosure caret that flips while open. */
export const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(({ label, icon, ...props }, ref) => (
  <BaseNavigationMenu.Trigger ref={ref} className={cn("group/trigger inline-flex h-8 items-center gap-1 px-3", navigationMenuInteractiveClass)} {...props}>
    <span className="min-w-0 truncate">{label}</span>
    <BaseNavigationMenu.Icon
      className={cn(
        nodeSlotClass,
        "text-icon-secondary transition-transform duration-150 [--node-size:var(--control-glyph-lg)] group-data-popup-open/trigger:rotate-180 motion-reduce:transition-none"
      )}
    >
      {icon ?? <ChevronDown aria-hidden />}
    </BaseNavigationMenu.Icon>
  </BaseNavigationMenu.Trigger>
));
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export interface NavigationMenuContentProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Content>> {}

/** An item's content — moved into the shared panel's viewport while its item is active. Unstyled; put a `NavigationMenuContentList` of links inside. */
export const NavigationMenuContent = React.forwardRef<HTMLDivElement, NavigationMenuContentProps>((props, ref) => (
  <BaseNavigationMenu.Content ref={ref} {...props} />
));
NavigationMenuContent.displayName = "NavigationMenuContent";

/** Stacks a content panel's `NavigationMenuLink` cards in a fixed-width column. */
export const NavigationMenuContentList = React.forwardRef<HTMLDivElement, NoClass<React.HTMLAttributes<HTMLDivElement>>>(({ ...props }, ref) => (
  <div ref={ref} className={cn("flex w-72 flex-col gap-1")} {...props} />
));
NavigationMenuContentList.displayName = "NavigationMenuContentList";

export interface NavigationMenuPanelProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Positioner>, "className" | "children">>, NoClass<Pick<React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Popup>, "children">> {
}

/**
 * The shared floating surface: `Portal` → `Positioner` (side/align/offset live here) → styled
 * `Popup`. Rendered once per root, after the list; place a `NavigationMenuViewport` inside it so
 * the active item's content has somewhere to render.
 */
export const NavigationMenuPanel = React.forwardRef<HTMLDivElement, NavigationMenuPanelProps>(
  ({ side = "bottom", sideOffset = 4, align = "start", children, ...positionerProps }, ref) => (
    <BaseNavigationMenu.Portal>
      <BaseNavigationMenu.Positioner side={side} sideOffset={sideOffset} align={align} className="z-50 outline-none" {...positionerProps}>
        <BaseNavigationMenu.Popup ref={ref} className={cn(navigationMenuPopupClass)}>
          {children}
        </BaseNavigationMenu.Popup>
      </BaseNavigationMenu.Positioner>
    </BaseNavigationMenu.Portal>
  )
);
NavigationMenuPanel.displayName = "NavigationMenuPanel";

export interface NavigationMenuViewportProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Viewport>, "className">> {
}

/** Hosts the active item's content and animates the panel's size between items via Base UI's `--popup-width`/`--popup-height`. */
export const NavigationMenuViewport = React.forwardRef<HTMLDivElement, NavigationMenuViewportProps>(({ ...props }, ref) => (
  <BaseNavigationMenu.Viewport
    ref={ref}
    className={cn(
      "relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) transition-[width,height] duration-150 motion-reduce:transition-none"
    )}
    {...props}
  />
));
NavigationMenuViewport.displayName = "NavigationMenuViewport";

export interface NavigationMenuLinkProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseNavigationMenu.Link>, "className">>, VariantProps<typeof navigationMenuLinkVariants> {
}

/**
 * A navigable `<a>`. `appearance="item"` (default) is a top-level pill beside the triggers;
 * `appearance="card"` is an entry inside a panel, pairing a `NavigationMenuLinkTitle` with an
 * optional `NavigationMenuLinkDescription`. Mark the current page with `active`.
 */
export const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(({ appearance, ...props }, ref) => (
  <BaseNavigationMenu.Link ref={ref} className={cn(navigationMenuLinkVariants({ appearance }))} {...props} />
));
NavigationMenuLink.displayName = "NavigationMenuLink";

/** A card link's bold lead line. */
export const NavigationMenuLinkTitle = React.forwardRef<HTMLSpanElement, NoClass<React.HTMLAttributes<HTMLSpanElement>>>(({ ...props }, ref) => (
  <span ref={ref} className={cn("block truncate text-body-sm-medium text-primary")} {...props} />
));
NavigationMenuLinkTitle.displayName = "NavigationMenuLinkTitle";

/** A card link's supporting line under its title. */
export const NavigationMenuLinkDescription = React.forwardRef<HTMLSpanElement, NoClass<React.HTMLAttributes<HTMLSpanElement>>>(({ ...props }, ref) => (
  <span ref={ref} className={cn("block text-caption-md-regular text-tertiary")} {...props} />
));
NavigationMenuLinkDescription.displayName = "NavigationMenuLinkDescription";

/* __DOC_BLOCK
<div className="flex w-full p-4">
  <QUI.NavigationMenu>
    <QUI.NavigationMenuList>
      <QUI.NavigationMenuItem>
        <QUI.NavigationMenuTrigger label="Product" />
        <QUI.NavigationMenuContent>
          <QUI.NavigationMenuContentList>
            <QUI.NavigationMenuLink appearance="card" href="#">
              <QUI.NavigationMenuLinkTitle>Work items</QUI.NavigationMenuLinkTitle>
              <QUI.NavigationMenuLinkDescription>Track every task, bug, and feature in one place.</QUI.NavigationMenuLinkDescription>
            </QUI.NavigationMenuLink>
            <QUI.NavigationMenuLink appearance="card" href="#">
              <QUI.NavigationMenuLinkTitle>Cycles</QUI.NavigationMenuLinkTitle>
              <QUI.NavigationMenuLinkDescription>Plan time-boxed sprints and ship on schedule.</QUI.NavigationMenuLinkDescription>
            </QUI.NavigationMenuLink>
          </QUI.NavigationMenuContentList>
        </QUI.NavigationMenuContent>
      </QUI.NavigationMenuItem>
      <QUI.NavigationMenuItem>
        <QUI.NavigationMenuTrigger label="Resources" />
        <QUI.NavigationMenuContent>
          <QUI.NavigationMenuContentList>
            <QUI.NavigationMenuLink appearance="card" href="#">
              <QUI.NavigationMenuLinkTitle>Docs</QUI.NavigationMenuLinkTitle>
              <QUI.NavigationMenuLinkDescription>Guides and API reference.</QUI.NavigationMenuLinkDescription>
            </QUI.NavigationMenuLink>
            <QUI.NavigationMenuLink appearance="card" href="#">
              <QUI.NavigationMenuLinkTitle>Changelog</QUI.NavigationMenuLinkTitle>
            </QUI.NavigationMenuLink>
          </QUI.NavigationMenuContentList>
        </QUI.NavigationMenuContent>
      </QUI.NavigationMenuItem>
      <QUI.NavigationMenuItem>
        <QUI.NavigationMenuLink href="#">Pricing</QUI.NavigationMenuLink>
      </QUI.NavigationMenuItem>
    </QUI.NavigationMenuList>
    <QUI.NavigationMenuPanel>
      <QUI.NavigationMenuViewport />
    </QUI.NavigationMenuPanel>
  </QUI.NavigationMenu>
</div>
DOC__ */

/* __PROPS
{ "NavigationMenuLink.appearance": ["item", "card"], "NavigationMenuLink.active": "boolean", "NavigationMenuPanel.side": ["top", "bottom", "left", "right"], "NavigationMenuPanel.align": ["start", "center", "end"] }
PROPS__ */
