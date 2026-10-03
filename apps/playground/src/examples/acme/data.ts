import type * as React from "react";
import * as Icons from "lucide-react";

/** Sample data for the "Acme Inc." example screens (list, board, …). */

export type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export type WorkItem = {
  id: string;
  title: string;
  type: keyof typeof typeIcon;
  assignees: string[];
  label: { name: string; color: string };
  due: string;
  priority: "urgent" | "high" | "medium" | "low";
  children?: WorkItem[];
};

export type StateGroup = {
  state: string;
  icon: IconComponent;
  /** Items in this state, sub-items included. */
  count: number;
  items: WorkItem[];
};

export const typeIcon = {
  feature: Icons.Sparkles,
  task: Icons.Box,
  bug: Icons.Hash,
  epic: Icons.Layers,
  idea: Icons.Sun,
};

export const priorityIcon = {
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

const groupData: Omit<StateGroup, "count">[] = [
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
      { id: "ACME-91", title: "Keyboard shortcuts for moving cards between states", type: "feature", assignees: ["Raj Patel", "Mia Chen", "Tom Ford"], label: label.editor, due: "02 Oct", priority: "medium" },
    ],
  },
  {
    state: "Done",
    icon: Icons.CircleCheck,
    items: [
      { id: "ACME-11", title: "Workspace switcher in the top bar", type: "task", assignees: ["Ann Lee"], label: label.product, due: "12 Sept", priority: "low" },
      { id: "ACME-19", title: "Fix cut-off borders on label pills", type: "bug", assignees: ["Noah Hill"], label: label.bug, due: "01 Oct", priority: "high" },
      { id: "ACME-27", title: "Searchable icon picker", type: "feature", assignees: ["Ivy Shaw", "Bot"], label: label.enhancement, due: "02 Oct", priority: "medium" },
    ],
  },
];

const countItems = (items: WorkItem[]): number => items.reduce((n, item) => n + 1 + countItems(item.children ?? []), 0);

export const groups: StateGroup[] = groupData.map((group) => ({ ...group, count: countItems(group.items) }));

/** Every sample work item, sub-items included. */
export const totalCount = groups.reduce((n, group) => n + group.count, 0);

export type ActivityEntry = { who: string; what: string; when: string };

export type WorkItemDetails = {
  description: string[];
  activity: ActivityEntry[];
  comments: { who: string; text: string; when: string }[];
};

/** A work item with where it sits: its state group and, for sub-items, its parent. */
export type WorkItemEntry = { item: WorkItem; parent?: WorkItem; group: StateGroup };

/** Every work item in list order (sub-items right after their parent), for stepping through with ↑/↓. */
export const entries: WorkItemEntry[] = groups.flatMap((group) =>
  group.items.flatMap((item) => [{ item, group }, ...(item.children ?? []).map((child) => ({ item: child, parent: item, group }))])
);

/** Plausible sample details for any work item. */
export function detailsFor({ item, group }: WorkItemEntry): WorkItemDetails {
  const [owner, ...others] = item.assignees;
  return {
    description: [
      `This ${item.type} covers “${item.title}” for Core product. The goal is a version we can ship behind a flag and test with a few workspaces first.`,
      "Scope: the main flow on desktop and mobile, empty and error states, and keyboard access. Out of scope: migrations for existing data, which get their own work item.",
    ],
    activity: [
      { who: "Ann Lee", what: `created ${item.id}`, when: "3 weeks ago" },
      { who: "Ann Lee", what: `added the label ${item.label.name}`, when: "3 weeks ago" },
      { who: "Ann Lee", what: `assigned ${item.assignees.join(", ")}`, when: "2 weeks ago" },
      { who: owner ?? "Ann Lee", what: `set the due date to ${item.due}`, when: "6 days ago" },
      { who: owner ?? "Ann Lee", what: `moved this to ${group.state}`, when: "yesterday" },
    ],
    comments: [
      { who: owner ?? "Ann Lee", text: "First pass is up for review. Mobile layout still needs a look.", when: "2 days ago" },
      ...(others.length ? [{ who: others[0]!, text: "Looks good on desktop. On a phone the actions wrap, I left notes in the design file.", when: "yesterday" }] : []),
    ],
  };
}
