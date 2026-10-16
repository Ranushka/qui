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
        <QUI.DrawerTrigger render={<QUI.IconButton variant="ghost" size="lg" aria-label="Open navigation" icon={<QUI.Icon icon={Icons.Menu} />} />} />
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

const apps: { icon: IconComponent; label: string }[] = [
  { icon: Icons.SquareStack, label: "Work" },
  { icon: Icons.BookOpen, label: "Wiki" },
  { icon: Icons.Bot, label: "AI" },
  { icon: Icons.Monitor, label: "Desk" },
];
type App = (typeof apps)[number];

/** The app the shell is showing; the switcher changes it and the sidebar is titled after it. */
const AppContext = React.createContext<{ app: App; setApp: (app: App) => void }>({ app: apps[0]!, setApp: () => {} });

/** The workspace logo, and the app switcher: the current app's icon and name, opening a dropdown of the apps. */
function AppSwitcher() {
  const { app: current, setApp } = React.useContext(AppContext);
  return (
    <QUI.Inline gap="1" wrap={false}>
      <QUI.WorkspaceAvatar size="lg" alt="Acme Inc." />
      <QUI.Menu>
        <QUI.MenuTrigger
          render={<QUI.Button variant="ghost" size="lg" icon={<QUI.Icon icon={current.icon} />} endIcon={<QUI.Icon icon={Icons.ChevronDown} />} label={current.label} />}
        />
        <QUI.MenuContent align="start">
          <QUI.MenuGroup>
            <QUI.MenuGroupLabel>Apps</QUI.MenuGroupLabel>
            {apps.map((app) => (
              <QUI.MenuItem key={app.label} icon={<QUI.Icon icon={app.icon} />} selected={app === current} onClick={() => setApp(app)}>
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
          size="lg"
          aria-label="Search"
          placeholder="Search Acme Inc."
          startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />}
          endSlot={<QUI.Shortcut keys="⌘K" />}
        />
      </QUI.Box>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Box hideAbove="md">
          <QUI.IconButton variant="ghost" size="lg" aria-label="Search" icon={<QUI.Icon icon={Icons.Search} />} />
        </QUI.Box>
        <QUI.Box hideBelow="sm">
          <QUI.IconButton variant="ghost" size="lg" aria-label="Inbox" icon={<QUI.Icon icon={Icons.Inbox} />} />
        </QUI.Box>
        <QUI.Box hideBelow="sm">
          <QUI.IconButton variant="ghost" size="lg" aria-label="Help" icon={<QUI.Icon icon={Icons.CircleHelp} />} />
        </QUI.Box>
        <QUI.Box hideBelow="md">
          <QUI.Button variant="ghost" size="lg" icon={<QUI.Icon icon={Icons.Sparkles} />} label="AI Assistant" />
        </QUI.Box>
        <QUI.Box hideAbove="md">
          <QUI.IconButton variant="ghost" size="lg" aria-label="AI Assistant" icon={<QUI.Icon icon={Icons.Sparkles} />} />
        </QUI.Box>
        <QUI.Avatar size="lg" alt="Ranu" />
      </QUI.Inline>
    </QUI.Inline>
  );
}

/** Sidebar entries that open another example screen. */
const navHrefs: Record<string, string> = {
  Dashboards: "#/examples/dashboard",
  "Core product": "#/examples/work-items",
};

/** The nav entry the current screen belongs to; the shell sets it and `NavLink` marks it. */
const CurrentNavContext = React.createContext("Core product");

/** A sidebar entry; marked current when it is the shell's `current`, and a link when it has a screen (`href`, or a known one). */
export function NavLink({ icon, label, href = navHrefs[label] }: { icon: IconComponent; label: string; href?: string }) {
  const current = React.useContext(CurrentNavContext) === label ? "page" : undefined;
  return (
    <QUI.ListItem>
      {href ? (
        <QUI.ListItemLink href={href} aria-current={current} startIcon={<QUI.Icon icon={icon} />} label={label} />
      ) : (
        <QUI.ListItemButton aria-current={current} startIcon={<QUI.Icon icon={icon} />} label={label} />
      )}
    </QUI.ListItem>
  );
}

/** The sidebar lists a screen shows instead of the Work navigation; set by the shell's `navigation` prop. */
const NavigationContext = React.createContext<React.ReactNode>(null);

/** Sidebar navigation; shown docked from lg up and in the ☰ drawer below that, where `endAction` is its close button. */
function SidebarContent({ endAction }: { endAction?: React.ReactNode }) {
  const { app } = React.useContext(AppContext);
  const navigation = React.useContext(NavigationContext);
  return (
    <QUI.NavSidebar title={app.label} endAction={endAction}>
      {navigation ?? <WorkNavigation />}
    </QUI.NavSidebar>
  );
}

function WorkNavigation() {
  return (
    <>
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
          <NavLink icon={Icons.Tractor} label="Core product" />
          <NavLink icon={Icons.Puzzle} label="Wed Development" />
          <NavLink icon={Icons.Rocket} label="Plane Pro" />
          <NavLink icon={Icons.Compass} label="Discover" />
          <NavLink icon={Icons.Ellipsis} label="More" />
        </QUI.List>
      </QUI.ListSection>
    </>
  );
}

function Sidebar() {
  return (
    <QUI.Box as="aside" width="3xs" shrink={false} overflow="auto" hideBelow="lg">
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

/**
 * Top bar (with the app switcher), sidebar and a header around a screen's content, which fills the rest. `current`
 * is the sidebar entry to mark and names the content region; `header` defaults to the Core product project header;
 * `navigation` replaces the sidebar's Work lists.
 */
export function AcmeShell({
  current = "Core product",
  header = <CoreProductHeader />,
  navigation,
  children,
}: {
  current?: string;
  header?: React.ReactNode;
  /** Sidebar lists to show instead of the Work navigation, e.g. an admin tree of `ListSection`s. */
  navigation?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [app, setApp] = React.useState<App>(apps[0]!);
  return (
    <AppContext.Provider value={{ app, setApp }}>
      <CurrentNavContext.Provider value={current}>
        <NavigationContext.Provider value={navigation}>
          <QUI.Box height="full" background="canvas">
            <QUI.Stack height="full">
              <TopBar />
              <QUI.Inline grow wrap={false} align="stretch" gap="0" paddingX="2" paddingBottom="2">
                <Sidebar />
                <QUI.Box as="section" aria-label={current} grow background="surface-1" border="subtle" radius="lg" overflow="hidden">
                  <QUI.Stack height="full">
                    {header}
                    {children}
                  </QUI.Stack>
                </QUI.Box>
              </QUI.Inline>
            </QUI.Stack>
          </QUI.Box>
        </NavigationContext.Provider>
      </CurrentNavContext.Provider>
    </AppContext.Provider>
  );
}

