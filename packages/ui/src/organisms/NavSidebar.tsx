import * as React from "react";
import type { NoClass } from "../lib/no-class";
import { Heading } from "../atoms/Heading";
import { Inline } from "../atoms/Inline";
import { Stack } from "../atoms/Stack";
import { Box } from "../atoms/Box";
import { Icon } from "../atoms/Icon";
import { List, ListCollapsedContext, ListItem, ListItemButton } from "../molecules/List";
import { ChevronsLeft, ChevronsRight } from "../icons";

export interface NavSidebarProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"div">, "title">> {
  /** Name of the app area, e.g. "Work". */
  title: React.ReactNode;
  /** Control at the end of the title row, e.g. a close button inside a drawer. */
  endAction?: React.ReactNode;
  /** Primary action under the title, usually a full-width `Button`. */
  action?: React.ReactNode;
  /** Navigation: `List`s and `ListSection`s. */
  children: React.ReactNode;
  /** Icons only: rows keep their icon with the label as a tooltip, sections become dividers, title and action hide. */
  collapsed?: boolean;
  /** Pins a Collapse / Expand row to the bottom; called with the new state. Leave out where it can't collapse, e.g. a drawer. */
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Content of an app's side navigation: title (with an optional end control), a primary action, then lists and
 * collapsible sections, scrolling between them; with `onCollapsedChange`, a Collapse / Expand row at the bottom.
 * Fills its container's height.
 */
export function NavSidebar({ title, endAction, action, collapsed = false, onCollapsedChange, children, ...props }: NavSidebarProps) {
  return (
    <ListCollapsedContext.Provider value={collapsed}>
      <Stack height="full" gap="0" {...props}>
        <Box grow overflow="auto">
          <Stack gap="4" padding={collapsed ? "2" : "3"}>
            {collapsed ? null : (
              <Inline justify="between" wrap={false} paddingStart="2">
                <Heading level={2} size={5}>{title}</Heading>
                {endAction}
              </Inline>
            )}
            {collapsed ? null : action}
            {children}
          </Stack>
        </Box>
        {onCollapsedChange ? (
          <Box padding={collapsed ? "2" : "3"}>
            <List aria-label="Sidebar">
              <ListItem>
                <ListItemButton
                  aria-expanded={!collapsed}
                  startIcon={<Icon icon={collapsed ? ChevronsRight : ChevronsLeft} />}
                  label={collapsed ? "Expand" : "Collapse"}
                  onClick={() => onCollapsedChange(!collapsed)}
                />
              </ListItem>
            </List>
          </Box>
        ) : null}
      </Stack>
    </ListCollapsedContext.Provider>
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
