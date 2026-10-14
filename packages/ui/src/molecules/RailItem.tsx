import * as React from "react";
import type { NoClass } from "../lib/no-class";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { Stack } from "../atoms/Stack";
import { Text } from "../atoms/Text";

export interface RailItemProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"li">, "children">> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Name under the icon; also the button's accessible name. */
  label: string;
  /** Marks the app you are in. */
  current?: boolean;
}

/** An app in the icon rail: icon button with its name beneath. Goes inside a list (`ul`) in a `nav`. */
export function RailItem({ icon, label, current, ...props }: RailItemProps) {
  return (
    <Stack as="li" align="center" gap="1" {...props}>
      <IconButton variant={current ? "secondary" : "ghost"} aria-label={label} showTooltip={false} icon={<Icon icon={icon} />} />
      <Text variant="caption" size="sm" color={current ? "primary" : "secondary"}>{label}</Text>
    </Stack>
  );
}
