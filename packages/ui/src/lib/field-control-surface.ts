import { cva } from "class-variance-authority";

/**
 * The shared bordered field-control surface: a `layer-2` fill with a `border-sm` that rests
 * `subtle-1` and lights to `accent-strong` + a soft ring on focus. Shared by every bordered control
 * (Input, TextArea, NumberField, ...) — each composes this and adds its own geometry.
 *
 * `focus` picks which pseudo the accent border+ring keys off: `within` for a box wrapping a
 * separately-focusable control, `visible` for a control that is itself focusable, `self` for a bare
 * focusable cell, or `none`.
 */
export const fieldControlSurfaceVariants = cva("border-sm border-subtle-1 bg-layer-2 has-[[data-invalid]]:border-danger-strong data-invalid:border-danger-strong", {
  variants: {
    focus: {
      within:
        "focus-within:border-accent-strong focus-within:ring-2 focus-within:ring-accent-strong/20 has-[[data-invalid]]:focus-within:border-danger-strong has-[[data-invalid]]:focus-within:ring-danger-strong/20",
      visible:
        "focus-visible:border-accent-strong focus-visible:ring-2 focus-visible:ring-accent-strong/20 data-invalid:focus-visible:border-danger-strong data-invalid:focus-visible:ring-danger-strong/20",
      self: "focus:border-accent-strong focus:ring-2 focus:ring-accent-strong/20 data-invalid:focus:border-danger-strong data-invalid:focus:ring-danger-strong/20",
      none: "",
    },
  },
});
