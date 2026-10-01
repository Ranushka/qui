import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";
import { nodeSlotClass } from "../lib/node-slot";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";

/** Shared geometry for a page-number slot: 24px tall, auto-width, min 24px square. */
const pageSlotClass = "inline-flex h-6 w-auto min-w-6 shrink-0 items-center justify-center rounded-sm px-1 text-body-xs-regular text-primary outline-none transition-colors";

export interface PaginationPageButtonProps extends NoClass<React.ComponentPropsWithoutRef<"button">> {
  /** Marks this as the active page (`aria-current="page"`), filling its background. */
  current?: boolean;
}

/** A single page-number button. The active page is marked `aria-current="page"`. */
export const PaginationPageButton = React.forwardRef<HTMLButtonElement, PaginationPageButtonProps>(({ current = false, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-current={current ? "page" : undefined}
    className={cn(
      pageSlotClass,
      "cursor-pointer bg-layer-transparent hover:bg-layer-transparent-hover",
      "focus-visible:ring-2 focus-visible:ring-accent-strong",
      "disabled:cursor-not-allowed disabled:text-disabled",
      current && "bg-layer-transparent-active disabled:text-primary"
    )}
    {...props}
  />
));
PaginationPageButton.displayName = "PaginationPageButton";

export interface PaginationEllipsisProps extends NoClass<React.ComponentPropsWithoutRef<"span">> {}

/** Non-interactive gap marker between distant page numbers. */
export const PaginationEllipsis = React.forwardRef<HTMLSpanElement, PaginationEllipsisProps>(({ children, ...props }, ref) => (
  <span ref={ref} aria-hidden className={cn(pageSlotClass, nodeSlotClass, "text-icon-placeholder [--node-size:var(--control-glyph-sm)]")} {...props}>
    {children ?? <MoreHorizontal />}
  </span>
));
PaginationEllipsis.displayName = "PaginationEllipsis";

/** One page item, or a gap marker: a number, `"ellipsis"`, to render in order. */
export type PaginationItemValue = number | "ellipsis";

export interface PaginationProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"nav">, "onChange">> {
  /** 1-indexed current page. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** Called with the next page number when a page button, or prev/next, is activated. */
  onPageChange: (page: number) => void;
  /** How many page numbers to keep visible around the current page, before collapsing into an ellipsis. @default 1 */
  siblingCount?: number;
  /** Accessible name for the landmark. @default "Pagination" */
  "aria-label"?: string;
}

function buildPageList(page: number, pageCount: number, siblingCount: number): PaginationItemValue[] {
  const totalVisible = siblingCount * 2 + 5; // first + last + current + 2 ellipses (worst case)
  if (pageCount <= totalVisible) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const left = Math.max(page - siblingCount, 2);
  const right = Math.min(page + siblingCount, pageCount - 1);

  const items: PaginationItemValue[] = [1];
  if (left > 2) items.push("ellipsis");
  for (let p = left; p <= right; p++) items.push(p);
  if (right < pageCount - 1) items.push("ellipsis");
  items.push(pageCount);
  return items;
}

/**
 * Page-number navigation: prev/next `IconButton`s framing a list of page-number buttons, with an
 * ellipsis marker where the run of numbers is collapsed. Purely presentational — `page`/`pageCount`
 * are controlled by the caller, who drives `onPageChange`.
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ page, pageCount, onPageChange, siblingCount = 1, "aria-label": ariaLabel = "Pagination", ...props }, ref) => {
    const items = React.useMemo(() => buildPageList(page, pageCount, siblingCount), [page, pageCount, siblingCount]);

    return (
      <nav ref={ref} aria-label={ariaLabel} className={cn("flex items-center gap-1.5")} {...props}>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Previous page"
          showTooltip={false}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          icon={<Icon icon={ChevronLeft} />}
        />
        <ul className="flex items-center gap-1.5">
          {items.map((item, index) =>
            item === "ellipsis" ? (
              <li key={`ellipsis-${index}`} className="flex items-center">
                <PaginationEllipsis />
              </li>
            ) : (
              <li key={item} className="flex items-center">
                <PaginationPageButton current={item === page} onClick={() => onPageChange(item)}>
                  {item}
                </PaginationPageButton>
              </li>
            )
          )}
        </ul>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Next page"
          showTooltip={false}
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          icon={<Icon icon={ChevronRight} />}
        />
      </nav>
    );
  }
);
Pagination.displayName = "Pagination";

/* __DOC_BLOCK
<div className="flex flex-col gap-4 p-4">
  <QUI.Pagination page={1} pageCount={5} onPageChange={() => {}} />
  <QUI.Pagination page={6} pageCount={12} onPageChange={() => {}} />
  <QUI.Pagination page={1} pageCount={1} onPageChange={() => {}} />
</div>
DOC__ */

/* __PROPS
{}
PROPS__ */
