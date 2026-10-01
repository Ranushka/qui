import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import { DisclosureIndicator, collapsiblePanelClass } from "../lib/disclosure";

/** Marks the elements a `List` roves between (row primaries and opted-in sibling controls). */
const ROVING_ATTR = "data-list-roving-item";
const ROOT_ATTR = "data-list-root";

const listVariants = cva("flex w-full flex-col", {
  variants: { gap: { px: "gap-px", "0.5": "gap-0.5" } },
  defaultVariants: { gap: "0.5" },
});

const listItemVariants = cva(
  cn(
    "group/list-item relative flex h-8 w-full items-center gap-2 rounded-lg pr-2 [--node-size:var(--control-glyph-lg)]",
    "text-secondary transition-colors hover:bg-layer-transparent-hover active:bg-layer-transparent-active",
    "has-[[aria-current=page]]:bg-layer-transparent-selected has-[[aria-current=page]]:text-primary",
    "has-[[data-list-item-primary]:focus-visible]:ring-2 has-[[data-list-item-primary]:focus-visible]:ring-accent-strong"
  ),
  {
    variants: {
      level: { 1: "pl-2", 2: "pl-4", 3: "pl-6", 4: "pl-8", 5: "pl-10" },
      density: { comfortable: "text-body-sm-medium active:text-primary", compact: "text-body-xs-medium" },
    },
    defaultVariants: { level: 1, density: "comfortable" },
  }
);

/** A row's primary: fills the row, and its `::after` stretches the hit area over the whole box. No own outline — `ListItem` rings it. */
const listItemPrimaryClass =
  "relative flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-start outline-none after:absolute after:inset-0 disabled:cursor-not-allowed";

const listItemDisclosureTriggerClass = cn(
  "group relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm outline-none [--node-size:var(--control-glyph-xs)]",
  "before:absolute before:-inset-0.5 before:content-['']",
  "focus-visible:ring-2 focus-visible:ring-accent-strong disabled:cursor-not-allowed data-disabled:cursor-not-allowed"
);

const listSectionTriggerClass = cn(
  "group flex w-full items-center justify-between gap-1 rounded-md px-2 py-1 [--node-size:var(--control-glyph-md)]",
  "text-body-xs-semibold text-tertiary transition-colors cursor-pointer outline-none hover:text-secondary",
  "focus-visible:ring-2 focus-visible:ring-accent-strong disabled:cursor-not-allowed data-disabled:cursor-not-allowed"
);

function isNavigable(el: HTMLElement) {
  return !(el as HTMLButtonElement).disabled && el.getAttribute("aria-disabled") !== "true" && !el.closest("[hidden],[inert]");
}

export interface ListProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof listVariants> {
  /** Whether arrow keys wrap from the last row to the first (and back). @default true */
  loopFocus?: boolean;
}

/**
 * A vertical roving-tabindex list — the primitive sidebars compose. The whole list is one tab
 * stop (the current page's row, else the last focused, else the first); `ArrowUp`/`ArrowDown`
 * move between row primaries (`ListItemLink`/`ListItemButton`) and `ListItemDisclosureTrigger`s in
 * document order, `Home`/`End` jump to the ends. A nested `List` is its own tab stop. Role-flexible:
 * pass the `role`/`aria-*` the context calls for. `gap` sets row spacing.
 */
export const List = React.forwardRef<HTMLDivElement, ListProps>(({ gap, loopFocus = true, className, onKeyDown, onFocus, ...props }, ref) => {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const activeRef = React.useRef<HTMLElement | null>(null);

  const setRoot = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  /** This list's own items (not a nested list's), in document order. */
  const getItems = React.useCallback(() => {
    const root = rootRef.current;
    if (!root) return [];
    return Array.from(root.querySelectorAll<HTMLElement>(`[${ROVING_ATTR}]`)).filter((el) => el.parentElement?.closest(`[${ROOT_ATTR}]`) === root);
  }, []);

  const syncTabStops = React.useCallback(() => {
    const items = getItems();
    const navigable = items.filter(isNavigable);
    const active =
      (activeRef.current && navigable.includes(activeRef.current) ? activeRef.current : null) ??
      navigable.find((el) => el.getAttribute("aria-current") === "page") ??
      navigable[0];
    for (const item of items) item.tabIndex = item === active ? 0 : -1;
  }, [getItems]);

  React.useLayoutEffect(() => {
    syncTabStops();
  });

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(syncTabStops);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "disabled", "aria-current", "aria-disabled"] });
    return () => observer.disconnect();
  }, [syncTabStops]);

  return (
    <div
      ref={setRoot}
      {...{ [ROOT_ATTR]: "" }}
      className={cn(listVariants({ gap }), className)}
      onFocus={(event) => {
        const target = event.target as HTMLElement;
        if (target.hasAttribute(ROVING_ATTR) && target.parentElement?.closest(`[${ROOT_ATTR}]`) === rootRef.current) {
          activeRef.current = target;
          syncTabStops();
        }
        onFocus?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const items = getItems().filter(isNavigable);
        const current = items.indexOf(event.target as HTMLElement);
        if (current === -1) return;
        let next: number;
        if (event.key === "ArrowDown") next = current + 1 >= items.length ? (loopFocus ? 0 : current) : current + 1;
        else if (event.key === "ArrowUp") next = current - 1 < 0 ? (loopFocus ? items.length - 1 : current) : current - 1;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = items.length - 1;
        else return;
        event.preventDefault();
        event.stopPropagation();
        items[next]?.focus();
      }}
      {...props}
    />
  );
});
List.displayName = "List";

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof listItemVariants> {}

/**
 * A row wrapper carrying the row chrome (hover/pressed fill, current-page fill, focus ring for its
 * primary). Holds one `ListItemLink`/`ListItemButton` plus optional sibling controls. `level`
 * (1–5) indents nested rows; `density` sets the label/counter text scale.
 */
export const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(({ level, density, className, ...props }, ref) => (
  <div ref={ref} className={cn(listItemVariants({ level, density }), className)} {...props} />
));
ListItem.displayName = "ListItem";

/** The row label — fills the remaining width and truncates. */
export const ListItemLabel = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("min-w-0 flex-1 truncate", className)} {...props} />
));
ListItemLabel.displayName = "ListItemLabel";

/** A trailing count chip (e.g. unread items). Inherits the row's density type; color stays pinned. */
export const ListItemCounter = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("flex shrink-0 items-center justify-center rounded-sm bg-layer-3 px-0.5 leading-none text-label-grey-text", className)}
    {...props}
  />
));
ListItemCounter.displayName = "ListItemCounter";

interface ListItemContentProps {
  /** Leading visual, e.g. `<Icon icon={Inbox} />`. */
  startIcon?: React.ReactNode;
  /** Visible row text. */
  label: React.ReactNode;
  /** Trailing count chip; hidden for `0`, `""` and nullish. */
  count?: React.ReactNode;
  /** Trailing visual. */
  endIcon?: React.ReactNode;
}

function ListItemContent({ startIcon, label, count, endIcon }: ListItemContentProps) {
  const showCount = count != null && count !== 0 && count !== "";
  return (
    <>
      {startIcon}
      <ListItemLabel>{label}</ListItemLabel>
      {showCount ? <ListItemCounter>{count}</ListItemCounter> : null}
      {endIcon}
    </>
  );
}

export interface ListItemLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children">, ListItemContentProps {}

/**
 * A row's primary navigation target — an `<a>` in the list's roving order. Mark the current page
 * with `aria-current="page"`. Keep sibling controls (`ListItemDisclosureTrigger`) outside it.
 */
export const ListItemLink = React.forwardRef<HTMLAnchorElement, ListItemLinkProps>(({ startIcon, label, count, endIcon, className, ...props }, ref) => (
  <a ref={ref} {...{ [ROVING_ATTR]: "", "data-list-item-primary": "" }} className={cn(listItemPrimaryClass, className)} {...props}>
    <ListItemContent startIcon={startIcon} label={label} count={count} endIcon={endIcon} />
  </a>
));
ListItemLink.displayName = "ListItemLink";

export interface ListItemButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">, ListItemContentProps {}

/** A row's primary action — a `<button>` in the list's roving order. Keep sibling controls outside it. */
export const ListItemButton = React.forwardRef<HTMLButtonElement, ListItemButtonProps>(
  ({ startIcon, label, count, endIcon, type = "button", className, ...props }, ref) => (
    <button ref={ref} type={type} {...{ [ROVING_ATTR]: "", "data-list-item-primary": "" }} className={cn(listItemPrimaryClass, className)} {...props}>
      <ListItemContent startIcon={startIcon} label={label} count={count} endIcon={endIcon} />
    </button>
  )
);
ListItemButton.displayName = "ListItemButton";

export interface ListItemDisclosureTriggerProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseCollapsible.Trigger>, "children"> {}

/**
 * A row's expand/collapse caret — Base UI's `Collapsible.Trigger`, joined to the list's roving
 * order. Place it as a sibling of the row's primary inside a `ListItem`, all inside a
 * `CollapsibleRoot` that also wraps a `CollapsiblePanel` holding the nested `List`. Give it an
 * `aria-label`.
 */
export const ListItemDisclosureTrigger = React.forwardRef<HTMLButtonElement, ListItemDisclosureTriggerProps>(({ className, ...props }, ref) => (
  <BaseCollapsible.Trigger ref={ref} {...{ [ROVING_ATTR]: "" }} className={cn(listItemDisclosureTriggerClass, className)} {...props}>
    <DisclosureIndicator />
  </BaseCollapsible.Trigger>
));
ListItemDisclosureTrigger.displayName = "ListItemDisclosureTrigger";

/** A static, non-interactive heading naming a group of rows (settings-style sidebars). */
export const ListSectionHeading = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-7 w-full items-center px-2 py-1 text-body-xs-semibold text-tertiary", className)} {...props} />
));
ListSectionHeading.displayName = "ListSectionHeading";

export interface ListSectionProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseCollapsible.Root>, "children"> {
  /** The section heading text. */
  label: React.ReactNode;
  /** Shows the chevron at the heading's inline-end. @default true */
  indicator?: boolean;
  /** The section body — typically a `List` of rows. */
  children?: React.ReactNode;
}

/**
 * A collapsible list section: a muted heading that toggles its body, with the chevron at the
 * inline-end (pointing inline-end while collapsed, down when open). Drive it with `defaultOpen`
 * or `open` + `onOpenChange`.
 */
export const ListSection = React.forwardRef<HTMLDivElement, ListSectionProps>(({ label, indicator = true, className, children, ...props }, ref) => (
  <BaseCollapsible.Root ref={ref} className={cn("w-full", className)} {...props}>
    <BaseCollapsible.Trigger className={listSectionTriggerClass}>
      {label}
      {indicator ? <DisclosureIndicator /> : null}
    </BaseCollapsible.Trigger>
    <BaseCollapsible.Panel className={collapsiblePanelClass}>
      <div className="pt-2">{children}</div>
    </BaseCollapsible.Panel>
  </BaseCollapsible.Root>
));
ListSection.displayName = "ListSection";

/* __DOC_BLOCK
<div className="flex w-full flex-wrap gap-8 p-4">
  <div className="w-60">
    <QUI.List aria-label="Workspace">
      <QUI.ListItem>
        <QUI.ListItemLink href="#" aria-current="page" startIcon={<QUI.Icon icon={Icons.House} />} label="Home" />
      </QUI.ListItem>
      <QUI.ListItem>
        <QUI.ListItemLink href="#" startIcon={<QUI.Icon icon={Icons.Inbox} />} label="Inbox" count={12} />
      </QUI.ListItem>
      <QUI.ListItem>
        <QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.Search} />} label="Search" />
      </QUI.ListItem>
      <QUI.CollapsibleRoot defaultOpen>
        <QUI.ListItem>
          <QUI.ListItemLink href="#" startIcon={<QUI.Icon icon={Icons.Folder} />} label="Projects" />
          <QUI.ListItemDisclosureTrigger aria-label="Toggle projects" />
        </QUI.ListItem>
        <QUI.CollapsiblePanel>
          <QUI.List aria-label="Projects">
            <QUI.ListItem level={2}>
              <QUI.ListItemLink href="#" label="Website" />
            </QUI.ListItem>
            <QUI.ListItem level={2}>
              <QUI.ListItemLink href="#" label="Mobile app" count={3} />
            </QUI.ListItem>
          </QUI.List>
        </QUI.CollapsiblePanel>
      </QUI.CollapsibleRoot>
    </QUI.List>
  </div>
  <div className="w-60">
    <QUI.ListSection label="Favorites" defaultOpen>
      <QUI.List aria-label="Favorites" gap="px">
        <QUI.ListItem density="compact">
          <QUI.ListItemLink href="#" startIcon={<QUI.Icon icon={Icons.Star} />} label="Roadmap" />
        </QUI.ListItem>
        <QUI.ListItem density="compact">
          <QUI.ListItemLink href="#" startIcon={<QUI.Icon icon={Icons.Star} />} label="Bugs" count={4} />
        </QUI.ListItem>
      </QUI.List>
    </QUI.ListSection>
    <QUI.ListSectionHeading>Settings</QUI.ListSectionHeading>
    <QUI.List aria-label="Settings">
      <QUI.ListItem>
        <QUI.ListItemLink href="#" label="General" />
      </QUI.ListItem>
      <QUI.ListItem>
        <QUI.ListItemLink href="#" label="Members" />
      </QUI.ListItem>
    </QUI.List>
  </div>
</div>
DOC__ */

/* __PROPS
{ "List.gap": ["px", "0.5"], "List.loopFocus": "boolean", "ListItem.level": ["1", "2", "3", "4", "5"], "ListItem.density": ["comfortable", "compact"], "ListSection.indicator": "boolean" }
PROPS__ */
