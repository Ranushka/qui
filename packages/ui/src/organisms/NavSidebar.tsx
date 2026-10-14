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
