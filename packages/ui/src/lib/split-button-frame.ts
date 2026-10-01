import { cva } from "class-variance-authority";

/**
 * The frame around a split button's two segments (main action + menu trigger), shared by
 * `SplitButton` and `IconSplitButton`. It only reshapes the segments' own control chrome: their
 * facing corners go square, the outer corners keep the segment radius. `primary` holds the two
 * filled pills 1px apart; `secondary` collapses the shared border into a single divider so they
 * read as one connected outline (dimmed while either half is disabled). A focused segment is
 * lifted so its ring isn't covered by its neighbor.
 */
export const splitButtonFrameVariants = cva("isolate inline-flex items-stretch [&>*:focus-visible]:z-10", {
  variants: {
    variant: {
      primary: "gap-px [&>*:first-child]:rounded-e-none [&>*+*]:rounded-s-none",
      secondary:
        "[&>*:first-child]:rounded-e-none [&>*+*]:rounded-s-none [&>*:first-child]:border-e [&>*+*]:border-s-0 [&:has(:disabled)>*:first-child]:border-e-subtle",
    },
  },
  defaultVariants: { variant: "primary" },
});

export type SplitButtonVariant = "primary" | "secondary";
export type SplitButtonSize = "sm" | "md" | "lg";
