import * as React from "react";
import { cn } from "../lib/cn";
import { alignItemsClass, justifyClass, layoutClasses, listReset, type LayoutProps } from "../lib/layout";
import { gapClass, type Space } from "../lib/space";

export type StackProps = LayoutProps & {
  /** Space between children, from the spacing scale. @default "0" */
  gap?: Space;
  /** Cross-axis (horizontal) alignment of children. @default "stretch" */
  align?: keyof typeof alignItemsClass;
  /** Main-axis (vertical) distribution of children. */
  justify?: keyof typeof justifyClass;
};

/**
 * Lays children out top to bottom with an even gap. The building block for page sections, forms
 * and card bodies — use it instead of a `<div>` with flex classes.
 */
export const Stack = React.forwardRef<HTMLElement, StackProps>(({ gap = "0", align, justify, ...props }, ref) => {
  const { Tag, classes, rest } = layoutClasses(props);
  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn(listReset(Tag), "flex flex-col", gapClass[gap], align && alignItemsClass[align], justify && justifyClass[justify], ...classes)}
      {...rest}
    />
  );
});
Stack.displayName = "Stack";

/* __DOC_BLOCK
<QUI.Stack gap="6" padding="4" maxWidth="md">
  <QUI.Stack gap="1">
    <QUI.Heading level={3}>Project settings</QUI.Heading>
    <QUI.Text color="secondary">Stack puts children in a column with a gap from the spacing scale.</QUI.Text>
  </QUI.Stack>
  <QUI.InputField label="Name" placeholder="Website redesign" />
  <QUI.InputField label="Identifier" placeholder="WEB" />
  <QUI.Inline justify="end" gap="2">
    <QUI.Button variant="secondary" label="Cancel" />
    <QUI.Button label="Save" />
  </QUI.Inline>
</QUI.Stack>
DOC__ */

/* __PROPS
{
  "gap": ["0", "0.5", "1", "1.5", "2", "3", "4", "5", "6", "8", "10", "12", "16"],
  "align": ["start", "center", "end", "stretch", "baseline"],
  "justify": ["start", "center", "end", "between"],
  "padding / paddingX / paddingY": ["0", "0.5", "1", "1.5", "2", "3", "4", "5", "6", "8", "10", "12", "16"],
  "width": ["full", "auto", "3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
  "maxWidth": ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
  "grow": "boolean",
  "shrink": "boolean",
  "as": ["div", "section", "article", "header", "footer", "main", "nav", "aside", "ul", "ol", "li", "form"]
}
PROPS__ */
