import * as React from "react";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * The track. Stays transparent; the gutter is stable across states and rides the
 * `--scrollbar-track-*` / `--scrollbar-pad` tokens: `sm` 12px → 4px thumb, `md` 14 → 6, `lg` 16 → 8.
 * `auto` hides it at rest and reveals it while hovered or scrolling; `always` keeps it shown.
 */
const scrollbarVariants = cva(
  cn(
    "flex touch-none transition-opacity duration-150 ease-out select-none data-scrolling:duration-0",
    "data-[orientation=horizontal]:flex-col data-[orientation=vertical]:flex-row"
  ),
  {
    variants: {
      visibility: {
        auto: cn(
          "pointer-events-none opacity-0",
          "data-hovering:pointer-events-auto data-hovering:opacity-100",
          "data-scrolling:pointer-events-auto data-scrolling:opacity-100"
        ),
        always: "opacity-100",
      },
      size: {
        sm: cn(
          "data-[orientation=vertical]:w-(--scrollbar-track-sm) data-[orientation=vertical]:px-(--scrollbar-pad) data-[orientation=vertical]:py-0.5",
          "data-[orientation=horizontal]:h-(--scrollbar-track-sm) data-[orientation=horizontal]:px-0.5 data-[orientation=horizontal]:py-(--scrollbar-pad)"
        ),
        md: cn(
          "data-[orientation=vertical]:w-(--scrollbar-track-md) data-[orientation=vertical]:px-(--scrollbar-pad) data-[orientation=vertical]:py-0.5",
          "data-[orientation=horizontal]:h-(--scrollbar-track-md) data-[orientation=horizontal]:px-0.5 data-[orientation=horizontal]:py-(--scrollbar-pad)"
        ),
        lg: cn(
          "data-[orientation=vertical]:w-(--scrollbar-track-lg) data-[orientation=vertical]:px-(--scrollbar-pad) data-[orientation=vertical]:py-0.5",
          "data-[orientation=horizontal]:h-(--scrollbar-track-lg) data-[orientation=horizontal]:px-0.5 data-[orientation=horizontal]:py-(--scrollbar-pad)"
        ),
      },
    },
    defaultVariants: { visibility: "auto", size: "sm" },
  }
);

const scrollbarThumbClass = "flex-1 rounded-full bg-scrollbar-thumb transition-colors hover:bg-scrollbar-thumb-hover active:bg-scrollbar-thumb-active";

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";
export type ScrollAreaScrollbarVisibility = "auto" | "always";
export type ScrollAreaScrollbarSize = "sm" | "md" | "lg";

export interface ScrollAreaProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseScrollArea.Root>, "children"> {
  /**
   * Which axes scroll (required — no silent default). `vertical`/`horizontal` render one
   * scrollbar; `both` renders both plus the corner. Render only the axes the content can overflow.
   */
  orientation: ScrollAreaOrientation;
  /** `auto` hides the scrollbar at rest and reveals it on hover/scroll; `always` keeps it shown. @default "auto" */
  visibility?: ScrollAreaScrollbarVisibility;
  /** Scrollbar gutter: `sm` 12px / 4px thumb, `md` 14 / 6, `lg` 16 / 8. @default "sm" */
  size?: ScrollAreaScrollbarSize;
  /** Ref to the scrolling viewport — for scroll restoration or a virtualizer's scroll element. */
  viewportRef?: React.Ref<HTMLDivElement>;
  /** The scrollable content. */
  children: React.ReactNode;
}

/**
 * A scroll container with an overlay scrollbar, on Base UI's `ScrollArea`. Wrap any overflowing
 * content (panels, menus, long lists). Place it in a height-constrained flex column — it grows to
 * fill the column and its viewport scrolls when the content overflows.
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ orientation, visibility = "auto", size = "sm", viewportRef, className, children, ...props }, ref) => {
    const scrollbarClass = scrollbarVariants({ visibility, size });
    return (
      <BaseScrollArea.Root ref={ref} className={cn("relative flex min-h-0 flex-1 flex-col", className)} {...props}>
        <BaseScrollArea.Viewport ref={viewportRef} className="min-h-0 flex-1 overscroll-contain rounded-[inherit] outline-none">
          {children}
        </BaseScrollArea.Viewport>
        {orientation !== "horizontal" ? (
          <BaseScrollArea.Scrollbar orientation="vertical" className={scrollbarClass}>
            <BaseScrollArea.Thumb className={scrollbarThumbClass} />
          </BaseScrollArea.Scrollbar>
        ) : null}
        {orientation !== "vertical" ? (
          <BaseScrollArea.Scrollbar orientation="horizontal" className={scrollbarClass}>
            <BaseScrollArea.Thumb className={scrollbarThumbClass} />
          </BaseScrollArea.Scrollbar>
        ) : null}
        {orientation === "both" ? <BaseScrollArea.Corner className="pointer-events-none bg-transparent" /> : null}
      </BaseScrollArea.Root>
    );
  }
);
ScrollArea.displayName = "ScrollArea";

/* __DOC_BLOCK
<div className="flex flex-wrap gap-6 p-4">
  <div className="flex h-48 w-64 flex-col rounded-lg border border-subtle bg-layer-1">
    <QUI.ScrollArea orientation="vertical">
      <div className="flex flex-col gap-2 p-3 text-body-sm-regular text-secondary">
        <p>Cycles group work into time-boxed iterations.</p>
        <p>Modules group work by feature or deliverable.</p>
        <p>Views save a filtered slice of work items.</p>
        <p>Pages hold long-form notes and specs.</p>
        <p>Intake collects requests from outside the team.</p>
        <p>Estimates size work in points or hours.</p>
        <p>Labels tag work items across projects.</p>
      </div>
    </QUI.ScrollArea>
  </div>
  <div className="flex h-48 w-64 flex-col rounded-lg border border-subtle bg-layer-1">
    <QUI.ScrollArea orientation="both" visibility="always" size="md">
      <div className="w-[32rem] p-3 text-body-sm-regular text-secondary">
        <p>Scroll both ways — this block is wider and taller than its frame, so both scrollbars and the corner render.</p>
        <p className="mt-24">Bottom of the content.</p>
      </div>
    </QUI.ScrollArea>
  </div>
</div>
DOC__ */

/* __PROPS
{ "orientation": ["vertical", "horizontal", "both"], "visibility": ["auto", "always"], "size": ["sm", "md", "lg"] }
PROPS__ */
