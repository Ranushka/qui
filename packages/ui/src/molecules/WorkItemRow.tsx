import * as React from "react";
import { CalendarDays } from "../icons";
import type { NoClass } from "../lib/no-class";
import { Avatar } from "../atoms/Avatar";
import { AvatarGroup } from "../atoms/AvatarGroup";
import { Box } from "../atoms/Box";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { Inline } from "../atoms/Inline";
import { Pill } from "../atoms/Pill";
import { Swatch } from "../atoms/Swatch";
import { Text } from "../atoms/Text";
import { ListItem, ListItemButton } from "./List";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface WorkItemRowProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"div">, "title" | "onClick">> {
  /** Work-item key, e.g. `ACME-45`. */
  itemId: string;
  title: React.ReactNode;
  /** Icon for the item type. */
  typeIcon: IconComponent;
  /** Label name and its swatch colour. */
  label: { name: string; color: string };
  /** Due date, already formatted. */
  due: string;
  /** Icon for the priority; `urgent` tints it as a warning. */
  priorityIcon: IconComponent;
  priority?: "normal" | "urgent";
  /** Accessible name of the priority button. */
  priorityLabel?: string;
  /** Assignee names; the first two show as avatars. */
  assignees: string[];
  /** Nesting depth: `1` for a top-level item, `2` for a sub-item (indented). @default 1 */
  level?: 1 | 2;
  onClick?: () => void;
}

/** One work item as a list row: type icon, key, title, then assignees, label, due date and priority. */
export function WorkItemRow({
  itemId,
  title,
  typeIcon,
  label,
  due,
  priorityIcon,
  priority = "normal",
  priorityLabel,
  assignees,
  level = 1,
  onClick,
  ...props
}: WorkItemRowProps) {
  return (
    <ListItem level={level === 2 ? 3 : 1} {...props}>
      <ListItemButton
        startIcon={<Icon icon={typeIcon} />}
        label={
          <>
            <Text color="tertiary" tabularNums>{itemId}</Text>{"  "}
            <Text color="primary">{title}</Text>
          </>
        }
        onClick={onClick}
      />
      <Inline gap="2" wrap={false} shrink={false}>
        <Box hideBelow="md">
          <AvatarGroup size="sm" max={2}>
            {assignees.map((name) => (
              <Avatar key={name} alt={name} />
            ))}
          </AvatarGroup>
        </Box>
        <Box hideBelow="md">
          <Pill size="sm" startIcon={<Swatch fill={label.color} />} label={label.name} />
        </Box>
        <Box hideBelow="sm">
          <Pill size="sm" startIcon={<Icon icon={CalendarDays} />} label={due} />
        </Box>
        <IconButton
          variant="secondary"
          size="sm"
          aria-label={priorityLabel ?? `Priority: ${priority}`}
          icon={<Icon icon={priorityIcon} tint={priority === "urgent" ? "danger" : "secondary"} />}
        />
      </Inline>
    </ListItem>
  );
}

/* __DOC_BLOCK
<div className="flex flex-col">
  <QUI.WorkItemRow
    itemId="ACME-23"
    title="Design empty state illustrations"
    typeIcon={Icons.Sun}
    label={{ name: "Enhancement", color: "var(--label-purple-icon)" }}
    due="22 Dec"
    priorityIcon={Icons.SignalHigh}
    assignees={["Ann Lee"]}
  />
  <QUI.WorkItemRow
    itemId="ACME-56"
    title="Product Tour"
    typeIcon={Icons.Sparkles}
    label={{ name: "Product", color: "var(--label-indigo-icon)" }}
    due="27 Apr"
    priorityIcon={Icons.CircleAlert}
    priority="urgent"
    assignees={["Kim Moss", "Ben Ray"]}
    level={2}
  />
</div>
DOC__ */
