import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import type { IconComponent } from "./data";

/**
 * The "Acme Inc." app chrome shared by the example screens: top bar with the app switcher, sidebar and project
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

const apps: { icon: IconComponent; label: string; current?: boolean }[] = [
  { icon: Icons.SquareStack, label: "Work", current: true },
  { icon: Icons.BookOpen, label: "Wiki" },
  { icon: Icons.Bot, label: "AI" },
  { icon: Icons.Monitor, label: "Desk" },
];

/** The workspace logo, and the app switcher (Work, Wiki, AI, Desk, Settings) as a dropdown under the workspace name. */
function AppSwitcher() {
  return (
    <QUI.Inline gap="1" wrap={false}>
      <QUI.WorkspaceAvatar size="lg" alt="Acme Inc." />
      <QUI.Menu>
        <QUI.MenuTrigger render={<QUI.Button variant="ghost" size="lg" icon={<QUI.Icon icon={Icons.ChevronDown} />} iconPosition="end" label="Acme Inc." />} />
        <QUI.MenuContent align="start">
          <QUI.MenuGroup>
            <QUI.MenuGroupLabel>Apps</QUI.MenuGroupLabel>
            {apps.map((app) => (
              <QUI.MenuItem key={app.label} icon={<QUI.Icon icon={app.icon} />} selected={!!app.current}>
                {app.label}
              </QUI.MenuItem>
            ))}
          </QUI.MenuGroup>
          <QUI.MenuSeparator />
          <QUI.MenuItem icon={<QUI.Icon icon={Icons.Settings} />}>Settings</QUI.MenuItem>
        </QUI.MenuContent>
      </QUI.Menu>
    </QUI.Inline>
  );
}

function TopBar() {
  return (
    <QUI.Inline as="header" justify="between" wrap={false} gap="4" paddingX="3" paddingY="2">
      <QUI.Inline gap="1" wrap={false}>
        <MobileNav />
        <AppSwitcher />
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
    <QUI.NavSidebar
      title="Work"
      endAction={endAction}
      action={<QUI.Button variant="secondary" stretch="full" icon={<QUI.Icon icon={Icons.SquarePen} />} label="New work item" />}
    >
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
    </QUI.NavSidebar>
  );
}

function Sidebar() {
  return (
    <QUI.Box as="aside" width="3xs" border="subtle" borderEdge="end" shrink={false} overflow="auto" hideBelow="lg">
      <SidebarContent />
    </QUI.Box>
  );
}

const projectTabs = [
  { value: "overview", label: "Overview" },
  { value: "work-items", label: "Work items" },
  { value: "cycles", label: "Cycles" },
  { value: "modules", label: "Modules" },
];

function CoreProductHeader() {
  return <QUI.ProjectHeader icon={Icons.Tractor} title="Core product" tabs={projectTabs} value="work-items" />;
}

export const ViewToolbar = QUI.ViewToolbar;

/** Top bar (with the app switcher), sidebar and project header around a screen's content, which fills the rest. */
export function AcmeShell({ children }: { children: React.ReactNode }) {
  return (
    <QUI.Box height="full" background="canvas">
      <QUI.Stack height="full">
        <TopBar />
        <QUI.Inline grow wrap={false} align="stretch" gap="0" paddingX="2" paddingBottom="2">
          <QUI.Box as="section" aria-label="Core product" grow background="surface-1" border="subtle" radius="lg" overflow="hidden">
            <QUI.Inline height="full" wrap={false} align="stretch" gap="0">
              <Sidebar />
              <QUI.Stack grow>
                <CoreProductHeader />
                {children}
              </QUI.Stack>
            </QUI.Inline>
          </QUI.Box>
        </QUI.Inline>
      </QUI.Stack>
    </QUI.Box>
  );
}

