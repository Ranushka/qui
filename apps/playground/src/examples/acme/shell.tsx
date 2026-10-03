import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import type { IconComponent } from "./data";

/**
 * The "Acme Inc." app chrome shared by the example screens: top bar, app rail, sidebar and project
 * header. Built only from qui components — no className or style.
 */

/** ☰ button (below lg) that slides the sidebar in from the start edge. */
function MobileNav() {
  return (
    <QUI.Box hideAbove="lg">
      <QUI.Drawer>
        <QUI.DrawerTrigger render={<QUI.IconButton variant="ghost" aria-label="Open navigation" icon={<QUI.Icon icon={Icons.Menu} />} />} />
        <QUI.DrawerContent side="start" hideClose aria-label="Navigation">
          <QUI.Box grow overflow="auto">
            <SidebarContent
              endAction={<QUI.DrawerClose render={<QUI.IconButton variant="ghost" size="sm" aria-label="Close navigation" icon={<QUI.Icon icon={Icons.X} />} />} />}
            />
          </QUI.Box>
        </QUI.DrawerContent>
      </QUI.Drawer>
    </QUI.Box>
  );
}

function TopBar() {
  return (
    <QUI.Inline as="header" justify="between" wrap={false} gap="4" paddingX="3" paddingY="2">
      <QUI.Inline gap="1" wrap={false}>
        <MobileNav />
        <QUI.Button variant="ghost" icon={<QUI.WorkspaceAvatar size="xs" alt="Acme Inc." />} label="Acme Inc." />
      </QUI.Inline>
      <QUI.Box width="md" hideBelow="md">
        <QUI.Input
          aria-label="Search"
          placeholder="Search Acme Inc."
          startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />}
          endSlot={<QUI.Shortcut keys="⌘K" />}
        />
      </QUI.Box>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Box hideAbove="md">
          <QUI.IconButton variant="ghost" aria-label="Search" icon={<QUI.Icon icon={Icons.Search} />} />
        </QUI.Box>
        <QUI.Box hideBelow="sm">
          <QUI.IconButton variant="ghost" aria-label="Inbox" icon={<QUI.Icon icon={Icons.Inbox} />} />
        </QUI.Box>
        <QUI.Box hideBelow="sm">
          <QUI.IconButton variant="ghost" aria-label="Help" icon={<QUI.Icon icon={Icons.CircleHelp} />} />
        </QUI.Box>
        <QUI.Box hideBelow="md">
          <QUI.Button variant="ghost" icon={<QUI.Icon icon={Icons.Sparkles} />} label="AI Assistant" />
        </QUI.Box>
        <QUI.Box hideAbove="md">
          <QUI.IconButton variant="ghost" aria-label="AI Assistant" icon={<QUI.Icon icon={Icons.Sparkles} />} />
        </QUI.Box>
        <QUI.Avatar size="md" alt="Ranu" />
      </QUI.Inline>
    </QUI.Inline>
  );
}

function RailItem({ icon, label, current }: { icon: IconComponent; label: string; current?: boolean }) {
  return (
    <QUI.Stack as="li" align="center" gap="1">
      <QUI.IconButton variant={current ? "secondary" : "ghost"} aria-label={label} showTooltip={false} icon={<QUI.Icon icon={icon} />} />
      <QUI.Text variant="caption" size="sm" color={current ? "primary" : "secondary"}>{label}</QUI.Text>
    </QUI.Stack>
  );
}

function Rail() {
  return (
    <QUI.Stack as="nav" aria-label="Apps" paddingX="2" paddingY="3" shrink={false} hideBelow="md">
      <QUI.Stack as="ul" gap="4">
        <RailItem icon={Icons.SquareStack} label="Work" current />
        <RailItem icon={Icons.BookOpen} label="Wiki" />
        <RailItem icon={Icons.Bot} label="AI" />
        <RailItem icon={Icons.Monitor} label="Desk" />
        <RailItem icon={Icons.Settings} label="Settings" />
      </QUI.Stack>
    </QUI.Stack>
  );
}

function NavLink({ icon, label, current }: { icon: IconComponent; label: string; current?: boolean }) {
  return (
    <QUI.ListItem>
      <QUI.ListItemButton aria-current={current ? "page" : undefined} startIcon={<QUI.Icon icon={icon} />} label={label} />
    </QUI.ListItem>
  );
}

/** Sidebar navigation; shown docked from lg up and in the ☰ drawer below that, where `endAction` is its close button. */
function SidebarContent({ endAction }: { endAction?: React.ReactNode }) {
  return (
    <QUI.Stack gap="4" padding="3">
      <QUI.Inline justify="between" wrap={false} paddingStart="2">
        <QUI.Heading level={2} size={5}>Work</QUI.Heading>
        <QUI.Inline gap="1" wrap={false}>
          <QUI.IconButton variant="ghost" size="sm" aria-label="Customize" icon={<QUI.Icon icon={Icons.SlidersHorizontal} />} />
          {endAction ?? <QUI.IconButton variant="ghost" size="sm" aria-label="Collapse sidebar" icon={<QUI.Icon icon={Icons.PanelLeft} />} />}
        </QUI.Inline>
      </QUI.Inline>
      <QUI.Button variant="secondary" stretch="full" icon={<QUI.Icon icon={Icons.SquarePen} />} label="New work item" />
      <QUI.List aria-label="Main">
        <NavLink icon={Icons.House} label="Home" />
        <NavLink icon={Icons.UserRound} label="Your work" />
      </QUI.List>
      <QUI.ListSection label="Workspace" defaultOpen>
        <QUI.List aria-label="Workspace">
          <NavLink icon={Icons.BriefcaseBusiness} label="Projects" />
          <NavLink icon={Icons.Lightbulb} label="Initiatives" />
          <NavLink icon={Icons.ChartNoAxesCombined} label="Analytics" />
          <NavLink icon={Icons.LayoutGrid} label="Dashboards" />
          <NavLink icon={Icons.PenLine} label="Drafts" />
          <NavLink icon={Icons.Layers} label="Views" />
          <NavLink icon={Icons.Ellipsis} label="More" />
        </QUI.List>
      </QUI.ListSection>
      <QUI.ListSection label="Projects" defaultOpen>
        <QUI.List aria-label="Projects">
          <NavLink icon={Icons.Tractor} label="Core product" current />
          <NavLink icon={Icons.Puzzle} label="Wed Development" />
          <NavLink icon={Icons.Rocket} label="Plane Pro" />
          <NavLink icon={Icons.Compass} label="Discover" />
          <NavLink icon={Icons.Ellipsis} label="More" />
        </QUI.List>
      </QUI.ListSection>
    </QUI.Stack>
  );
}

function Sidebar() {
  return (
    <QUI.Box as="aside" width="3xs" border="subtle" borderEdge="end" shrink={false} overflow="auto" hideBelow="lg">
      <SidebarContent />
    </QUI.Box>
  );
}

function ProjectHeader() {
  return (
    <QUI.Box as="header" border="subtle" borderEdge="bottom" paddingX="4" paddingY="2">
      <QUI.Inline justify="between" align="start" wrap={false} gap="4">
        <QUI.Inline grow gap="6" wrap={false} stackBelow="md">
          <QUI.Inline gap="2" wrap={false} shrink={false}>
            <QUI.Icon icon={Icons.Tractor} size="lg" />
            <QUI.Heading level={1} size={5}>Core product</QUI.Heading>
          </QUI.Inline>
          <QUI.Box overflow="auto">
            <QUI.Tabs variant="underline" defaultValue="work-items">
              <QUI.TabsList>
                <QUI.Tab value="overview" label="Overview" />
                <QUI.Tab value="work-items" label="Work items" />
                <QUI.Tab value="cycles" label="Cycles" />
                <QUI.Tab value="modules" label="Modules" />
              </QUI.TabsList>
            </QUI.Tabs>
          </QUI.Box>
          <QUI.Box hideBelow="md" shrink={false}>
            <QUI.IconButton variant="ghost" size="sm" aria-label="More tabs" icon={<QUI.Icon icon={Icons.Ellipsis} />} />
          </QUI.Box>
        </QUI.Inline>
        <QUI.Inline gap="2" wrap={false} shrink={false}>
          <QUI.Box hideBelow="sm">
            <QUI.IconButton variant="ghost" aria-label="Copy link" icon={<QUI.Icon icon={Icons.Link} />} />
          </QUI.Box>
          <QUI.IconButton variant="ghost" aria-label="Project actions" icon={<QUI.Icon icon={Icons.Ellipsis} />} />
        </QUI.Inline>
      </QUI.Inline>
    </QUI.Box>
  );
}

export type ViewLayout = "list" | "board";

const layoutIcon: Record<ViewLayout, IconComponent> = { list: Icons.List, board: Icons.Kanban };
const layoutLabel: Record<ViewLayout, string> = { list: "List", board: "Board" };

/** "Work items" count plus view controls. Static UI: each layout is its own example page, so the menu only shows the current one. */
export function ViewToolbar({ layout, count }: { layout: ViewLayout; count: number }) {
  return (
    <QUI.Inline justify="between" wrap={false} gap="4" paddingX="4" paddingY="3">
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Icon icon={Icons.SquareStack} size="md" tint="secondary" />
        <QUI.Text size="md" weight="medium">Work items</QUI.Text>
        <QUI.Badge size="sm" variant="brand" label={count} />
      </QUI.Inline>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Menu>
          <QUI.MenuTrigger
            render={<QUI.Button variant="secondary" icon={<QUI.Icon icon={layoutIcon[layout]} />} label={layoutLabel[layout]} />}
          />
          <QUI.MenuContent>
            <QUI.MenuRadioGroup defaultValue={layout}>
              <QUI.MenuGroupLabel>Show as</QUI.MenuGroupLabel>
              <QUI.MenuRadioItem value="list">List</QUI.MenuRadioItem>
              <QUI.MenuRadioItem value="board">Board</QUI.MenuRadioItem>
            </QUI.MenuRadioGroup>
          </QUI.MenuContent>
        </QUI.Menu>
        <QUI.IconButton variant="secondary" aria-label="Filters" icon={<QUI.Icon icon={Icons.ListFilter} />} />
        <QUI.Box hideBelow="sm">
          <QUI.IconButton variant="secondary" aria-label="Display" icon={<QUI.Icon icon={Icons.SlidersHorizontal} />} />
        </QUI.Box>
        <QUI.Box hideBelow="sm">
          <QUI.IconButton variant="secondary" aria-label="Analytics" icon={<QUI.Icon icon={Icons.ChartColumn} />} />
        </QUI.Box>
        <QUI.Box hideBelow="sm">
          <QUI.Button label="Add work item" />
        </QUI.Box>
        <QUI.Box hideAbove="sm">
          <QUI.IconButton aria-label="Add work item" icon={<QUI.Icon icon={Icons.Plus} />} />
        </QUI.Box>
      </QUI.Inline>
    </QUI.Inline>
  );
}

/** Top bar, rail, sidebar and project header around a screen's content, which fills the rest. */
export function AcmeShell({ children }: { children: React.ReactNode }) {
  return (
    <QUI.Box height="full" background="canvas">
      <QUI.Stack height="full">
        <TopBar />
        <QUI.Inline grow wrap={false} align="stretch" gap="0" paddingEnd="2" paddingBottom="2">
          <Rail />
          <QUI.Box as="section" aria-label="Core product" grow background="surface-1" border="subtle" radius="lg" overflow="hidden">
            <QUI.Inline height="full" wrap={false} align="stretch" gap="0">
              <Sidebar />
              <QUI.Stack grow>
                <ProjectHeader />
                {children}
              </QUI.Stack>
            </QUI.Inline>
          </QUI.Box>
        </QUI.Inline>
      </QUI.Stack>
    </QUI.Box>
  );
}

