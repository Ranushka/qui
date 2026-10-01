import * as React from "react";
import { cn } from "../lib/cn";
import { bodyStyles, captionStyles, resolveWeight, textColorClass, type FontWeight, type TextColor } from "../lib/typography";

type TextTag = "span" | "p" | "div" | "label" | "strong" | "em" | "small" | "li" | "dt" | "dd" | "figcaption" | "legend";

type BodySize = keyof typeof bodyStyles;
type CaptionSize = keyof typeof captionStyles;

type TextVariantProps =
  | {
      /** Running text. @default "body" */
      variant?: "body";
      /** @default "sm" */
      size?: BodySize;
    }
  | {
      /** Small supporting text: metadata, helper copy, labels on dense UI. */
      variant: "caption";
      /** @default "md" */
      size?: CaptionSize;
    };

const alignClass = { start: "text-start", center: "text-center", end: "text-end" } as const;
const clampClass = { 1: "truncate", 2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4" } as const;

export type TextProps = TextVariantProps &
  Omit<React.HTMLAttributes<HTMLElement>, "className" | "style" | "color"> & {
    /** Element to render. Pick for meaning (paragraph, label, list item); looks come from the other props. @default "span" */
    as?: TextTag;
    /** Falls back to the nearest lighter weight the style defines (e.g. 2xs has no `bold`). @default "regular" */
    weight?: FontWeight;
    /** @default "inherit" */
    color?: TextColor;
    align?: keyof typeof alignClass;
    /** Cut overflow with an ellipsis after this many lines. */
    maxLines?: keyof typeof clampClass;
    /** Monospaced figures so numbers line up in columns. */
    tabularNums?: boolean;
    /** `for` when rendered `as="label"`. */
    htmlFor?: string;
  };

/**
 * Body and caption copy from the design's type scale. The only way to set text size, weight and
 * color in qui — every combination maps to a token, so text can't drift off the scale.
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as: Tag = "span", variant = "body", size, weight = "regular", color = "inherit", align, maxLines, tabularNums, ...props }, ref) => {
    const styles = variant === "caption" ? captionStyles[(size as CaptionSize) ?? "md"] : bodyStyles[(size as BodySize) ?? "sm"];
    return (
      <Tag
        ref={ref as React.Ref<never>}
        className={cn(
          resolveWeight(styles, weight),
          textColorClass[color],
          align && alignClass[align],
          maxLines && clampClass[maxLines],
          tabularNums && "tabular-nums",
          Tag !== "span" && Tag !== "strong" && Tag !== "em" && Tag !== "small" && Tag !== "label" && "m-0"
        )}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

/* __DOC_BLOCK
<div className="flex w-full flex-col gap-6 p-4">
  <div className="flex flex-col gap-1">
    <QUI.Text size="md">Body md — The quick brown fox jumps over the lazy dog.</QUI.Text>
    <QUI.Text size="sm">Body sm — The quick brown fox jumps over the lazy dog.</QUI.Text>
    <QUI.Text size="xs">Body xs — The quick brown fox jumps over the lazy dog.</QUI.Text>
    <QUI.Text size="2xs">Body 2xs — The quick brown fox jumps over the lazy dog.</QUI.Text>
  </div>
  <div className="flex flex-col gap-1">
    <QUI.Text variant="caption" size="md">Caption md — Updated 3 minutes ago</QUI.Text>
    <QUI.Text variant="caption" size="sm">Caption sm — Updated 3 minutes ago</QUI.Text>
    <QUI.Text variant="caption" size="xs">Caption xs — Updated 3 minutes ago</QUI.Text>
    <QUI.Text variant="caption" size="2xs">Caption 2xs — Updated 3 minutes ago</QUI.Text>
    <QUI.Text variant="caption" size="3xs">Caption 3xs — Updated 3 minutes ago</QUI.Text>
  </div>
  <div className="flex flex-wrap gap-4">
    <QUI.Text weight="regular">Regular</QUI.Text>
    <QUI.Text weight="medium">Medium</QUI.Text>
    <QUI.Text weight="semibold">Semibold</QUI.Text>
    <QUI.Text weight="bold">Bold</QUI.Text>
  </div>
  <div className="flex flex-wrap gap-4">
    <QUI.Text color="primary">primary</QUI.Text>
    <QUI.Text color="secondary">secondary</QUI.Text>
    <QUI.Text color="tertiary">tertiary</QUI.Text>
    <QUI.Text color="placeholder">placeholder</QUI.Text>
    <QUI.Text color="disabled">disabled</QUI.Text>
    <QUI.Text color="accent">accent</QUI.Text>
    <QUI.Text color="link">link</QUI.Text>
    <QUI.Text color="success">success</QUI.Text>
    <QUI.Text color="warning">warning</QUI.Text>
    <QUI.Text color="danger">danger</QUI.Text>
    <QUI.Text color="info">info</QUI.Text>
  </div>
  <div className="w-64">
    <QUI.Text as="p" color="secondary" maxLines={2}>
      A long description that wraps onto a second line and then gets cut with an ellipsis instead of pushing the layout around.
    </QUI.Text>
  </div>
</div>
DOC__ */

/* __PROPS
{
  "variant": ["body", "caption"],
  "size (body)": ["2xs", "xs", "sm", "md"],
  "size (caption)": ["3xs", "2xs", "xs", "sm", "md"],
  "weight": ["regular", "medium", "semibold", "bold"],
  "color": ["primary", "secondary", "tertiary", "placeholder", "disabled", "accent", "danger", "success", "warning", "info", "link", "on-color", "inverse", "inherit"],
  "align": ["start", "center", "end"],
  "maxLines": [1, 2, 3, 4],
  "tabularNums": "boolean",
  "as": ["span", "p", "div", "label", "strong", "em", "small", "li", "dt", "dd", "figcaption", "legend"]
}
PROPS__ */
