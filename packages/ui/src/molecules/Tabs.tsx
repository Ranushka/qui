import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

type TabsVariant = "contained" | "underline";
type TabsStretch = "auto" | "full";

/** Shares the set's `variant`/`stretch` from `Tabs` down to `TabsList`/`Tab` without repeating them. */
const TabsVariantContext = React.createContext<TabsVariant>("contained");
const TabsStretchContext = React.createContext<TabsStretch>("auto");

const tabsListVariants = cva("relative max-w-full overscroll-x-contain outline-none", {
  variants: {
    variant: {
      contained: "items-center gap-px rounded-lg bg-layer-3 p-0.5",
      underline: "items-start gap-px px-0.5",
    },
    stretch: {
      auto: "inline-flex",
      full: "flex w-full",
    },
  },
  defaultVariants: { variant: "contained", stretch: "auto" },
});

/** Contained-tab chrome: a pill that lifts off the track when active. Underline tabs are laid out inline in `Tab` below (label row + sliding bar), since their structure diverges too much for one cva. */
const tabVariants = cva(
  "inline-flex h-6 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md border-sm border-transparent px-1.5 text-body-xs-medium text-secondary outline-none transition-colors select-none [--node-size:var(--control-glyph-sm)] not-aria-disabled:not-data-active:hover:bg-layer-transparent-hover not-aria-disabled:not-data-active:active:bg-layer-transparent-active focus-visible:ring-2 focus-visible:ring-accent-strong aria-disabled:cursor-not-allowed aria-disabled:text-disabled data-active:border-subtle-1 data-active:bg-layer-2 data-active:text-primary data-active:shadow-raised-200",
  {
    variants: { stretch: { auto: "", full: "flex-1" } },
    defaultVariants: { stretch: "auto" },
  }
);

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
}

/** A single tab button. Renders contained pill chrome or an underline label + sliding bar, per the set's `variant`. */
export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(({ label, icon, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext);
  const stretch = React.useContext(TabsStretchContext);

  if (variant === "underline") {
    return (
      <BaseTabs.Tab
        ref={ref}
        className={cn(
          "group/tab inline-flex cursor-pointer flex-col items-stretch gap-2 whitespace-nowrap text-body-sm-medium outline-none select-none aria-disabled:cursor-not-allowed aria-disabled:text-disabled",
          stretch === "full" && "flex-1"
        )}
        {...props}
      >
        <span className="flex h-7 items-center justify-center gap-1.5 rounded-md px-2 py-0.5 text-tertiary transition-colors group-aria-disabled/tab:text-disabled group-focus-visible/tab:ring-2 group-focus-visible/tab:ring-inset group-focus-visible/tab:ring-accent-strong group-hover/tab:bg-layer-transparent-hover group-hover/tab:text-secondary group-data-active/tab:bg-layer-transparent-selected group-data-active/tab:text-primary [--node-size:var(--control-glyph-md)]">
          {icon}
          {label}
        </span>
        <span className="flex px-2">
          <span className="h-[3px] w-full rounded-full bg-current text-transparent transition-colors group-hover/tab:text-icon-placeholder group-data-active/tab:text-primary" />
        </span>
      </BaseTabs.Tab>
    );
  }

  return (
    <BaseTabs.Tab ref={ref} className={cn(tabVariants({ stretch }))} {...props}>
      {icon}
      <span className="truncate">{label}</span>
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
      <QUI.Tab value="board" label="Board" icon={<QUI.Icon icon={Icons.Grid} />} />
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
      <QUI.Tab value="activity" label="Activity" />
      <QUI.Tab value="settings" label="Settings" />
    </QUI.TabsList>
    <QUI.TabsPanel value="overview">Overview content.</QUI.TabsPanel>
    <QUI.TabsPanel value="activity">Activity content.</QUI.TabsPanel>
    <QUI.TabsPanel value="settings">Settings content.</QUI.TabsPanel>
  </QUI.Tabs>
</div>
DOC__ */

/* __PROPS
{ "variant": ["contained", "underline"], "stretch": ["auto", "full"], "disabled": "boolean" }
PROPS__ */
