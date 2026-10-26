import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { StableLabel } from "../lib/stable-label";
import type { NoClass } from "../lib/no-class";

type TabsVariant = "contained" | "underline" | "card";
type TabsStretch = "auto" | "full";

/** Shares the set's `variant`/`stretch` from `Tabs` down to `TabsList`/`Tab` without repeating them. */
const TabsVariantContext = React.createContext<TabsVariant>("contained");
const TabsStretchContext = React.createContext<TabsStretch>("auto");

const tabsListVariants = cva("relative max-w-full overscroll-x-contain outline-none", {
  variants: {
    variant: {
      contained: "items-center gap-0.5 rounded-md bg-layer-3 p-0.5",
      // A full-width 1px baseline, drawn as an inset shadow so the active tab's accent bar paints over it.
      underline: "items-stretch gap-5 shadow-[inset_0_-1px_0_0_var(--border-color-subtle)]",
      card: "items-stretch gap-2 overflow-x-auto",
    },
    stretch: {
      auto: "inline-flex",
      full: "flex w-full",
    },
  },
  // The underline row spans its container so the baseline does too; its tabs keep their natural width.
  compoundVariants: [{ variant: "underline", stretch: "auto", class: "flex w-full" }],
  defaultVariants: { variant: "contained", stretch: "auto" },
});

/**
 * Chrome shared by every tab: label type, muted-to-primary text, focus ring, disabled state. The variants add only
 * their own shape — a lifted pill, an accent underline, or a bordered tile.
 */
const tabBase =
  "group/tab cursor-pointer whitespace-nowrap outline-none transition-colors select-none text-tertiary focus-visible:ring-2 focus-visible:ring-accent-strong aria-disabled:cursor-not-allowed aria-disabled:text-disabled not-aria-disabled:hover:text-primary data-active:text-primary";

const tabVariants = cva(tabBase, {
  variants: {
    variant: {
      contained:
        "inline-flex h-6 items-center justify-center gap-1.5 rounded-sm px-2 text-body-xs-medium [--node-size:var(--control-glyph-sm)] data-active:bg-layer-2 data-active:font-semibold data-active:shadow-raised-200",
      underline:
        "relative inline-flex h-9 items-center justify-center gap-1.5 rounded-xs text-body-sm-medium focus-visible:ring-inset [--node-size:var(--control-glyph-md)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent after:transition-colors not-aria-disabled:not-data-active:hover:after:bg-layer-3-hover data-active:font-semibold data-active:after:bg-accent-primary",
      card: "flex min-w-36 max-w-56 shrink-0 flex-col items-start justify-between gap-1.5 rounded-md border-sm border-subtle bg-layer-2 px-3 py-2 text-start text-caption-md-medium [--node-size:var(--control-glyph-sm)] not-aria-disabled:not-data-active:hover:border-strong data-active:border-accent-strong data-active:bg-accent-subtle",
    },
    stretch: { auto: "", full: "flex-1" },
  },
  defaultVariants: { variant: "contained", stretch: "auto" },
});

/** The count next to a tab's label: a small neutral chip that brightens with the tab. */
const countChipClass =
  "inline-flex h-4 min-w-4 items-center justify-center rounded-xs bg-layer-3 px-1 text-caption-sm-medium tabular-nums text-tertiary group-data-active/tab:bg-layer-3-selected group-data-active/tab:text-secondary";

export interface TabsProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseTabs.Root>, "className">> {
  /** Pill-in-a-track chrome, or a flat row with a sliding underline. @default "contained" */
  variant?: TabsVariant;
  /** Whether the tab strip hugs its content or stretches to fill the row. @default "auto" */
  stretch?: TabsStretch;
}

/**
 * Groups a `TabsList` of `Tab`s with their `TabsPanel`s on Base UI's `Tabs.Root` state machine.
 * `variant` and `stretch` are set once here and read by `TabsList`/`Tab` via context.
 */
export function Tabs({ variant = "contained", stretch = "auto", ...props }: TabsProps) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsStretchContext.Provider value={stretch}>
        <BaseTabs.Root className={cn("flex w-full max-w-full flex-col items-start gap-3")} {...props} />
      </TabsStretchContext.Provider>
    </TabsVariantContext.Provider>
  );
}

export interface TabsListProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseTabs.List>> {}

/** The row of `Tab`s. Reads `variant`/`stretch` from the enclosing `Tabs`. */
export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(({ ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext);
  const stretch = React.useContext(TabsStretchContext);
  return <BaseTabs.List ref={ref} className={cn(tabsListVariants({ variant, stretch }))} {...props} />;
});
TabsList.displayName = "TabsList";

export interface TabProps extends NoClass<Omit<React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>, "children">> {
  /** Visible tab label. */
  label: string;
  /** Icon rendered before the label. */
  icon?: React.ReactNode;
  /** A count shown with the label — large under it on `card` tabs, a trailing number on the others. */
  count?: React.ReactNode;
}

/** A single tab button: icon, label and optional count, in the set's `variant` (pill, underline or tile). */
export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(({ label, icon, count, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext);
  const stretch = React.useContext(TabsStretchContext);
  return (
    <BaseTabs.Tab ref={ref} className={cn(tabVariants({ variant, stretch }))} {...props}>
      {variant === "card" ? (
        <>
          <span className="flex min-w-0 items-center gap-1.5">
            {icon}
            <span className="truncate">{label}</span>
          </span>
          {count != null ? <span className="text-h5-semibold tabular-nums text-primary group-aria-disabled/tab:text-disabled">{count}</span> : null}
        </>
      ) : (
        <>
          {icon}
          <StableLabel>{label}</StableLabel>
          {count != null ? <span className={countChipClass}>{count}</span> : null}
        </>
      )}
    </BaseTabs.Tab>
  );
});
Tab.displayName = "Tab";

export interface TabsPanelProps extends NoClass<React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>> {}

/** The content shown for the `Tab` of the matching `value`. */
export const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>(({ ...props }, ref) => (
  <BaseTabs.Panel ref={ref} className={cn("w-full min-w-0 text-body-sm-regular text-secondary outline-none")} {...props} />
));
TabsPanel.displayName = "TabsPanel";

/* __DOC_BLOCK
<div className="flex w-full flex-col gap-8 p-4">
  <QUI.Tabs defaultValue="board">
    <QUI.TabsList>
      <QUI.Tab value="board" label="Board" icon={<QUI.Icon icon={Icons.Grid} />} count={12} />
      <QUI.Tab value="list" label="List" icon={<QUI.Icon icon={Icons.List} />} />
      <QUI.Tab value="timeline" label="Timeline" disabled />
    </QUI.TabsList>
    <QUI.TabsPanel value="board">Board view content.</QUI.TabsPanel>
    <QUI.TabsPanel value="list">List view content.</QUI.TabsPanel>
    <QUI.TabsPanel value="timeline">Timeline view content.</QUI.TabsPanel>
  </QUI.Tabs>
  <QUI.Tabs variant="underline" defaultValue="overview">
    <QUI.TabsList>
      <QUI.Tab value="overview" label="Overview" />
      <QUI.Tab value="activity" label="Activity" count={4} />
      <QUI.Tab value="settings" label="Settings" />
    </QUI.TabsList>
    <QUI.TabsPanel value="overview">Overview content.</QUI.TabsPanel>
    <QUI.TabsPanel value="activity">Activity content.</QUI.TabsPanel>
    <QUI.TabsPanel value="settings">Settings content.</QUI.TabsPanel>
  </QUI.Tabs>
  <QUI.Tabs variant="card" defaultValue="all">
    <QUI.TabsList aria-label="Request types">
      <QUI.Tab value="all" label="All requests" count="13,924" />
      <QUI.Tab value="cards" label="Card and fund requests" count="0" />
      <QUI.Tab value="invoices" label="Invoices and reimbursements" count="12" />
    </QUI.TabsList>
  </QUI.Tabs>
</div>
DOC__ */

/* __PROPS
{ "variant": ["contained", "underline", "card"], "stretch": ["auto", "full"], "disabled": "boolean" }
PROPS__ */
