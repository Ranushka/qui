import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { groups, totalCount, priorityIcon, typeIcon, type StateGroup as StateGroupData, type WorkItem } from "../examples/acme/data";
import { AcmeShell, ViewToolbar } from "../examples/acme/shell";

/**
 * A Plane-style "Work items" list screen built only from qui components — no className or style
 * anywhere in this file. It exists to find out what a real app screen needs from qui; anything
 * that can't be expressed here is a gap in qui, not something to patch with classes.
 */

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

function StateGroup({ group }: { group: StateGroupData }) {
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

/** The list view: dumb, renders whatever groups it's given. */
export function WorkItemsList({ groups, count }: { groups: StateGroupData[]; count: number }) {
  return (
    <AcmeShell>
      <ViewToolbar layout="list" count={count} />
      <QUI.Box grow overflow="auto">
        {groups.map((group) => (
          <StateGroup key={group.state} group={group} />
        ))}
      </QUI.Box>
    </AcmeShell>
  );
}

/** Playground page: the list view filled with sample data. */
export function WorkItemsPage() {
  return <WorkItemsList groups={groups} count={totalCount} />;
}
