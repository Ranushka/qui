import { cva } from "class-variance-authority";

/**
 * A stacked group of labeled option rows — shared verbatim by `CheckboxGroup` and `RadioGroup`.
 * `min-w-0` lets a long option label shrink instead of overflowing a constrained flex/grid parent.
 */
export const optionGroupVariants = cva("flex min-w-0", {
  variants: {
    density: {
      comfortable: "",
      compact: "",
    },
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row flex-wrap",
    },
  },
  compoundVariants: [
    { orientation: "vertical", density: "comfortable", className: "gap-2" },
    { orientation: "vertical", density: "compact", className: "gap-0" },
    { orientation: "horizontal", density: "comfortable", className: "gap-x-4 gap-y-2" },
    { orientation: "horizontal", density: "compact", className: "gap-x-2 gap-y-0" },
  ],
  defaultVariants: { density: "comfortable", orientation: "vertical" },
});
