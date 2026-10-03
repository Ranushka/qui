import type * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { priorityIcon, typeIcon, type IconComponent, type WorkItem, type WorkItemDetails, type WorkItemEntry } from "./data";

/**
 * One work item's details. `WorkItemDetail` is the content (title, description, properties,
 * sub-items, activity) and fits a side panel or a full page; `WorkItemPeek` wraps it in the side
 * panel's header. Built only from qui components — no className or style.
 */

const priorityLabel: Record<WorkItem["priority"], string> = { urgent: "Urgent", high: "High", medium: "Medium", low: "Low" };

function Property({ icon, label, children }: { icon: IconComponent; label: string; children: React.ReactNode }) {
  return (
    <QUI.Stack gap="1.5">
      <QUI.Inline gap="1.5" wrap={false}>
        <QUI.Icon icon={icon} size="xs" tint="tertiary" />
        <QUI.Text variant="caption" color="tertiary">{label}</QUI.Text>
      </QUI.Inline>
      <QUI.Inline gap="1.5">{children}</QUI.Inline>
    </QUI.Stack>
  );
}

function Properties({ entry }: { entry: WorkItemEntry }) {
  const { item, group } = entry;
  return (
    <QUI.Grid columns={3} collapseBelow="sm" gap="4" rowGap="5">
      <Property icon={Icons.CircleDashed} label="State">
        <QUI.Pill size="sm" startIcon={<QUI.Icon icon={group.icon} />} label={group.state} />
      </Property>
      <Property icon={Icons.SignalHigh} label="Priority">
        <QUI.Pill
          size="sm"
          startIcon={<QUI.Icon icon={priorityIcon[item.priority]} tint={item.priority === "urgent" ? "danger" : "inherit"} />}
          label={priorityLabel[item.priority]}
        />
      </Property>
      <Property icon={Icons.UsersRound} label="Assignees">
        <QUI.AvatarGroup size="sm" max={3}>
          {item.assignees.map((name) => (
            <QUI.Avatar key={name} alt={name} />
          ))}
        </QUI.AvatarGroup>
        <QUI.Text size="xs" color="secondary" maxLines={1}>{item.assignees.join(", ")}</QUI.Text>
      </Property>
      <Property icon={Icons.Tag} label="Labels">
        <QUI.Pill size="sm" startIcon={<QUI.Swatch fill={item.label.color} />} label={item.label.name} />
      </Property>
      <Property icon={Icons.CalendarDays} label="Due date">
        <QUI.Pill size="sm" startIcon={<QUI.Icon icon={Icons.CalendarDays} />} label={item.due} />
      </Property>
      <Property icon={Icons.Shapes} label="Type">
        <QUI.Pill size="sm" startIcon={<QUI.Icon icon={typeIcon[item.type]} />} label={item.type[0]!.toUpperCase() + item.type.slice(1)} />
      </Property>
    </QUI.Grid>
  );
}

function SubItems({ items, onOpen }: { items: WorkItem[]; onOpen: (id: string) => void }) {
  return (
    <QUI.Stack as="section" aria-label="Sub-items" gap="2">
      <QUI.Inline gap="2">
        <QUI.Heading level={3} size={6}>Sub-items</QUI.Heading>
        <QUI.Badge size="xs" label={items.length} />
      </QUI.Inline>
      <QUI.Box border="subtle" radius="lg" padding="1">
        <QUI.List aria-label="Sub-items">
          {items.map((child) => (
            <QUI.ListItem key={child.id}>
              <QUI.ListItemButton
                startIcon={<QUI.Icon icon={typeIcon[child.type]} />}
                label={
                  <>
                    <QUI.Text color="tertiary" tabularNums>{child.id}</QUI.Text> <QUI.Text color="primary">{child.title}</QUI.Text>
                  </>
                }
                onClick={() => onOpen(child.id)}
              />
            </QUI.ListItem>
          ))}
        </QUI.List>
      </QUI.Box>
    </QUI.Stack>
  );
}

function Activity({ details }: { details: WorkItemDetails }) {
  return (
    <QUI.Tabs defaultValue="activity">
      <QUI.TabsList>
        <QUI.Tab value="activity" label="Activity" icon={<QUI.Icon icon={Icons.History} />} />
        <QUI.Tab value="comments" label={`Comments (${details.comments.length})`} icon={<QUI.Icon icon={Icons.MessageSquare} />} />
      </QUI.TabsList>
      <QUI.TabsPanel value="activity">
        <QUI.Stack as="ol" gap="3" paddingTop="4">
          {details.activity.map((entry, i) => (
            <QUI.Inline as="li" key={i} gap="2" wrap={false} align="start">
              <QUI.Avatar size="xs" alt={entry.who} />
              <QUI.Text as="p" size="xs" color="secondary">
                <QUI.Text weight="medium" color="primary">{entry.who}</QUI.Text> {entry.what} · {entry.when}
              </QUI.Text>
            </QUI.Inline>
          ))}
        </QUI.Stack>
      </QUI.TabsPanel>
      <QUI.TabsPanel value="comments">
        <QUI.Stack gap="4" paddingTop="4">
          {details.comments.map((comment, i) => (
            <QUI.Inline key={i} gap="2" wrap={false} align="start">
              <QUI.Avatar size="sm" alt={comment.who} />
              <QUI.Box grow background="layer-1" radius="lg" paddingX="3" paddingY="2">
                <QUI.Stack gap="1">
                  <QUI.Inline gap="2">
                    <QUI.Text size="xs" weight="medium" color="primary">{comment.who}</QUI.Text>
                    <QUI.Text variant="caption" color="tertiary">{comment.when}</QUI.Text>
                  </QUI.Inline>
                  <QUI.Text as="p" size="sm" color="secondary">{comment.text}</QUI.Text>
                </QUI.Stack>
              </QUI.Box>
            </QUI.Inline>
          ))}
          <QUI.Stack gap="2">
            <QUI.TextAreaField label="Add a comment" placeholder="Write a comment…" />
            <QUI.Inline justify="end">
              <QUI.Button size="sm" label="Comment" />
            </QUI.Inline>
          </QUI.Stack>
        </QUI.Stack>
      </QUI.TabsPanel>
    </QUI.Tabs>
  );
}

/** The work item itself: fits a side panel or a full page. */
export function WorkItemDetail({ entry, details, onOpenItem }: { entry: WorkItemEntry; details: WorkItemDetails; onOpenItem: (id: string) => void }) {
  const { item } = entry;
  return (
    <QUI.Stack gap="8">
      <QUI.Stack gap="3">
        <QUI.Inline gap="1.5" wrap={false}>
          <QUI.Icon icon={typeIcon[item.type]} size="sm" tint="secondary" />
          <QUI.Text variant="caption" color="tertiary" tabularNums>{item.id}</QUI.Text>
        </QUI.Inline>
        <QUI.Heading level={2} size={3}>{item.title}</QUI.Heading>
        {details.description.map((paragraph, i) => (
          <QUI.Text key={i} as="p" color="secondary">{paragraph}</QUI.Text>
        ))}
      </QUI.Stack>
      <Properties entry={entry} />
      {item.children?.length ? <SubItems items={item.children} onOpen={onOpenItem} /> : null}
      <QUI.Separator />
      <Activity details={details} />
    </QUI.Stack>
  );
}

/** The side panel: breadcrumb, ↑/↓ through items, close; content scrolls under the header. Goes inside a controlled `Drawer`. */
export function WorkItemPeek({
  entry,
  details,
  position,
  onPrevious,
  onNext,
  onOpenItem,
}: {
  entry: WorkItemEntry;
  details: WorkItemDetails;
  position: { index: number; total: number };
  onPrevious: () => void;
  onNext: () => void;
  onOpenItem: (id: string) => void;
}) {
  const { item, parent } = entry;
  return (
    <QUI.DrawerContent size="md" hideClose aria-label={item.title}>
      <QUI.Box as="header" border="subtle" borderEdge="bottom" paddingX="4" paddingY="2" shrink={false}>
        <QUI.Inline justify="between" wrap={false} gap="3">
          <QUI.Breadcrumb>
            <QUI.BreadcrumbItem icon={<QUI.Icon icon={Icons.Tractor} />}>Core product</QUI.BreadcrumbItem>
            {parent ? (
              <>
                <QUI.BreadcrumbSeparator />
                <QUI.BreadcrumbItem>{parent.id}</QUI.BreadcrumbItem>
              </>
            ) : null}
            <QUI.BreadcrumbSeparator />
            <QUI.BreadcrumbItem current>{item.id}</QUI.BreadcrumbItem>
          </QUI.Breadcrumb>
          <QUI.Inline gap="1" wrap={false} shrink={false}>
            <QUI.Box hideBelow="sm">
              <QUI.Text variant="caption" color="tertiary" tabularNums>
                {position.index + 1} / {position.total}
              </QUI.Text>
            </QUI.Box>
            <QUI.IconButton variant="ghost" size="sm" aria-label="Previous work item" disabled={position.index === 0} onClick={onPrevious} icon={<QUI.Icon icon={Icons.ChevronUp} />} />
            <QUI.IconButton variant="ghost" size="sm" aria-label="Next work item" disabled={position.index === position.total - 1} onClick={onNext} icon={<QUI.Icon icon={Icons.ChevronDown} />} />
            <QUI.IconButton variant="ghost" size="sm" aria-label="Copy link" icon={<QUI.Icon icon={Icons.Link} />} />
            <QUI.DrawerClose render={<QUI.IconButton variant="ghost" size="sm" aria-label="Close" icon={<QUI.Icon icon={Icons.X} />} />} />
          </QUI.Inline>
        </QUI.Inline>
      </QUI.Box>
      <QUI.Box grow overflow="auto" paddingX="6" paddingY="6">
        <WorkItemDetail entry={entry} details={details} onOpenItem={onOpenItem} />
      </QUI.Box>
    </QUI.DrawerContent>
  );
}
