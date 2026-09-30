import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";
import { nodeSlotClass } from "../lib/node-slot";

/**
 * Chrome shared by every crumb (link or current-page): a fixed 24px-tall pill so a leading icon and
 * bare text stay flush across the trail. The `md` glyph rung sizes any icon dropped in via
 * `--node-size`.
 */
const crumbBaseClass = "inline-flex h-6 items-center gap-1.5 rounded-md px-1 text-body-xs-medium whitespace-nowrap [--node-size:var(--control-glyph-md)]";

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  /** Landmark name for the trail. @default "Breadcrumb" */
  "aria-label"?: string;
}

/** Breadcrumb trail landmark: a `<nav>` wrapping the ordered list of crumbs. */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(({ "aria-label": ariaLabel = "Breadcrumb", className, children, ...props }, ref) => (
  <nav ref={ref} aria-label={ariaLabel} className={className} {...props}>
    <ol className="flex items-center">{children}</ol>
  </nav>
));
Breadcrumb.displayName = "Breadcrumb";

export interface BreadcrumbItemProps extends Omit<React.ComponentPropsWithoutRef<"a">, "href"> {
  /** Renders as the non-interactive current page (`aria-current="page"`) instead of a link. */
  current?: boolean;
  /** Destination for a navigable crumb. Ignored when `current`. */
  href?: string;
  /** Leading icon, sized to the crumb's glyph rung. */
  icon?: React.ReactNode;
}

/** One step in the trail: a hoverable link, or the non-interactive current page. */
export const BreadcrumbItem = React.forwardRef<HTMLAnchorElement | HTMLSpanElement, BreadcrumbItemProps>(
  ({ current = false, href, icon, className, children, ...props }, ref) => {
    const content = (
      <>
        {icon}
        {children}
      </>
    );

    return (
      <li className="inline-flex items-center">
        {current ? (
          <span ref={ref as React.Ref<HTMLSpanElement>} aria-current="page" className={cn(crumbBaseClass, "text-primary", className)}>
            {content}
          </span>
        ) : (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            className={cn(crumbBaseClass, "cursor-pointer text-tertiary transition-colors hover:bg-layer-transparent-hover", className)}
            {...props}
          >
            {content}
          </a>
        )}
      </li>
    );
  }
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbSeparatorProps extends React.ComponentPropsWithoutRef<"li"> {}

/**
 * The divider between crumbs. A fixed 24px-square node slot holding the given glyph (a chevron by
 * default); decorative, so it's removed from the accessibility tree.
 */
export const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(({ className, children, ...props }, ref) => (
  <li
    ref={ref}
    aria-hidden
    role="presentation"
    className={cn(nodeSlotClass, "size-6 text-icon-secondary [--node-size:var(--control-glyph-sm)]", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
));
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <QUI.Breadcrumb>
    <QUI.BreadcrumbItem href="#">Workspace</QUI.BreadcrumbItem>
    <QUI.BreadcrumbSeparator />
    <QUI.BreadcrumbItem href="#">Projects</QUI.BreadcrumbItem>
    <QUI.BreadcrumbSeparator />
    <QUI.BreadcrumbItem current>Settings</QUI.BreadcrumbItem>
  </QUI.Breadcrumb>
  <QUI.Breadcrumb>
    <QUI.BreadcrumbItem href="#" icon={<QUI.Icon icon={Icons.Home} />}>
      Home
    </QUI.BreadcrumbItem>
    <QUI.BreadcrumbSeparator />
    <QUI.BreadcrumbItem current icon={<QUI.Icon icon={Icons.Folder} />}>
      Documents
    </QUI.BreadcrumbItem>
  </QUI.Breadcrumb>
</div>
DOC__ */

/* __PROPS
{ "current": "boolean" }
PROPS__ */
