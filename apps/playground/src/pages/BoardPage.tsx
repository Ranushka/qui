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
  const subItems = item.children?.length ?? 0;
  return (
    <QUI.Box as="li" background="surface-1" border="subtle" radius="lg" shadow="raised-100" padding="3">
      <QUI.Stack gap="2">
        <QUI.Inline justify="between" wrap={false}>
          <QUI.Inline gap="1.5" wrap={false}>
            <QUI.Icon icon={typeIcon[item.type]} size="sm" tint="secondary" />
            <QUI.Text variant="caption" color="tertiary" tabularNums>
              {parent ? `${parent.id} › ${item.id}` : item.id}
            </QUI.Text>
          </QUI.Inline>
          <CardMenu item={item} />
        </QUI.Inline>
        <QUI.Text as="p" weight="medium" color="primary" maxLines={2}>
          {item.title}
        </QUI.Text>
        <QUI.Inline gap="1.5">
          <QUI.Pill size="xs" startIcon={<QUI.Swatch fill={item.label.color} />} label={item.label.name} />
          <QUI.Pill size="xs" startIcon={<QUI.Icon icon={Icons.CalendarDays} />} label={item.due} />
          <QUI.IconButton
            variant="secondary"
            size="xs"
            aria-label={`Priority: ${item.priority}`}
            icon={<QUI.Icon icon={priorityIcon[item.priority]} tint={item.priority === "urgent" ? "danger" : "secondary"} />}
          />
        </QUI.Inline>
        <QUI.Inline justify="between" wrap={false}>
          <QUI.AvatarGroup size="xs" max={3}>
            {item.assignees.map((name) => (
              <QUI.Avatar key={name} alt={name} />
            ))}
          </QUI.AvatarGroup>
          {subItems > 0 && (
            <QUI.Inline gap="1" wrap={false}>
              <QUI.Icon icon={Icons.ListTree} size="xs" tint="tertiary" />
              <QUI.Text variant="caption" color="tertiary">
                {subItems} sub-items
              </QUI.Text>
            </QUI.Inline>
          )}
        </QUI.Inline>
      </QUI.Stack>
    </QUI.Box>
  );
}

function Column({ group }: { group: StateGroup }) {
  return (
    <QUI.Box as="section" aria-label={group.state} width="2xs" shrink={false} background="layer-1" radius="lg">
      <QUI.Stack height="full">
        <QUI.Inline justify="between" wrap={false} paddingX="3" paddingY="2">
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Icon icon={group.icon} size="md" tint="secondary" />
            <QUI.Text weight="medium" color="primary">{group.state}</QUI.Text>
            <QUI.Badge size="xs" label={group.count} />
          </QUI.Inline>
          <QUI.IconButton variant="ghost" size="sm" aria-label={`Add to ${group.state}`} icon={<QUI.Icon icon={Icons.Plus} />} />
        </QUI.Inline>
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
    <AcmeShell>
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
