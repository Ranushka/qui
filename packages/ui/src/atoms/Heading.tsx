import * as React from "react";
import { cn } from "../lib/cn";
import { headingStyles, resolveWeight, textColorClass, type FontWeight, type TextColor } from "../lib/typography";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const alignClass = { start: "text-start", center: "text-center", end: "text-end" } as const;

export interface HeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "className" | "style" | "color"> {
  /** Document outline level — renders `<h1>`…`<h6>`. */
  level: HeadingLevel;
  /** Visual size from the heading scale, when it should differ from `level`. @default level */
  size?: HeadingLevel;
  /** @default "semibold" */
  weight?: FontWeight;
  /** @default "primary" */
  color?: TextColor;
  align?: keyof typeof alignClass;
  /** Cut overflow to one line with an ellipsis. */
  truncate?: boolean;
}

/**
 * A section heading from the design's h1–h6 scale. `level` sets the semantic tag; `size` lets the
 * look differ from the outline (e.g. an `<h2>` that reads as h4 inside a card).
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, size, weight = "semibold", color = "primary", align, truncate, ...props }, ref) => {
    const Tag = `h${level}` as const;
    return (
      <Tag
        ref={ref}
        className={cn("m-0", resolveWeight(headingStyles[size ?? level], weight), textColorClass[color], align && alignClass[align], truncate && "truncate")}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

/* __DOC_BLOCK
<div className="flex w-full flex-col gap-3 p-4">
  <QUI.Heading level={1}>Heading 1</QUI.Heading>
  <QUI.Heading level={2}>Heading 2</QUI.Heading>
  <QUI.Heading level={3}>Heading 3</QUI.Heading>
  <QUI.Heading level={4}>Heading 4</QUI.Heading>
  <QUI.Heading level={5}>Heading 5</QUI.Heading>
  <QUI.Heading level={6}>Heading 6</QUI.Heading>
  <div className="flex flex-wrap items-baseline gap-4">
    <QUI.Heading level={3} weight="regular">Regular</QUI.Heading>
    <QUI.Heading level={3} weight="medium">Medium</QUI.Heading>
    <QUI.Heading level={3} weight="semibold">Semibold</QUI.Heading>
    <QUI.Heading level={3} weight="bold">Bold</QUI.Heading>
  </div>
  <QUI.Heading level={2} size={5} color="secondary">An h2 that looks like h5</QUI.Heading>
</div>
DOC__ */

/* __PROPS
{
  "level": [1, 2, 3, 4, 5, 6],
  "size": [1, 2, 3, 4, 5, 6],
  "weight": ["regular", "medium", "semibold", "bold"],
  "color": ["primary", "secondary", "tertiary", "accent", "danger", "success", "warning", "info", "on-color", "inverse", "inherit"],
  "align": ["start", "center", "end"],
  "truncate": "boolean"
}
PROPS__ */
