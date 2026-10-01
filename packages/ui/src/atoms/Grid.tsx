import * as React from "react";
import { cn } from "../lib/cn";
import { alignItemsClass, layoutClasses, listReset, type LayoutProps } from "../lib/layout";
import { gapClass, gapYClass, type Space } from "../lib/space";

type Columns = 1 | 2 | 3 | 4 | 5 | 6;
type Breakpoint = "sm" | "md" | "lg";

// Spelled out so Tailwind sees every class.
const columnsClass: Record<Columns, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6",
};
const columnsAtClass: Record<Breakpoint, Record<Columns, string>> = {
  sm: { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5", 6: "sm:grid-cols-6" },
  md: { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5", 6: "md:grid-cols-6" },
  lg: { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6" },
};

export type GridProps = LayoutProps & {
  /** Equal-width columns. @default 2 */
  columns?: Columns;
  /** Show a single column below this breakpoint (sm = 40rem, md = 48rem, lg = 64rem), so the grid stacks on phones. */
  collapseBelow?: Breakpoint;
  /** Space between cells, from the spacing scale. @default "4" */
  gap?: Space;
  /** Space between rows, when it should differ from `gap`. */
  rowGap?: Space;
  /** Vertical alignment of cells within their row. @default "stretch" */
  align?: keyof typeof alignItemsClass;
};

/**
 * Equal-width columns that can collapse to one column on small screens: dashboards, card grids,
 * side-by-side form sections.
 */
export const Grid = React.forwardRef<HTMLElement, GridProps>(
  ({ columns = 2, collapseBelow, gap = "4", rowGap, align, ...props }, ref) => {
    const { Tag, classes, rest } = layoutClasses(props);
    return (
      <Tag
        ref={ref as React.Ref<never>}
        className={cn(
          listReset(Tag),
          "grid",
          collapseBelow ? cn("grid-cols-1", columnsAtClass[collapseBelow][columns]) : columnsClass[columns],
          gapClass[gap],
          rowGap && gapYClass[rowGap],
          align && alignItemsClass[align],
          ...classes
        )}
        {...rest}
      />
    );
  }
);
Grid.displayName = "Grid";

/* __DOC_BLOCK
<QUI.Grid columns={3} collapseBelow="md" gap="4" padding="4" width="full">
  {["Open", "In progress", "Done"].map((title, i) => (
    <QUI.Box key={title} background="layer-1" border="subtle" radius="lg" padding="4">
      <QUI.Stack gap="1">
        <QUI.Text variant="caption" color="tertiary">{title}</QUI.Text>
        <QUI.Heading level={4}>{[24, 8, 112][i]}</QUI.Heading>
      </QUI.Stack>
    </QUI.Box>
  ))}
</QUI.Grid>
DOC__ */

/* __PROPS
{
  "columns": [1, 2, 3, 4, 5, 6],
  "collapseBelow": ["sm", "md", "lg"],
  "gap / rowGap": ["0", "0.5", "1", "1.5", "2", "3", "4", "5", "6", "8", "10", "12", "16"],
  "align": ["start", "center", "end", "stretch", "baseline"],
  "padding / paddingX / paddingY": ["0", "0.5", "1", "1.5", "2", "3", "4", "5", "6", "8", "10", "12", "16"],
  "width": ["full", "auto", "3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
  "maxWidth": ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
  "as": ["div", "section", "article", "header", "footer", "main", "nav", "aside", "ul", "ol", "li", "form"]
}
PROPS__ */
