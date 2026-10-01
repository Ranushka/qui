import * as React from "react";
import { cn } from "../lib/cn";
import { layoutClasses, listReset, type LayoutProps } from "../lib/layout";

// Spelled out so Tailwind sees every class.
const backgroundClass = {
  canvas: "bg-canvas",
  "surface-1": "bg-surface-1",
  "surface-2": "bg-surface-2",
  "layer-1": "bg-layer-1",
  "layer-2": "bg-layer-2",
  "layer-3": "bg-layer-3",
} as const;

const borderColorClass = { subtle: "border-subtle", strong: "border-strong" } as const;

const borderEdgeClass = {
  all: "border",
  top: "border-t",
  bottom: "border-b",
  start: "border-s",
  end: "border-e",
} as const;

const radiusClass = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl", full: "rounded-full" } as const;

const shadowClass = {
  "raised-100": "shadow-raised-100",
  "raised-200": "shadow-raised-200",
  "raised-300": "shadow-raised-300",
  "overlay-100": "shadow-overlay-100",
  "overlay-200": "shadow-overlay-200",
} as const;

const overflowClass = { hidden: "overflow-hidden", auto: "overflow-auto" } as const;

export type BoxProps = LayoutProps & {
  /** Surface color token. Leave unset for a transparent box. */
  background?: keyof typeof backgroundClass;
  /** Border color token. Unset means no border. */
  border?: keyof typeof borderColorClass;
  /** Which edges get the border. @default "all" */
  borderEdge?: keyof typeof borderEdgeClass;
  /** @default false */
  dashed?: boolean;
  radius?: keyof typeof radiusClass;
  shadow?: keyof typeof shadowClass;
  /** Clip (e.g. a table inside a rounded card) or scroll content that overflows. */
  overflow?: keyof typeof overflowClass;
};

/**
 * A plain block with optional padding, surface color, border, radius and shadow — all from tokens.
 * Cards, panels, dialog footers, and wrappers that only need a width. Put a Stack or Inline inside
 * to arrange its content.
 */
export const Box = React.forwardRef<HTMLElement, BoxProps>(
  ({ background, border, borderEdge = "all", dashed, radius, shadow, overflow, ...props }, ref) => {
    const { Tag, classes, rest } = layoutClasses(props);
    return (
      <Tag
        ref={ref as React.Ref<never>}
        className={cn(
          listReset(Tag),
          "min-w-0",
          background && backgroundClass[background],
          border && cn(borderEdgeClass[borderEdge], borderColorClass[border], dashed && "border-dashed"),
          radius && radiusClass[radius],
          shadow && shadowClass[shadow],
          overflow && overflowClass[overflow],
          ...classes
        )}
        {...rest}
      />
    );
  }
);
Box.displayName = "Box";

/* __DOC_BLOCK
<QUI.Grid columns={3} collapseBelow="md" gap="4" padding="4" width="full">
  <QUI.Box background="layer-1" border="subtle" radius="lg" padding="4">
    <QUI.Text>Card: layer-1, subtle border, lg radius</QUI.Text>
  </QUI.Box>
  <QUI.Box background="surface-1" radius="lg" shadow="raised-200" padding="4">
    <QUI.Text>Raised: surface-1 with raised-200 shadow</QUI.Text>
  </QUI.Box>
  <QUI.Box border="subtle" dashed radius="lg" padding="6">
    <QUI.Text variant="caption" color="tertiary" align="center" as="p">Empty state drop zone</QUI.Text>
  </QUI.Box>
  <QUI.Box background="layer-1" border="subtle" radius="lg" overflow="hidden">
    <QUI.Box padding="4">
      <QUI.Text>Panel body</QUI.Text>
    </QUI.Box>
    <QUI.Box as="footer" border="subtle" borderEdge="top" background="layer-2" paddingX="4" paddingY="3">
      <QUI.Inline justify="end">
        <QUI.Button size="sm" label="Done" />
      </QUI.Inline>
    </QUI.Box>
  </QUI.Box>
</QUI.Grid>
DOC__ */

/* __PROPS
{
  "background": ["canvas", "surface-1", "surface-2", "layer-1", "layer-2", "layer-3"],
  "border": ["subtle", "strong"],
  "borderEdge": ["all", "top", "bottom", "start", "end"],
  "dashed": "boolean",
  "radius": ["sm", "md", "lg", "xl", "full"],
  "shadow": ["raised-100", "raised-200", "raised-300", "overlay-100", "overlay-200"],
  "overflow": ["hidden", "auto"],
  "padding / paddingX / paddingY": ["0", "0.5", "1", "1.5", "2", "3", "4", "5", "6", "8", "10", "12", "16"],
  "width": ["full", "auto", "3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
  "maxWidth": ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
  "grow": "boolean",
  "shrink": "boolean",
  "as": ["div", "section", "article", "header", "footer", "main", "nav", "aside", "ul", "ol", "li", "form"]
}
PROPS__ */
