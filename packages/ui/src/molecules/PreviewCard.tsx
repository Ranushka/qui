import * as React from "react";
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import { cn } from "../lib/cn";

/** Same raised surface as `Popover`'s compact `text` variant: 296px card, overlay elevation, scale-in. */
const previewCardPopupClass = cn(
  "w-74 rounded-lg border-sm border-subtle-1 bg-layer-2 shadow-overlay-200 outline-none",
  "origin-(--transform-origin) transition-[opacity,transform] duration-150 motion-reduce:transition-none",
  "data-starting-style:scale-95 data-starting-style:opacity-0",
  "data-ending-style:scale-95 data-ending-style:opacity-0"
);

/** The root — Base UI's `PreviewCard.Root` (state only, renders nothing). Pass `delay`/`closeDelay` on the trigger. */
export const PreviewCard = BasePreviewCard.Root;

/**
 * Base UI's detached-handle API: create a handle outside the tree, pass it as the root's `handle`,
 * and drive one shared card from many launch points.
 */
export const createPreviewCardHandle = BasePreviewCard.createHandle;

export interface PreviewCardTriggerProps extends React.ComponentPropsWithoutRef<typeof BasePreviewCard.Trigger> {}

/** The link that opens the card on hover or focus. Renders an `<a>`; use `render` to project it onto your own link. */
export const PreviewCardTrigger = React.forwardRef<HTMLAnchorElement, PreviewCardTriggerProps>((props, ref) => (
  <BasePreviewCard.Trigger ref={ref} {...props} />
));
PreviewCardTrigger.displayName = "PreviewCardTrigger";

export interface PreviewCardContentProps
  extends Pick<
      React.ComponentPropsWithoutRef<typeof BasePreviewCard.Positioner>,
      | "side"
      | "sideOffset"
      | "align"
      | "alignOffset"
      | "collisionPadding"
      | "collisionBoundary"
      | "collisionAvoidance"
      | "sticky"
      | "positionMethod"
      | "anchor"
      | "disableAnchorTracking"
    >,
    React.ComponentPropsWithoutRef<typeof BasePreviewCard.Popup> {}

/**
 * The anchored card: `Portal` → `Positioner` → the styled popup. Positioning props go to the
 * positioner, everything else to the popup. No backdrop — a preview card is a non-modal,
 * hover-triggered rich tooltip, not a dialog.
 */
export const PreviewCardContent = React.forwardRef<HTMLDivElement, PreviewCardContentProps>(
  (
    {
      side = "bottom",
      sideOffset = 4,
      align = "center",
      alignOffset,
      collisionPadding,
      collisionBoundary,
      collisionAvoidance,
      sticky,
      positionMethod,
      anchor,
      disableAnchorTracking,
      className,
      ...props
    },
    ref
  ) => (
    <BasePreviewCard.Portal>
      <BasePreviewCard.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        collisionBoundary={collisionBoundary}
        collisionAvoidance={collisionAvoidance}
        sticky={sticky}
        positionMethod={positionMethod}
        anchor={anchor}
        disableAnchorTracking={disableAnchorTracking}
        className="z-50 outline-none"
      >
        <BasePreviewCard.Popup ref={ref} className={cn(previewCardPopupClass, className)} {...props} />
      </BasePreviewCard.Positioner>
    </BasePreviewCard.Portal>
  )
);
PreviewCardContent.displayName = "PreviewCardContent";

/** A full-width thumbnail at the top of the card; clips to the card's top corners. Height comes from the image or `height`. */
export const PreviewCardImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(({ className, alt = "", ...props }, ref) => (
  <img ref={ref} alt={alt} className={cn("w-full overflow-hidden rounded-t-lg object-cover", className)} {...props} />
));
PreviewCardImage.displayName = "PreviewCardImage";

/** The padded text column beneath the (optional) image. */
export const PreviewCardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1 px-3 py-2", className)} {...props} />
));
PreviewCardBody.displayName = "PreviewCardBody";

/** A row pairing a leading glyph (type icon, project emoji) with an identifier label or the title. */
export const PreviewCardEyebrow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-2 [--node-size:var(--control-glyph-md)]", className)} {...props} />
));
PreviewCardEyebrow.displayName = "PreviewCardEyebrow";

/** Muted identifier text inside a `PreviewCardEyebrow`, e.g. an issue key. */
export const PreviewCardEyebrowLabel = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("min-w-0 flex-1 truncate text-body-xs-regular text-tertiary", className)} {...props} />
));
PreviewCardEyebrowLabel.displayName = "PreviewCardEyebrowLabel";

/**
 * The card's heading: one line, truncated. When `children` is a string it doubles as a native
 * `title` so hover recovers the full text (pass `title` to override, `title=""` to suppress).
 */
export const PreviewCardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, title, children, ...props }, ref) => (
    <h2
      ref={ref}
      title={title !== undefined ? title : typeof children === "string" ? children : undefined}
      className={cn("min-w-0 truncate text-body-sm-medium text-primary", className)}
      {...props}
    >
      {children}
    </h2>
  )
);
PreviewCardTitle.displayName = "PreviewCardTitle";

/** Supporting copy beneath the title. */
export const PreviewCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-body-xs-regular text-secondary", className)} {...props} />
));
PreviewCardDescription.displayName = "PreviewCardDescription";

/** A wrapping row of property chips (`Pill`, `Avatar`, `Badge`, …). */
export const PreviewCardPropertyGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-wrap items-center gap-2", className)} {...props} />
));
PreviewCardPropertyGroup.displayName = "PreviewCardPropertyGroup";

/** A muted footer caption — a source domain, a relative timestamp. */
export const PreviewCardMeta = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-caption-md-regular text-tertiary", className)} {...props} />
));
PreviewCardMeta.displayName = "PreviewCardMeta";

/* __DOC
<p className="text-body-sm-regular text-secondary">
  Blocked by{" "}
  <QUI.PreviewCard>
    <QUI.PreviewCardTrigger href="#" className="text-accent-primary underline underline-offset-2">
      WEB-142
    </QUI.PreviewCardTrigger>
    <QUI.PreviewCardContent>
      <QUI.PreviewCardBody>
        <QUI.PreviewCardEyebrow>
          <QUI.Icon icon={Icons.CircleDot} tint="secondary" />
          <QUI.PreviewCardEyebrowLabel>WEB-142</QUI.PreviewCardEyebrowLabel>
        </QUI.PreviewCardEyebrow>
        <QUI.PreviewCardTitle>Migrate auth to the new session service</QUI.PreviewCardTitle>
        <QUI.PreviewCardDescription>Swap cookie sessions for short-lived tokens across web and API.</QUI.PreviewCardDescription>
        <QUI.PreviewCardPropertyGroup>
          <QUI.Avatar size="sm" alt="Ada Lovelace" />
          <QUI.Badge label="In progress" />
        </QUI.PreviewCardPropertyGroup>
        <QUI.PreviewCardMeta>Updated 2 hours ago</QUI.PreviewCardMeta>
      </QUI.PreviewCardBody>
    </QUI.PreviewCardContent>
  </QUI.PreviewCard>
  .
</p>
DOC__ */

/* __PROPS
{ "PreviewCardContent.side": ["top", "bottom", "left", "right"], "PreviewCardContent.align": ["start", "center", "end"] }
PROPS__ */
