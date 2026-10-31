import * as React from "react";
import { Plus } from "../icons";
import type { NoClass } from "../lib/no-class";
import { Badge } from "../atoms/Badge";
import { Box } from "../atoms/Box";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { Inline } from "../atoms/Inline";
import { Text } from "../atoms/Text";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface StateGroupHeaderProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"div">, "children">> {
  /** Icon of the state, e.g. a dashed circle for Backlog. */
  icon: IconComponent;
  /** State name. */
  state: string;
  /** Number of items in the group. */
  count: number;
  /** `list` is a full-width strip above rows; `column` is the title of a board column with an add button. @default "list" */
  layout?: "list" | "column";
}

/** Title line of a group of work items: state icon, name and count (plus an add button in a board column). */
export function StateGroupHeader({ icon, state, count, layout = "list", ...props }: StateGroupHeaderProps) {
  if (layout === "column") {
    return (
      <Box paddingX="3" paddingY="2" {...props}>
        <Inline justify="between" wrap={false}>
          <Inline gap="2" wrap={false}>
            <Icon icon={icon} size="md" tint="secondary" />
            <Text weight="medium" color="primary">{state}</Text>
            <Badge size="xs" label={count} />
          </Inline>
          <IconButton variant="ghost" size="sm" aria-label={`Add to ${state}`} icon={<Icon icon={Plus} />} />
        </Inline>
      </Box>
    );
  }
  return (
    <Box background="layer-1" paddingX="4" paddingY="2" {...props}>
      <Inline gap="2" wrap={false}>
        <Icon icon={icon} size="md" tint="secondary" />
        <Text size="md" weight="medium">{state}</Text>
        <Text variant="caption" color="tertiary">{count}</Text>
      </Inline>
    </Box>
  );
}

/* __DOC_BLOCK
<div className="flex flex-col gap-2">
  <QUI.StateGroupHeader icon={Icons.CircleDashed} state="Backlog" count={8} />
  <QUI.StateGroupHeader icon={Icons.CircleDot} state="In Progress" count={3} layout="column" />
</div>
DOC__ */
