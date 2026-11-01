import * as React from "react";
import * as QUI from "@qui/ui";
import { Icons } from "@qui/ui";
import type { IconComponent } from "./data";

/**
 * The "Acme Inc." app chrome shared by the example screens: top bar with the workspace switcher, the current app's
 * sidebar and a header. Built only from qui components — no className or style.
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
              endAction={<QUI.DrawerClose render={<QUI.IconButton variant="ghost" aria-label="Close navigation" icon={<QUI.Icon icon={Icons.X} />} />} />}
            />
          </QUI.Box>
        </QUI.DrawerContent>
      </QUI.Drawer>
    </QUI.Box>
  );
}

type NavEntry = { icon: IconComponent; label: string; href: string };
type App = {
  icon: IconComponent;
  label: string;
  /** Where the switcher opens the app. */
  href: string;
  entries: NavEntry[];
  sections: { label: string; items: NavEntry[] }[];
  /** Screens of the app with no sidebar entry of their own, e.g. AI chat, whose sidebar is its history. */
  screens?: string[];
};

const spendHref = (slug: string) => `#/examples/tables/${slug}`;

/**
 * The apps the switcher moves between, each with its own sidebar. Every entry opens a screen of its own; the shell
 * shows the app whose sidebar holds the current entry.
 */
const apps: App[] = [
  {
    icon: Icons.SquareStack,
    label: "Work",
    href: "#/examples/work-items",
    entries: [
      { icon: Icons.LayoutGrid, label: "Dashboard", href: "#/examples/dashboard" },
      { icon: Icons.ListTodo, label: "Work items", href: "#/examples/work-items" },
      { icon: Icons.Columns3, label: "Board", href: "#/examples/board" },
    ],
    sections: [],
  },
  {
    icon: Icons.Wallet,
    label: "Spend",
    href: spendHref("spend-overview"),
    entries: [
      { icon: Icons.ChartPie, label: "Overview", href: spendHref("spend-overview") },
      { icon: Icons.ReceiptText, label: "Transactions", href: spendHref("transactions") },
      { icon: Icons.CreditCard, label: "Cards", href: spendHref("cards") },
      { icon: Icons.PiggyBank, label: "Budgets", href: spendHref("budgets") },
      { icon: Icons.FileText, label: "Bills", href: spendHref("bills") },
      { icon: Icons.HandCoins, label: "Reimbursements", href: spendHref("reimbursements") },
      { icon: Icons.Plane, label: "Travel", href: spendHref("travel") },
      { icon: Icons.UserRound, label: "My spend", href: spendHref("my-spend") },
    ],
    sections: [
      {
        label: "Admin",
        items: [
          { icon: Icons.ShieldCheck, label: "Policies", href: spendHref("policies") },
          { icon: Icons.ListChecks, label: "Approval requests", href: spendHref("approval-requests") },
          { icon: Icons.CircleDollarSign, label: "USD account", href: spendHref("usd-account-summary") },
          { icon: Icons.WalletCards, label: "Balance logs", href: "#/examples/tables" },
          { icon: Icons.History, label: "Activity log", href: spendHref("activity-log") },
        ],
      },
    ],
  },
  {
    icon: Icons.Sparkles,
    label: "AI",
    href: "#/examples/ai-chat",
    entries: [],
    sections: [],
    screens: ["AI chat"],
  },
];

const appScreens = (app: App) => [...app.entries, ...app.sections.flatMap((s) => s.items)].map((e) => e.label).concat(app.screens ?? []);

/** The sidebar entry the current screen belongs to; the shell sets it, `NavLink` marks it and it picks the app. */
const CurrentNavContext = React.createContext("Work items");

function useCurrentApp() {
  const current = React.useContext(CurrentNavContext);
  return apps.find((app) => appScreens(app).includes(current)) ?? apps[0]!;
}

const workspaces = ["Acme Inc.", "Big Events"];

/**
 * The workspace switcher: the workspace's logo and name on one button (filled on hover and while open), opening
 * settings, the workspaces, the apps and the way back to the components.
 */
function AppSwitcher() {
  const current = useCurrentApp();
  const [workspace, setWorkspace] = React.useState(workspaces[0]!);
  return (
    <QUI.Box width="3xs">
      <QUI.Menu>
        <QUI.MenuTrigger
          render={
            <QUI.Button
              variant="ghost"
              size="lg"
              stretch="full"
              icon={<QUI.WorkspaceAvatar size="sm" alt={workspace} />}
              endIcon={<QUI.Icon icon={Icons.ChevronDown} size="sm" />}
              label={workspace}
            />
          }
        />
        <QUI.MenuContent align="start">
          <QUI.MenuItem icon={<QUI.Icon icon={Icons.Settings} />}>Settings</QUI.MenuItem>
          <QUI.MenuSeparator />
          {workspaces.map((name) => (
            <QUI.MenuItem key={name} icon={<QUI.WorkspaceAvatar size="xs" alt={name} />} selected={name === workspace} onClick={() => setWorkspace(name)}>
              {name}
            </QUI.MenuItem>
          ))}
          <QUI.MenuItem icon={<QUI.Icon icon={Icons.Plus} />}>New workspace…</QUI.MenuItem>
          <QUI.MenuSeparator />
          <QUI.MenuGroup>
            <QUI.MenuGroupLabel>Apps</QUI.MenuGroupLabel>
            {apps.map((app) => (
              <QUI.MenuItem key={app.label} icon={<QUI.Icon icon={app.icon} />} selected={app === current} onClick={() => (window.location.hash = app.href)}>
                {app.label}
              </QUI.MenuItem>
            ))}
          </QUI.MenuGroup>
          <QUI.MenuSeparator />
          <QUI.MenuGroup>
            <QUI.MenuGroupLabel>Playground</QUI.MenuGroupLabel>
            <QUI.MenuItem icon={<QUI.Icon icon={Icons.Component} />} selected={false} onClick={() => (window.location.hash = "#/components")}>
              Components
            </QUI.MenuItem>
          </QUI.MenuGroup>
        </QUI.MenuContent>
      </QUI.Menu>
    </QUI.Box>
  );
}

function TopBar() {
  return (
    <QUI.Inline as="header" justify="between" wrap={false} gap="4" paddingX="3" paddingY="2">
      <QUI.Inline gap="1" wrap={false} grow>
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
      <QUI.Inline gap="2" wrap={false} grow justify="end">
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

/** A sidebar entry: a link to its screen, marked current when it is the shell's `current`. */
function NavLink({ icon, label, href }: NavEntry) {
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
  const app = useCurrentApp();
  const navigation = React.useContext(NavigationContext);
  return (
    <QUI.NavSidebar title={app.label} endAction={endAction}>
      {app.entries.length > 0 ? (
        <QUI.List aria-label={app.label}>
          {app.entries.map((e) => (
            <NavLink key={e.label} {...e} />
          ))}
        </QUI.List>
      ) : null}
      {navigation}
      {app.sections.map((section) => (
        <QUI.ListSection key={section.label} label={section.label} defaultOpen>
          <QUI.List aria-label={section.label}>
            {section.items.map((e) => (
              <NavLink key={e.label} {...e} />
            ))}
          </QUI.List>
        </QUI.ListSection>
      ))}
    </QUI.NavSidebar>
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
  current = "Work items",
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
  return (
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
  );
}

