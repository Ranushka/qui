import type * as React from "react";
import {
  paddingBottomClass,
  paddingClass,
  paddingEndClass,
  paddingStartClass,
  paddingTopClass,
  paddingXClass,
  paddingYClass,
  type Space,
} from "./space";

/**
 * Props every layout atom (Box, Stack, Inline, Grid) shares: the element, padding on the spacing
 * scale, and sizing on Tailwind's container scale. As with `space.ts`, every class is spelled out
 * so Tailwind can see it.
 */

export type LayoutTag =
  | "div" | "section" | "article" | "header" | "footer" | "main" | "nav" | "aside" | "ul" | "ol" | "li" | "form";

/** Tailwind's container scale: 3xs = 16rem, 2xs = 18rem, xs = 20rem, sm = 24rem, md = 28rem, lg = 32rem, xl = 36rem, 2xl = 42rem. */
export type ContainerSize = "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const widthClass: Record<ContainerSize | "full" | "auto", string> = {
  full: "w-full", auto: "w-auto",
  "3xs": "w-3xs", "2xs": "w-2xs", xs: "w-xs", sm: "w-sm", md: "w-md", lg: "w-lg", xl: "w-xl", "2xl": "w-2xl",
};

const heightClass = { full: "h-full", screen: "h-dvh" } as const;

/** Tailwind's breakpoints: sm = 40rem (640px), md = 48rem (768px), lg = 64rem (1024px). */
export type Breakpoint = "sm" | "md" | "lg";

const hideBelowClass: Record<Breakpoint, string> = { sm: "max-sm:hidden", md: "max-md:hidden", lg: "max-lg:hidden" };
const hideAboveClass: Record<Breakpoint, string> = { sm: "sm:hidden", md: "md:hidden", lg: "lg:hidden" };

const maxWidthClass: Record<ContainerSize, string> = {
  "3xs": "max-w-3xs", "2xs": "max-w-2xs", xs: "max-w-xs", sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "2xl": "max-w-2xl",
};

export type LayoutProps = Omit<React.HTMLAttributes<HTMLElement>, "className" | "style" | "color"> & {
  /** Element to render. Pick for meaning; looks come from the other props. @default "div" */
  as?: LayoutTag;
  padding?: Space;
  /** Overrides `padding` on the inline (left/right) sides. */
  paddingX?: Space;
  /** Overrides `padding` on the block (top/bottom) sides. */
  paddingY?: Space;
  /** Single-side overrides, e.g. indenting a nested row. Start/end are logical, so they flip in RTL. */
  paddingTop?: Space;
  paddingBottom?: Space;
  paddingStart?: Space;
  paddingEnd?: Space;
  /** Fixed width from the container scale, or fill the parent. */
  width?: keyof typeof widthClass;
  /** Cap the width from the container scale while still shrinking on narrow screens. */
  maxWidth?: ContainerSize;
  /** Fill the parent's height, or the viewport's (app shells). */
  height?: keyof typeof heightClass;
  /** Take the remaining space in a Stack column or Inline row, and let content inside truncate or scroll. */
  grow?: boolean;
  /** `false` keeps this element at its natural size when a Stack/Inline row runs out of space. @default true */
  shrink?: boolean;
  /** Hide on screens narrower than this breakpoint, e.g. a sidebar that phones don't show. */
  hideBelow?: Breakpoint;
  /** Hide from this breakpoint up, e.g. a menu button that only phones need. */
  hideAbove?: Breakpoint;
};

/** Splits the shared layout props off, returning their classes and the remaining props. */
export function layoutClasses<P extends LayoutProps>({
  as,
  padding,
  paddingX,
  paddingY,
  paddingTop,
  paddingBottom,
  paddingStart,
  paddingEnd,
  width,
  maxWidth,
  height,
  grow,
  shrink = true,
  hideBelow,
  hideAbove,
  ...rest
}: P) {
  const classes = [
    padding && paddingClass[padding],
    paddingX && paddingXClass[paddingX],
    paddingY && paddingYClass[paddingY],
    paddingTop && paddingTopClass[paddingTop],
    paddingBottom && paddingBottomClass[paddingBottom],
    paddingStart && paddingStartClass[paddingStart],
    paddingEnd && paddingEndClass[paddingEnd],
    width && widthClass[width],
    maxWidth && maxWidthClass[maxWidth],
    height && heightClass[height],
    grow && "min-h-0 min-w-0 flex-1",
    !shrink && "shrink-0",
    hideBelow && hideBelowClass[hideBelow],
    hideAbove && hideAboveClass[hideAbove],
  ];
  return { Tag: (as ?? "div") as LayoutTag, classes, rest };
}

export const alignItemsClass = {
  start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch", baseline: "items-baseline",
} as const;

export const justifyClass = {
  start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between",
} as const;

/** Resets the list styling `ul`/`ol` bring along, so a layout list looks like any other layout. */
export function listReset(tag: LayoutTag) {
  return (tag === "ul" || tag === "ol") && "m-0 list-none p-0";
}
