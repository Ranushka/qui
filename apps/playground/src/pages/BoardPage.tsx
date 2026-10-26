import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { groups, totalCount, priorityIcon, typeIcon, type StateGroup, type WorkItem } from "../examples/acme/data";
import { AcmeShell, ViewToolbar } from "../examples/acme/shell";

/**
 * The same work items as a Kanban board: one column per state, one card per item (sub-items get
 * their own cards). Built only from qui components — no className or style.
 */

function CardMenu({ item }: { item: WorkItem }) {
  return (
    <QUI.Menu>
      <QUI.MenuTrigger
        render={<QUI.IconButton variant="ghost" size="xs" aria-label={`Actions for ${item.id}`} icon={<QUI.Icon icon={Icons.Ellipsis} />} />}
      />
      <QUI.MenuContent>
        <QUI.MenuItem icon={<QUI.Icon icon={Icons.SquareArrowOutUpRight} />}>Open</QUI.MenuItem>
        <QUI.MenuItem icon={<QUI.Icon icon={Icons.Link} />}>Copy link</QUI.MenuItem>
        <QUI.MenuItem icon={<QUI.Icon icon={Icons.Copy} />}>Duplicate</QUI.MenuItem>
        <QUI.MenuSeparator />
        <QUI.MenuItem variant="danger" icon={<QUI.Icon icon={Icons.Trash2} />}>
          Delete
        </QUI.MenuItem>
      </QUI.MenuContent>
    </QUI.Menu>
  );
}

function Card({ item, parent }: { item: WorkItem; parent?: WorkItem }) {
  return (
    <QUI.WorkItemCard
      itemId={item.id}
      parentId={parent?.id}
      typeIcon={typeIcon[item.type]}
      title={item.title}
      label={item.label}
      due={item.due}
      priority={item.priority === "urgent" ? "urgent" : "normal"}
      priorityIcon={priorityIcon[item.priority]}
      priorityLabel={`Priority: ${item.priority}`}
      assignees={item.assignees}
      subItems={item.children?.length ?? 0}
      actions={<CardMenu item={item} />}
    />
  );
}

function Column({ group }: { group: StateGroup }) {
  return (
    <QUI.Box as="section" aria-label={group.state} width="2xs" shrink={false} background="layer-1" radius="lg">
      <QUI.Stack height="full">
        <QUI.StateGroupHeader layout="column" icon={group.icon} state={group.state} count={group.count} />
        <QUI.Box grow overflow="auto" paddingX="2" paddingBottom="2">
          <QUI.Stack as="ul" gap="2">
            {group.items.flatMap((item) => [
              <Card key={item.id} item={item} />,
              ...(item.children ?? []).map((child) => <Card key={child.id} item={child} parent={item} />),
            ])}
          </QUI.Stack>
        </QUI.Box>
      </QUI.Stack>
    </QUI.Box>
  );
}

/** The board view: dumb, renders whatever groups it's given. */
export function Board({ groups, count }: { groups: StateGroup[]; count: number }) {
  return (
    <AcmeShell current="Views">
      <ViewToolbar layout="board" count={count} />
      <QUI.Box grow overflow="auto" paddingX="6" paddingBottom="4">
        <QUI.Inline height="full" wrap={false} align="stretch" gap="3">
          {groups.map((group) => (
            <Column key={group.state} group={group} />
          ))}
        </QUI.Inline>
      </QUI.Box>
    </AcmeShell>
  );
}

/** Playground page: the board filled with sample data. */
export function BoardPage() {
  return <Board groups={groups} count={totalCount} />;
}
