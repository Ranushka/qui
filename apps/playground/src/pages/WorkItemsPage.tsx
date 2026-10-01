import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";

/**
 * A Plane-style "Work items" screen built only from qui components — no className or style
 * anywhere in this file. It exists to find out what a real app screen needs from qui; anything
 * that can't be expressed here is a gap in qui, not something to patch with classes.
 */

type WorkItem = {
  id: string;
  title: string;
  type: keyof typeof typeIcon;
  assignees: string[];
  label: { name: string; color: string };
  due: string;
  priority: "urgent" | "high" | "medium" | "low";
  children?: WorkItem[];
};

const typeIcon = {
  feature: Icons.Sparkles,
  task: Icons.Box,
  bug: Icons.Hash,
  epic: Icons.Layers,
  idea: Icons.Sun,
};

const priorityIcon = {
  urgent: Icons.CircleAlert,
  high: Icons.SignalHigh,
  medium: Icons.SignalMedium,
  low: Icons.SignalLow,
};

const label = {
  enhancement: { name: "Enhancement", color: "#8b5cf6" },
  editor: { name: "Editor", color: "#10b981" },
  mobile: { name: "Mobile", color: "#0ea5e9" },
  ai: { name: "AI", color: "#10b981" },
  product: { name: "Product", color: "#3b82f6" },
  engineering: { name: "Engineering", color: "#f59e0b" },
  bug: { name: "Bug", color: "#f59e0b" },
  wiki: { name: "Wiki", color: "#8b5cf6" },
  auth: { name: "Authentication", color: "#8b5cf6" },
  billing: { name: "Billing", color: "#8b5cf6" },
  three: { name: "3 labels", color: "#22c55e" },
};

const groups: { state: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; items: WorkItem[] }[] = [
  {
    state: "Backlog",
    icon: Icons.CircleDashed,
    items: [
      { id: "ACME-23", title: "Design empty state illustrations", type: "idea", assignees: ["Ann Lee"], label: label.enhancement, due: "22 Dec", priority: "high" },
      { id: "ACME-45", title: "Embed pages in nested wiki views", type: "feature", assignees: ["Raj Patel", "Mia Chen"], label: label.editor, due: "03 Mar", priority: "medium" },
      { id: "ACME-67", title: "Improve Stickies drag-and-drop behavior", type: "task", assignees: ["Ann Lee"], label: { ...label.enhancement, color: "#ef4444" }, due: "18 Aug", priority: "low" },
      { id: "ACME-89", title: "Redesign nested pages list for mobile", type: "bug", assignees: ["Tom Ford"], label: label.mobile, due: "29 Nov", priority: "high" },
      {
        id: "ACME-12", title: "Add voice input to AI chat", type: "epic", assignees: ["Sara Kim"], label: label.three, due: "11 Feb", priority: "low",
        children: [
          { id: "ACME-98", title: "Redesign context selector layout", type: "feature", assignees: ["Open AI"], label: label.ai, due: "03 Mar", priority: "medium" },
          { id: "ACME-76", title: "Redesign create work item modal", type: "task", assignees: ["Bot"], label: label.ai, due: "03 Mar", priority: "medium" },
        ],
      },
      { id: "ACME-34", title: "Add password protection for pages and wiki", type: "feature", assignees: ["Ben Ray", "Bot"], label: { ...label.three, color: "#64748b" }, due: "01 Jan", priority: "medium" },
    ],
  },
  {
    state: "To do",
    icon: Icons.Circle,
    items: [
      { id: "ACME-56", title: "Product Tour", type: "feature", assignees: ["Kai Moss"], label: label.product, due: "27 Apr", priority: "urgent" },
      { id: "ACME-78", title: "Workflow approvals UX", type: "task", assignees: ["Lia Gold"], label: label.engineering, due: "14 Oct", priority: "urgent" },
      { id: "ACME-90", title: "Redesign create work item modal", type: "bug", assignees: ["Noah Hill"], label: label.bug, due: "30 Sept", priority: "high" },
      { id: "ACME-21", title: "Improve epic detail view", type: "epic", assignees: ["Eve Park", "Bot"], label: label.enhancement, due: "08 May", priority: "high" },
      { id: "ACME-43", title: "Nested page node redesign for mobile", type: "feature", assignees: ["Ivy Shaw"], label: label.wiki, due: "21 Jul", priority: "low" },
    ],
  },
  {
    state: "In Progress",
    icon: Icons.CircleDot,
    items: [
      { id: "ACME-65", title: "UX/UI for Figma integration", type: "task", assignees: ["Gus Lane"], label: label.auth, due: "19 Dec", priority: "high" },
      { id: "ACME-87", title: "Dynamic icons based on context type", type: "feature", assignees: ["Ada Vale"], label: label.billing, due: "25 Aug", priority: "medium" },
    ],
  },
];

function TopBar() {
  return (
    <QUI.Inline as="header" justify="between" wrap={false} gap="4" paddingX="3" paddingY="2">
      <QUI.Button variant="ghost" icon={<QUI.WorkspaceAvatar size="xs" alt="Acme Inc." />} label="Acme Inc." />
      <QUI.Box width="md">
        <QUI.Input
          aria-label="Search"
          placeholder="Search Acme Inc."
          startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />}
          endSlot={<QUI.Shortcut keys="⌘K" />}
        />
      </QUI.Box>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.IconButton variant="ghost" aria-label="Inbox" icon={<QUI.Icon icon={Icons.Inbox} />} />
        <QUI.IconButton variant="ghost" aria-label="Help" icon={<QUI.Icon icon={Icons.CircleHelp} />} />
        <QUI.Button variant="ghost" icon={<QUI.Icon icon={Icons.Sparkles} />} label="AI Assistant" />
        <QUI.Avatar size="md" alt="Ranu" />
      </QUI.Inline>
    </QUI.Inline>
  );
}

function RailItem({ icon, label, current }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; current?: boolean }) {
  return (
    <QUI.Stack as="li" align="center" gap="1">
      <QUI.IconButton variant={current ? "secondary" : "ghost"} aria-label={label} showTooltip={false} icon={<QUI.Icon icon={icon} />} />
      <QUI.Text variant="caption" size="sm" color={current ? "primary" : "secondary"}>{label}</QUI.Text>
    </QUI.Stack>
  );
}

function Rail() {
  return (
    <QUI.Stack as="nav" aria-label="Apps" paddingX="2" paddingY="3" shrink={false}>
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

function NavLink({ icon, label, current }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; current?: boolean }) {
  return (
    <QUI.ListItem>
      <QUI.ListItemLink href="#work-items" aria-current={current ? "page" : undefined} startIcon={<QUI.Icon icon={icon} />} label={label} />
    </QUI.ListItem>
  );
}

function Sidebar() {
  return (
    <QUI.Box as="aside" width="3xs" border="subtle" borderEdge="end" shrink={false} overflow="auto">
      <QUI.Stack gap="4" padding="3">
        <QUI.Inline justify="between" wrap={false} paddingStart="2">
          <QUI.Heading level={2} size={5}>Work</QUI.Heading>
          <QUI.Inline gap="1" wrap={false}>
            <QUI.IconButton variant="ghost" size="sm" aria-label="Customize" icon={<QUI.Icon icon={Icons.SlidersHorizontal} />} />
            <QUI.IconButton variant="ghost" size="sm" aria-label="Collapse sidebar" icon={<QUI.Icon icon={Icons.PanelLeft} />} />
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
    </QUI.Box>
  );
}

function ProjectHeader() {
  return (
    <QUI.Box as="header" border="subtle" borderEdge="bottom" paddingX="4" paddingY="2">
      <QUI.Inline justify="between" wrap={false} gap="4">
        <QUI.Inline gap="6" wrap={false}>
          <QUI.Inline gap="2" wrap={false} shrink={false}>
            <QUI.Icon icon={Icons.Tractor} size="lg" />
            <QUI.Heading level={1} size={5}>Core product</QUI.Heading>
          </QUI.Inline>
          <QUI.Tabs variant="underline" defaultValue="work-items">
            <QUI.TabsList>
              <QUI.Tab value="overview" label="Overview" />
              <QUI.Tab value="work-items" label="Work items" />
              <QUI.Tab value="cycles" label="Cycles" />
              <QUI.Tab value="modules" label="Modules" />
            </QUI.TabsList>
          </QUI.Tabs>
          <QUI.IconButton variant="ghost" size="sm" aria-label="More tabs" icon={<QUI.Icon icon={Icons.Ellipsis} />} />
        </QUI.Inline>
        <QUI.Inline gap="2" wrap={false}>
          <QUI.IconButton variant="ghost" aria-label="Copy link" icon={<QUI.Icon icon={Icons.Link} />} />
          <QUI.IconButton variant="ghost" aria-label="Project actions" icon={<QUI.Icon icon={Icons.Ellipsis} />} />
        </QUI.Inline>
      </QUI.Inline>
    </QUI.Box>
  );
}

function ListToolbar({ count }: { count: number }) {
  return (
    <QUI.Inline justify="between" wrap={false} gap="4" paddingX="6" paddingY="3">
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Icon icon={Icons.SquareStack} size="md" tint="secondary" />
        <QUI.Text size="md" weight="medium">Work items</QUI.Text>
        <QUI.Badge size="sm" variant="brand" label={count} />
      </QUI.Inline>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.List} />} label="List" />
        <QUI.IconButton variant="secondary" aria-label="Filters" icon={<QUI.Icon icon={Icons.ListFilter} />} />
        <QUI.IconButton variant="secondary" aria-label="Display" icon={<QUI.Icon icon={Icons.SlidersHorizontal} />} />
        <QUI.IconButton variant="secondary" aria-label="Analytics" icon={<QUI.Icon icon={Icons.ChartColumn} />} />
        <QUI.Button label="Add work item" />
      </QUI.Inline>
    </QUI.Inline>
  );
}

function WorkItemRow({ item, level = 0 }: { item: WorkItem; level?: number }) {
  return (
    <>
      <QUI.Inline as="li" wrap={false} gap="4" paddingY="2" paddingStart={level ? "12" : "6"} paddingEnd="6">
        <QUI.Inline grow wrap={false} gap="3">
          <QUI.Icon icon={typeIcon[item.type]} size="md" tint="secondary" />
          <QUI.Text color="secondary" tabularNums>{item.id}</QUI.Text>
          <QUI.Box grow>
            <QUI.Text weight="medium" color="primary" maxLines={1}>{item.title}</QUI.Text>
          </QUI.Box>
        </QUI.Inline>
        <QUI.Inline gap="2" wrap={false} shrink={false}>
          <QUI.AvatarGroup size="sm" max={2}>
            {item.assignees.map((name) => (
              <QUI.Avatar key={name} alt={name} />
            ))}
          </QUI.AvatarGroup>
          <QUI.Pill size="sm" startIcon={<QUI.Swatch fill={item.label.color} />} label={item.label.name} />
          <QUI.Pill size="sm" startIcon={<QUI.Icon icon={Icons.CalendarDays} />} label={item.due} />
          <QUI.IconButton
            variant="secondary"
            size="sm"
            aria-label={`Priority: ${item.priority}`}
            icon={<QUI.Icon icon={priorityIcon[item.priority]} tint={item.priority === "urgent" ? "danger" : "secondary"} />}
          />
        </QUI.Inline>
      </QUI.Inline>
      {item.children?.map((child) => <WorkItemRow key={child.id} item={child} level={level + 1} />)}
    </>
  );
}

function StateGroup({ group }: { group: (typeof groups)[number] }) {
  return (
    <QUI.Stack as="section" aria-label={group.state}>
      <QUI.Box background="layer-1" paddingX="6" paddingY="2">
        <QUI.Inline gap="2" wrap={false}>
          <QUI.Icon icon={group.icon} size="md" tint="secondary" />
          <QUI.Text size="md" weight="medium">{group.state}</QUI.Text>
        </QUI.Inline>
      </QUI.Box>
      <QUI.Stack as="ul">
        {group.items.map((item) => (
          <WorkItemRow key={item.id} item={item} />
        ))}
      </QUI.Stack>
    </QUI.Stack>
  );
}

export function WorkItemsPage() {
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
                <ListToolbar count={112} />
                <QUI.Box grow overflow="auto">
                  {groups.map((group) => (
                    <StateGroup key={group.state} group={group} />
                  ))}
                </QUI.Box>
              </QUI.Stack>
            </QUI.Inline>
          </QUI.Box>
        </QUI.Inline>
      </QUI.Stack>
    </QUI.Box>
  );
}
