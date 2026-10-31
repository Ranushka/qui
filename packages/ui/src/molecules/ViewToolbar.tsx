import * as React from "react";
import { ChartColumn, Kanban, List, ListFilter, Plus, SlidersHorizontal, SquareStack } from "../icons";
import type { NoClass } from "../lib/no-class";
import { Badge } from "../atoms/Badge";
import { Box } from "../atoms/Box";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { Inline } from "../atoms/Inline";
import { Text } from "../atoms/Text";
import { Menu, MenuContent, MenuGroupLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "./Menu";

type ViewLayout = "list" | "board";

const layoutIcon = { list: List, board: Kanban };
const layoutLabel = { list: "List", board: "Board" };

export interface ViewToolbarProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"div">, "children">> {
  /** Current way of showing the items; the menu lists both. */
  layout: ViewLayout;
  /** Number of items, shown in the badge. */
  count: number;
  /** Title next to the count. @default "Work items" */
  title?: string;
  /** Label of the primary action; on narrow screens it collapses to a plus button. @default "Add work item" */
  actionLabel?: string;
}

/** The strip above a list or board: title with count on the left, layout menu, filter/display/analytics buttons and the primary action on the right. */
export function ViewToolbar({ layout, count, title = "Work items", actionLabel = "Add work item", ...props }: ViewToolbarProps) {
  return (
    <Inline justify="between" wrap={false} gap="4" paddingX="4" paddingY="3" {...props}>
      <Inline gap="2" wrap={false}>
        <Icon icon={SquareStack} size="md" tint="secondary" />
        <Text size="md" weight="medium">{title}</Text>
        <Badge size="sm" variant="brand" label={count} />
      </Inline>
      <Inline gap="2" wrap={false}>
        <Menu>
          <MenuTrigger render={<Button variant="secondary" icon={<Icon icon={layoutIcon[layout]} />} label={layoutLabel[layout]} />} />
          <MenuContent>
            <MenuRadioGroup defaultValue={layout}>
              <MenuGroupLabel>Show as</MenuGroupLabel>
              <MenuRadioItem value="list">List</MenuRadioItem>
              <MenuRadioItem value="board">Board</MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
        <IconButton variant="secondary" aria-label="Filters" icon={<Icon icon={ListFilter} />} />
        <Box hideBelow="sm">
          <IconButton variant="secondary" aria-label="Display" icon={<Icon icon={SlidersHorizontal} />} />
        </Box>
        <Box hideBelow="sm">
          <IconButton variant="secondary" aria-label="Analytics" icon={<Icon icon={ChartColumn} />} />
        </Box>
        <Box hideBelow="sm">
          <Button label={actionLabel} />
        </Box>
        <Box hideAbove="sm">
          <IconButton aria-label={actionLabel} icon={<Icon icon={Plus} />} />
        </Box>
      </Inline>
    </Inline>
  );
}

/* __DOC_BLOCK
<div className="flex flex-col gap-2">
  <QUI.ViewToolbar layout="list" count={19} />
  <QUI.ViewToolbar layout="board" count={19} title="Board" actionLabel="New item" />
</div>
DOC__ */
