import * as React from "react";
import * as QUI from "@qui/ui";
import { Icons } from "@qui/ui";
import { detailsFor, entries, groups, priorityIcon, totalCount, typeIcon, type StateGroup as StateGroupData, type WorkItem } from "../examples/acme/data";
import { WorkItemPeek } from "../examples/acme/detail";
import { AcmeShell, ViewToolbar } from "../examples/acme/shell";

/**
 * A Plane-style "Work items" list built only from qui components — no className or style
 * anywhere in this file. Clicking a row opens the item in a side panel (full screen on phones).
 */

type OpenItem = (id: string) => void;

function ItemRow({ item, level = 1, onOpen }: { item: WorkItem; level?: 1 | 2; onOpen: OpenItem }) {
  return (
    <>
      <QUI.WorkItemRow
        itemId={item.id}
        title={item.title}
        typeIcon={typeIcon[item.type]}
        label={item.label}
        due={item.due}
        priority={item.priority === "urgent" ? "urgent" : "normal"}
        priorityIcon={priorityIcon[item.priority]}
        priorityLabel={`Priority: ${item.priority}`}
        assignees={item.assignees}
        level={level}
        onClick={() => onOpen(item.id)}
      />
      {item.children?.map((child) => <ItemRow key={child.id} item={child} level={2} onOpen={onOpen} />)}
    </>
  );
}

function StateGroup({ group, onOpen }: { group: StateGroupData; onOpen: OpenItem }) {
  return (
    <QUI.Stack as="section" aria-label={group.state}>
      <QUI.StateGroupHeader icon={group.icon} state={group.state} count={group.count} />
      <QUI.Box paddingX="2" paddingY="1">
        <QUI.List aria-label={`${group.state} work items`}>
          {group.items.map((item) => (
            <ItemRow key={item.id} item={item} onOpen={onOpen} />
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
