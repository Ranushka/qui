import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

const skeletonVariants = cva("animate-pulse motion-reduce:animate-none", {
  variants: {
    layout: {
      stack: "flex flex-col gap-2",
      row: "flex flex-row gap-2",
    },
  },
  defaultVariants: { layout: "stack" },
});

const skeletonItemVariants = cva("bg-layer-1", {
  variants: {
    variant: {
      bar: "rounded-md",
      circle: "shrink-0 rounded-full",
    },
  },
  defaultVariants: { variant: "bar" },
});

interface SizeProps {
  /** Exact height, e.g. `"1rem"`. Omit to fill a sized region, or (with no region size) hold one text line. */
  blockSize?: string;
  /** Exact width, e.g. `"12rem"`. Takes priority over `stretch`. */
  inlineSize?: string;
  /** `full` fills the row; `fit` sizes to content. Ignored when `inlineSize` is set. @default "fit" */
  stretch?: "full" | "fit";
}

function sizeStyle(baseClassName: string, { blockSize, inlineSize, stretch }: SizeProps, blockFallbackClassName: string) {
  return {
    className: cn(
      baseClassName,
      blockSize != null ? "h-(--skeleton-block-size)" : blockFallbackClassName,
      inlineSize != null ? "w-(--skeleton-inline-size)" : stretch === "full" ? "w-full" : "w-fit"
    ),
    style: {
      ...(blockSize != null ? { "--skeleton-block-size": blockSize } : {}),
      ...(inlineSize != null ? { "--skeleton-inline-size": inlineSize } : {}),
    } as React.CSSProperties,
  };
}

export interface SkeletonProps extends NoClass<React.HTMLAttributes<HTMLDivElement>>, SizeProps {
  /** Flex axis for the bones inside. @default "stack" */
  layout?: "stack" | "row";
  /** Names the loading region — required so it's never announced unnamed. */
  "aria-label": string;
}

/** A pulse-animated loading region that groups placeholder bones (`SkeletonItem` children). */
export function Skeleton({ layout = "stack", blockSize, inlineSize, stretch, children, ...props }: SkeletonProps) {
  const { className: cls, style } = sizeStyle(skeletonVariants({ layout }), { blockSize, inlineSize, stretch }, "");
  return (
    <div role="status" className={cn(cls)} style={style} {...props}>
      {children}
    </div>
  );
}

export interface SkeletonItemProps extends NoClass<React.HTMLAttributes<HTMLDivElement>>, NoClass<Omit<SizeProps, "stretch">> {
  /** `bar` for rounded rectangles, `circle` for a disc (e.g. an avatar placeholder). @default "bar" */
  variant?: "bar" | "circle";
}

/** One decorative bone inside a `Skeleton` region. */
export function SkeletonItem({ variant = "bar", blockSize, inlineSize, ...props }: SkeletonItemProps) {
  const { className: cls, style } = sizeStyle(skeletonItemVariants({ variant }), { blockSize, inlineSize, stretch: "full" }, "h-full min-h-4");
  return <div className={cn(cls)} style={style} {...props} />;
}

/* __DOC_BLOCK
<div className="flex flex-col gap-6 p-4">
  <QUI.Skeleton aria-label="Loading card" inlineSize="16rem">
    <QUI.SkeletonItem blockSize="1.25rem" />
    <QUI.SkeletonItem blockSize="0.875rem" inlineSize="10rem" />
  </QUI.Skeleton>
  <QUI.Skeleton aria-label="Loading profile" layout="row">
    <QUI.SkeletonItem variant="circle" inlineSize="2.5rem" blockSize="2.5rem" />
    <QUI.Skeleton aria-label="" inlineSize="12rem">
      <QUI.SkeletonItem blockSize="1rem" />
      <QUI.SkeletonItem blockSize="0.875rem" inlineSize="8rem" />
    </QUI.Skeleton>
  </QUI.Skeleton>
</div>
DOC__ */

/* __PROPS
{ "layout": ["stack", "row"], "stretch": ["full", "fit"] }
PROPS__ */
