import * as React from "react";
import { CalendarDays, ListTree } from "lucide-react";
import type { NoClass } from "../lib/no-class";
import { Avatar } from "../atoms/Avatar";
import { AvatarGroup } from "../atoms/AvatarGroup";
import { Box } from "../atoms/Box";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { Inline } from "../atoms/Inline";
import { Pill } from "../atoms/Pill";
import { Stack } from "../atoms/Stack";
import { Swatch } from "../atoms/Swatch";
import { Text } from "../atoms/Text";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface WorkItemCardProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"li">, "title">> {
  /** Work-item key, e.g. `ACME-45`. */
  itemId: string;
  /** Key of the parent item; renders as `PARENT › ITEM` for sub-items. */
  parentId?: string;
  /** Icon for the item type. */
  typeIcon: IconComponent;
  title: React.ReactNode;
  /** Label name and its swatch colour. */
  label: { name: string; color: string };
  /** Due date, already formatted. */
  due: string;
  /** Icon for the priority; `urgent` tints it as a warning. */
  priorityIcon: IconComponent;
  priority?: "normal" | "urgent";
  /** Accessible name of the priority button. */
  priorityLabel?: string;
  /** Assignee names; the first three show as avatars. */
  assignees: string[];
  /** Number of sub-items; the footer shows a count when above zero. */
  subItems?: number;
  /** Trailing action in the header, usually a menu trigger. */
  actions?: React.ReactNode;
}

/** A Kanban card for one work item: key, actions, title, label/due/priority, assignees and sub-item count. */
export function WorkItemCard({
  itemId,
  parentId,
  typeIcon,
  title,
  label,
  due,
  priorityIcon,
  priority = "normal",
  priorityLabel,
  assignees,
  subItems = 0,
  actions,
  ...props
}: WorkItemCardProps) {
  return (
    <Box as="li" background="surface-1" border="subtle" radius="lg" shadow="raised-100" padding="3" {...props}>
      <Stack gap="2">
        <Inline justify="between" wrap={false}>
          <Inline gap="1.5" wrap={false}>
            <Icon icon={typeIcon} size="sm" tint="secondary" />
            <Text variant="caption" color="tertiary" tabularNums>
              {parentId ? `${parentId} › ${itemId}` : itemId}
            </Text>
          </Inline>
          {actions}
        </Inline>
        <Text as="p" weight="medium" color="primary" maxLines={2}>
          {title}
        </Text>
        <Inline gap="1.5">
          <Pill size="xs" startIcon={<Swatch fill={label.color} />} label={label.name} />
          <Pill size="xs" startIcon={<Icon icon={CalendarDays} />} label={due} />
          <IconButton
            variant="secondary"
            size="xs"
            aria-label={priorityLabel ?? `Priority: ${priority}`}
            icon={<Icon icon={priorityIcon} tint={priority === "urgent" ? "danger" : "secondary"} />}
          />
        </Inline>
        <Inline justify="between" wrap={false}>
          <AvatarGroup size="xs" max={3}>
            {assignees.map((name) => (
              <Avatar key={name} alt={name} />
            ))}
          </AvatarGroup>
          {subItems > 0 && (
            <Inline gap="1" wrap={false}>
              <Icon icon={ListTree} size="xs" tint="tertiary" />
              <Text variant="caption" color="tertiary">
                {subItems} sub-items
              </Text>
            </Inline>
          )}
        </Inline>
      </Stack>
    </Box>
  );
}
