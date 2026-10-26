import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import type { IconComponent } from "./data";
import { adminHref, adminMainItems, adminSections } from "./admin-nav";

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

/** The playground's other screens, so you can hop between the samples and back to the components without the side panel. */
const playgroundLinks: { icon: IconComponent; label: string; href: string }[] = [
  { icon: Icons.ListTodo, label: "Work items", href: "#/examples/work-items" },
  { icon: Icons.Columns3, label: "Board", href: "#/examples/board" },
  { icon: Icons.LayoutGrid, label: "Dashboard", href: "#/examples/dashboard" },
  { icon: Icons.Bot, label: "AI chat", href: "#/examples/ai-chat" },
  { icon: Icons.Table, label: "Tables", href: "#/examples/tables" },
];

/** Which sample the URL is in: `#/examples/tables/cards` belongs to Tables. */
const inSample = (href: string) => window.location.hash === href || window.location.hash.startsWith(`${href}/`);

/** The workspace logo, and the app switcher: the current app's icon and name, opening a dropdown of the apps and the playground's screens. */
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
          <QUI.MenuSeparator />
          <QUI.MenuGroup>
            <QUI.MenuGroupLabel>Playground</QUI.MenuGroupLabel>
            {playgroundLinks.map((link) => (
              <QUI.MenuItem key={link.href} icon={<QUI.Icon icon={link.icon} />} selected={inSample(link.href)} onClick={() => (window.location.hash = link.href)}>
                {link.label}
              </QUI.MenuItem>
            ))}
            <QUI.MenuItem icon={<QUI.Icon icon={Icons.Component} />} selected={false} onClick={() => (window.location.hash = "#/components")}>
              Components
            </QUI.MenuItem>
          </QUI.MenuGroup>
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

type NavEntry = { icon: IconComponent; label: string; href?: string };

/** The entries above the sections. */
const mainEntries: NavEntry[] = [
  { icon: Icons.House, label: "Home" },
  { icon: Icons.UserRound, label: "Your work" },
  { icon: Icons.Bot, label: "AI chat", href: "#/examples/ai-chat" },
  ...adminMainItems.map((i) => ({ icon: i.icon, label: i.label, href: adminHref(i) })),
];

/** The Work sections: every entry opens a screen — a sample where there is one, an empty one otherwise. */
export const workSections: { label: string; items: NavEntry[] }[] = [
  {
    label: "Workspace",
    items: [
      { icon: Icons.BriefcaseBusiness, label: "Projects" },
      { icon: Icons.Lightbulb, label: "Initiatives" },
      { icon: Icons.ChartNoAxesCombined, label: "Analytics" },
      { icon: Icons.LayoutGrid, label: "Dashboards" },
      { icon: Icons.PenLine, label: "Drafts" },
      { icon: Icons.Layers, label: "Views" },
      { icon: Icons.Ellipsis, label: "More" },
    ],
  },
  {
    label: "Projects",
    items: [
      { icon: Icons.Tractor, label: "Core product" },
      { icon: Icons.Puzzle, label: "Wed Development" },
      { icon: Icons.Rocket, label: "Plane Pro" },
      { icon: Icons.Compass, label: "Discover" },
      { icon: Icons.Ellipsis, label: "All projects" },
    ],
  },
];

/** Every Work entry, for looking one up by its URL slug. */
export const workEntries: NavEntry[] = [...mainEntries.filter((e) => !e.href), ...workSections.flatMap((s) => s.items)];

/** A Work entry's URL slug, e.g. "Your work" → "your-work". */
export const workSlug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Work entries with a sample screen of their own; the rest open `#/examples/work/<slug>`. */
const navHrefs: Record<string, string> = {
  Dashboards: "#/examples/dashboard",
  Views: "#/examples/board",
  "Core product": "#/examples/work-items",
};

/** The nav entry the current screen belongs to; the shell sets it and `NavLink` marks it. */
const CurrentNavContext = React.createContext("Core product");

/** A sidebar entry: a link to its screen (`href`, or the Work one), marked current when it is the shell's `current`. */
export function NavLink({ icon, label, href = navHrefs[label] ?? `#/examples/work/${workSlug(label)}` }: { icon: IconComponent; label: string; href?: string }) {
  const current = React.useContext(CurrentNavContext) === label ? "page" : undefined;
  return (
    <QUI.ListItem>
      <QUI.ListItemLink href={href} aria-current={current} startIcon={<QUI.Icon icon={icon} />} label={label} />
    </QUI.ListItem>
  );
}

/** Extra sidebar lists for one screen, e.g. AI chat's history; set by the shell's `navigation` prop. */
const NavigationContext = React.createContext<React.ReactNode>(null);

/** Sidebar navigation; shown docked from lg up and in the ☰ drawer below that, where `endAction` is its close button. */
function SidebarContent({ endAction }: { endAction?: React.ReactNode }) {
  const { app } = React.useContext(AppContext);
  const navigation = React.useContext(NavigationContext);
  return (
    <QUI.NavSidebar title={app.label} endAction={endAction}>
      <AcmeNavigation extra={navigation} />
    </QUI.NavSidebar>
  );
}

/**
 * The one sidebar every example shares: the main entries, the screen's own lists (`extra`), then the Work and admin
 * sections. The section holding the current entry starts open; when none does, the Work sections do.
 */
function AcmeNavigation({ extra }: { extra?: React.ReactNode }) {
  const current = React.useContext(CurrentNavContext);
  const sections = [
    ...workSections,
    ...adminSections.map((section) => ({ label: section.label, items: section.items.map((i) => ({ icon: i.icon, label: i.label, href: adminHref(i) })) })),
  ];
  const holder = sections.find((section) => section.items.some((i) => i.label === current));
  return (
    <>
      <QUI.List aria-label="Main">
        {mainEntries.map((i) => (
          <NavLink key={i.label} icon={i.icon} label={i.label} href={i.href} />
        ))}
      </QUI.List>
      {extra}
      {sections.map((section) => (
        <QUI.ListSection key={section.label} label={section.label} defaultOpen={holder ? holder === section : workSections.includes(section as never)}>
          <QUI.List aria-label={section.label}>
            {section.items.map((i) => (
              <NavLink key={i.label} icon={i.icon} label={i.label} href={i.href} />
            ))}
          </QUI.List>
        </QUI.ListSection>
      ))}
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
 * `navigation` adds lists of the screen's own to the shared sidebar.
 */
export function AcmeShell({
  current = "Core product",
  header = <CoreProductHeader />,
  navigation,
  panel = true,
  children,
}: {
  current?: string;
  header?: React.ReactNode;
  /** Lists of this screen's own, shown in the shared sidebar under its main entries, e.g. AI chat's history. */
  navigation?: React.ReactNode;
  /**
   * Frames the header and content in a white panel. Turn it off for screens of cards, e.g. dashboards, so the cards
   * sit straight on the shell's canvas instead of on a second surface.
   */
  panel?: boolean;
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
                <QUI.Box as="section" aria-label={current} grow overflow="hidden" {...(panel ? { background: "surface-1", border: "subtle", radius: "lg" } as const : {})}>
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

