import * as React from "react";
import { cn } from "../lib/cn";
import { alignItemsClass, justifyClass, layoutClasses, listReset, type LayoutProps } from "../lib/layout";
import { gapClass, gapYClass, type Space } from "../lib/space";

export type InlineProps = LayoutProps & {
  /** Space between children, from the spacing scale. @default "2" */
  gap?: Space;
  /** Space between wrapped rows, when it should differ from `gap`. */
  rowGap?: Space;
  /** Cross-axis (vertical) alignment of children. @default "center" */
  align?: keyof typeof alignItemsClass;
  /** Main-axis (horizontal) distribution of children. */
  justify?: keyof typeof justifyClass;
  /** Let children flow onto more rows when they don't fit. Turn off for a single row where one child `grow`s and truncates. @default true */
  wrap?: boolean;
};

/**
 * Lays children out in a row with an even gap, wrapping when they don't fit: button rows, toolbars,
 * tag lists, label + value pairs. Use it instead of a `<div>` with flex classes.
 */
export const Inline = React.forwardRef<HTMLElement, InlineProps>(
  ({ gap = "2", rowGap, align = "center", justify, wrap = true, ...props }, ref) => {
    const { Tag, classes, rest } = layoutClasses(props);
    return (
      <Tag
        ref={ref as React.Ref<never>}
        className={cn(
          listReset(Tag),
          "flex flex-row",
          wrap ? "flex-wrap" : "flex-nowrap",
          gapClass[gap],
          rowGap && gapYClass[rowGap],
          alignItemsClass[align],
          justify && justifyClass[justify],
          ...classes
        )}
        {...rest}
      />
    );
  }
);
Inline.displayName = "Inline";

/* __DOC_BLOCK
<QUI.Stack gap="6" padding="4" width="full">
  <QUI.Inline gap="3">
    <QUI.Button label="Create issue" />
    <QUI.Button variant="secondary" label="Import" />
    <QUI.Button variant="tertiary" label="Export" />
  </QUI.Inline>
  <QUI.Inline gap="1.5">
    <QUI.Pill label="Frontend" />
    <QUI.Pill label="Bug" />
    <QUI.Pill label="High priority" />
  </QUI.Inline>
  <QUI.Inline justify="between" wrap={false} gap="4">
    <QUI.Box grow>
      <QUI.Text maxLines={1}>A long issue title that truncates instead of pushing the actions off the row</QUI.Text>
    </QUI.Box>
    <QUI.Text variant="caption" color="tertiary">WEB-142</QUI.Text>
  </QUI.Inline>
</QUI.Stack>
DOC__ */

/* __PROPS
{
  "gap / rowGap": ["0", "0.5", "1", "1.5", "2", "3", "4", "5", "6", "8", "10", "12", "16"],
  "align": ["start", "center", "end", "stretch", "baseline"],
  "justify": ["start", "center", "end", "between"],
  "wrap": "boolean",
  "padding / paddingX / paddingY": ["0", "0.5", "1", "1.5", "2", "3", "4", "5", "6", "8", "10", "12", "16"],
  "width": ["full", "auto", "3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
  "maxWidth": ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
  "grow": "boolean",
  "shrink": "boolean",
  "as": ["div", "section", "article", "header", "footer", "main", "nav", "aside", "ul", "ol", "li", "form"]
}
PROPS__ */
