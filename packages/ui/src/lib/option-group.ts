import { cva } from "class-variance-authority";

/**
 * A stacked group of labeled option rows — shared verbatim by `CheckboxGroup` and `RadioGroup`.
 * `min-w-0` lets a long option label shrink instead of overflowing a constrained flex/grid parent.
 */
export const optionGroupVariants = cva("flex min-w-0 flex-col", {
  variants: {
    density: {
      comfortable: "gap-2",
      compact: "gap-0",
    },
  },
  defaultVariants: { density: "comfortable" },
});
