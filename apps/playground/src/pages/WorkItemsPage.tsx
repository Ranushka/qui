import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { detailsFor, entries, groups, priorityIcon, totalCount, typeIcon, type StateGroup as StateGroupData, type WorkItem } from "../examples/acme/data";
import { WorkItemPeek } from "../examples/acme/detail";
import { AcmeShell, ViewToolbar } from "../examples/acme/shell";

/**
 * A Plane-style "Work items" list built only from qui components — no className or style
 * anywhere in this file. Clicking a row opens the item in a side panel (full screen on phones).
 */

type OpenItem = (id: string) => void;

function WorkItemRow({ item, level = 0, onOpen }: { item: WorkItem; level?: number; onOpen: OpenItem }) {
  return (
    <>
      <QUI.ListItem level={level ? 3 : 1}>
        <QUI.ListItemButton
          startIcon={<QUI.Icon icon={typeIcon[item.type]} />}
          label={
            <>
              <QUI.Text color="tertiary" tabularNums>{item.id}</QUI.Text>{"  "}
              <QUI.Text color="primary">{item.title}</QUI.Text>
            </>
          }
          onClick={() => onOpen(item.id)}
        />
        <QUI.Inline gap="2" wrap={false} shrink={false}>
          <QUI.Box hideBelow="md">
            <QUI.AvatarGroup size="sm" max={2}>
              {item.assignees.map((name) => (
                <QUI.Avatar key={name} alt={name} />
              ))}
            </QUI.AvatarGroup>
          </QUI.Box>
          <QUI.Box hideBelow="md">
            <QUI.Pill size="sm" startIcon={<QUI.Swatch fill={item.label.color} />} label={item.label.name} />
          </QUI.Box>
          <QUI.Box hideBelow="sm">
            <QUI.Pill size="sm" startIcon={<QUI.Icon icon={Icons.CalendarDays} />} label={item.due} />
          </QUI.Box>
          <QUI.IconButton
            variant="secondary"
            size="sm"
            aria-label={`Priority: ${item.priority}`}
            icon={<QUI.Icon icon={priorityIcon[item.priority]} tint={item.priority === "urgent" ? "danger" : "secondary"} />}
          />
        </QUI.Inline>
      </QUI.ListItem>
      {item.children?.map((child) => <WorkItemRow key={child.id} item={child} level={level + 1} onOpen={onOpen} />)}
    </>
  );
}

function StateGroup({ group, onOpen }: { group: StateGroupData; onOpen: OpenItem }) {
  return (
    <QUI.Stack as="section" aria-label={group.state}>
      <QUI.Box background="layer-1" paddingX="4" paddingY="2">
        <QUI.Inline gap="2" wrap={false}>
          <QUI.Icon icon={group.icon} size="md" tint="secondary" />
          <QUI.Text size="md" weight="medium">{group.state}</QUI.Text>
          <QUI.Text variant="caption" color="tertiary">{group.count}</QUI.Text>
        </QUI.Inline>
      </QUI.Box>
      <QUI.Box paddingX="2" paddingY="1">
        <QUI.List aria-label={`${group.state} work items`}>
          {group.items.map((item) => (
            <WorkItemRow key={item.id} item={item} onOpen={onOpen} />
          ))}
        </QUI.List>
      </QUI.Box>
    </QUI.Stack>
  );
}

/** The list view: renders the groups it's given and reports which item to open. */
export function WorkItemsList({ groups, count, onOpen }: { groups: StateGroupData[]; count: number; onOpen: OpenItem }) {
  return (
    <AcmeShell>
      <ViewToolbar layout="list" count={count} />
      <QUI.Box grow overflow="auto">
        {groups.map((group) => (
          <StateGroup key={group.state} group={group} onOpen={onOpen} />
        ))}
      </QUI.Box>
    </AcmeShell>
  );
}

/** Playground page: the list with sample data, plus the side panel for the open item. */
export function WorkItemsPage() {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const index = entries.findIndex((entry) => entry.item.id === openId);
  const entry = index >= 0 ? entries[index] : undefined;

  return (
    <>
      <WorkItemsList groups={groups} count={totalCount} onOpen={setOpenId} />
      <QUI.Drawer open={Boolean(entry)} onOpenChange={(open) => !open && setOpenId(null)}>
        {entry ? (
          <WorkItemPeek
            entry={entry}
            details={detailsFor(entry)}
            position={{ index, total: entries.length }}
            onPrevious={() => setOpenId(entries[index - 1]!.item.id)}
            onNext={() => setOpenId(entries[index + 1]!.item.id)}
            onOpenItem={setOpenId}
          />
        ) : null}
      </QUI.Drawer>
    </>
  );
}
