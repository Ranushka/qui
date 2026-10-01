import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { DisclosureIndicator, collapsiblePanelClass, disclosureTriggerClass } from "../lib/disclosure";

type CollapsiblePlacement = "inline" | "sidebar";

/** The header row: holds the trigger and an optional trailing-action sibling. */
const collapsibleHeaderVariants = cva("w-full", {
  variants: {
    placement: {
      inline: "flex",
      sidebar:
        "grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-1 rounded-lg px-2 hover:bg-layer-transparent-hover has-[>[data-disabled]]:hover:bg-transparent",
    },
  },
  defaultVariants: { placement: "inline" },
});

const collapsibleTriggerVariants = cva(cn(disclosureTriggerClass, "min-w-0 flex-1 bg-layer-transparent [--node-size:var(--control-glyph-lg)]"), {
  variants: {
    placement: {
      inline: "px-3 py-2",
      sidebar:
        "col-span-3 col-start-1 row-start-1 grid h-8 grid-cols-subgrid gap-x-1 p-0 [&>[data-slot=disclosure-indicator]]:col-start-3 [&>[data-slot=disclosure-indicator]]:[--node-size:var(--control-glyph-sm)]",
    },
  },
  defaultVariants: { placement: "inline" },
});

/** The label packs beside the icon and caret (`[icon][title][chevron]`) rather than growing to push the caret trail-end. */
const collapsibleTitleVariants = cva("min-w-0 text-start", {
  variants: {
    placement: {
      inline: "",
      sidebar: "col-start-1 flex min-w-0 items-center gap-2 overflow-hidden text-body-xs-semibold text-tertiary [&>*]:truncate",
    },
  },
  defaultVariants: { placement: "inline" },
});

const collapsibleTrailingVariants = cva("flex shrink-0 items-center gap-2", {
  variants: {
    placement: {
      inline: "pe-3",
      sidebar: "relative col-start-2 row-start-1",
    },
  },
  defaultVariants: { placement: "inline" },
});

export interface CollapsibleProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseCollapsible.Root>, "children">> {
  /** The toggle button's label. */
  trigger: React.ReactNode;
  /** Leading glyph in the trigger, e.g. `<Icon icon={Folder} />`. */
  icon?: React.ReactNode;
  /** A header-end control (typically an `IconButton`), rendered as a sibling of — never inside — the trigger button. */
  trailing?: React.ReactNode;
  /** Shows the rotating chevron after the label. @default true */
  indicator?: boolean;
  /** `inline` is a content disclosure; `sidebar` is a compact muted section heading for navigation rails. @default "inline" */
  placement?: CollapsiblePlacement;
  /** Drops the body's own inset — for content that brings its own padding (rows, tables). @default false */
  hug?: boolean;
  /** Keeps the panel mounted (and `hidden`) while closed. */
  keepMounted?: boolean;
  /** Lets the browser's find-in-page reveal text in a closed panel (`hidden="until-found"`). */
  hiddenUntilFound?: boolean;
  /** The collapsible body. */
  children?: React.ReactNode;
}

/**
 * A single show/hide disclosure on Base UI's `Collapsible` — the one-section sibling of `Accordion`.
 * Pass `trigger` for the label and `children` for the body; drive it with `defaultOpen` or
 * `open` + `onOpenChange`. The chevron points inline-end while closed and turns down when open.
 */
export const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  (
    { trigger, icon, trailing, indicator = true, placement = "inline", hug = false, keepMounted, hiddenUntilFound, children, ...props },
    ref
  ) => (
    <BaseCollapsible.Root ref={ref} className={cn("w-full")} {...props}>
      <div className={collapsibleHeaderVariants({ placement })}>
        <BaseCollapsible.Trigger className={collapsibleTriggerVariants({ placement })}>
          {placement === "inline" ? icon : null}
          <span className={collapsibleTitleVariants({ placement })}>
            {placement === "sidebar" ? icon : null}
            {trigger}
          </span>
          {indicator ? <DisclosureIndicator /> : null}
        </BaseCollapsible.Trigger>
        {trailing != null ? <div className={collapsibleTrailingVariants({ placement })}>{trailing}</div> : null}
      </div>
      <BaseCollapsible.Panel keepMounted={keepMounted} hiddenUntilFound={hiddenUntilFound} className={collapsiblePanelClass}>
        <div className={cn("text-body-xs-regular text-secondary", placement === "inline" && !hug && "px-3 pb-3")}>{children}</div>
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  )
);
Collapsible.displayName = "Collapsible";

export interface CollapsibleRootProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseCollapsible.Root>> {}

/**
 * Bare Base UI `Collapsible.Root` (a full-width `<div>`) for composing your own disclosure — e.g. a
 * `ListItem` with a `ListItemDisclosureTrigger` above a `CollapsiblePanel` holding a nested `List`.
 */
export const CollapsibleRoot = React.forwardRef<HTMLDivElement, CollapsibleRootProps>(({ ...props }, ref) => (
  <BaseCollapsible.Root ref={ref} className={cn("w-full")} {...props} />
));
CollapsibleRoot.displayName = "CollapsibleRoot";

export interface CollapsiblePanelProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseCollapsible.Panel>> {}

/** The height-animating panel on its own, with no inset or typography — pair with `CollapsibleRoot`. */
export const CollapsiblePanel = React.forwardRef<HTMLDivElement, CollapsiblePanelProps>(({ ...props }, ref) => (
  <BaseCollapsible.Panel ref={ref} className={cn(collapsiblePanelClass)} {...props} />
));
CollapsiblePanel.displayName = "CollapsiblePanel";

/* __DOC_BLOCK
<div className="flex w-full flex-col gap-4 p-4">
  <QUI.Collapsible defaultOpen trigger="Description" icon={<QUI.Icon icon={Icons.FileText} tint="secondary" />}>
    Collapsibles hide supporting detail until it's asked for.
  </QUI.Collapsible>
  <QUI.Collapsible
    trigger="Attachments"
    trailing={<QUI.IconButton variant="ghost" size="sm" aria-label="Add attachment" icon={<QUI.Icon icon={Icons.Plus} />} />}
  >
    No attachments yet.
  </QUI.Collapsible>
  <div className="w-60">
    <QUI.Collapsible defaultOpen placement="sidebar" trigger="Favorites">
      <div className="px-2 py-1 text-body-xs-regular text-secondary">Pinned projects go here.</div>
    </QUI.Collapsible>
  </div>
</div>
DOC__ */

/* __PROPS
{ "placement": ["inline", "sidebar"], "indicator": "boolean", "hug": "boolean", "defaultOpen": "boolean", "disabled": "boolean", "keepMounted": "boolean" }
PROPS__ */
