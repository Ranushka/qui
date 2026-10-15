import * as React from "react";
import { PanelLeft, SlidersHorizontal } from "lucide-react";
import type { NoClass } from "../lib/no-class";
import { Heading } from "../atoms/Heading";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { Inline } from "../atoms/Inline";
import { Stack } from "../atoms/Stack";

export interface NavSidebarProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"div">, "title">> {
  /** Name of the app area, e.g. "Work". */
  title: React.ReactNode;
  /** Replaces the "Collapse sidebar" button, e.g. a close button inside a drawer. */
  endAction?: React.ReactNode;
  /** Primary action under the title, usually a full-width `Button`. */
  action?: React.ReactNode;
  /** Navigation: `List`s and `ListSection`s. */
  children: React.ReactNode;
}

/** Content of an app's side navigation: title with customize and collapse buttons, a primary action, then lists and collapsible sections. */
export function NavSidebar({ title, endAction, action, children, ...props }: NavSidebarProps) {
  return (
    <Stack gap="4" padding="3" {...props}>
      <Inline justify="between" wrap={false} paddingStart="2">
        <Heading level={2} size={5}>{title}</Heading>
        <Inline gap="1" wrap={false}>
          <IconButton variant="ghost" size="sm" aria-label="Customize" icon={<Icon icon={SlidersHorizontal} />} />
          {endAction ?? <IconButton variant="ghost" size="sm" aria-label="Collapse sidebar" icon={<Icon icon={PanelLeft} />} />}
        </Inline>
      </Inline>
      {action}
      {children}
    </Stack>
  );
}

/* __DOC
<div className="w-64 rounded-lg border border-subtle">
  <QUI.NavSidebar title="Work" action={<QUI.Button variant="secondary" stretch="full" icon={<QUI.Icon icon={Icons.SquarePen} />} label="New work item" />}>
    <QUI.List aria-label="Main">
      <QUI.ListItem>
        <QUI.ListItemButton startIcon={<QUI.Icon icon={Icons.House} />} label="Home" />
      </QUI.ListItem>
      <QUI.ListItem>
        <QUI.ListItemButton aria-current="page" startIcon={<QUI.Icon icon={Icons.UserRound} />} label="Your work" />
      </QUI.ListItem>
    </QUI.List>
  </QUI.NavSidebar>
</div>
DOC__ */
