import * as React from "react";
import type { NoClass } from "../lib/no-class";
import { Icon } from "../atoms/Icon";
import { Inline } from "../atoms/Inline";
import { Stack } from "../atoms/Stack";
import { Text } from "../atoms/Text";

export interface PropertyProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"div">, "children">> {
  /** Icon in front of the caption. */
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Caption above the value, e.g. "Due date". */
  label: string;
  /** The value: usually a `Pill`, or an `AvatarGroup` with names. */
  children: React.ReactNode;
}

/** A labelled value in a details panel: small icon + caption on top, the value beneath. */
export function Property({ icon, label, children, ...props }: PropertyProps) {
  return (
    <Stack gap="1.5" {...props}>
      <Inline gap="1.5" wrap={false}>
        <Icon icon={icon} size="xs" tint="tertiary" />
        <Text variant="caption" color="tertiary">{label}</Text>
      </Inline>
      <Inline gap="1.5">{children}</Inline>
    </Stack>
  );
}
