import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

type TableDensity = "comfortable" | "compact";
type SortDirection = "ascending" | "descending";

/** Shares the table's `density` with its cells so rows size consistently without repeating the prop. */
const TableDensityContext = React.createContext<TableDensity>("comfortable");
/** Tells `TableHeader` whether to pin itself to the top of the table's scroll frame. */
const TableStickyHeaderContext = React.createContext(true);
/** Tells body rows whether to shade every other row. */
const TableStripedContext = React.createContext(true);
/** Tells heads and cells whether to draw the column rule on their inline-end edge. */
const TableVerticalLinesContext = React.createContext(true);

type CellAlign = "start" | "center" | "end";
const alignClass: Record<CellAlign, string> = { start: "text-start", center: "text-center", end: "text-end" };
/** Column rule between cells (none after the last), drawn on each cell's inline-end edge. */
const columnRuleClass = "border-e-sm border-subtle last:border-e-0";

export interface TableProps extends NoClass<React.ComponentPropsWithoutRef<"table">> {
  /** Row height: roomy default or a tighter data-dense layout. @default "comfortable" */
  density?: TableDensity;
  /**
   * Keeps the header row pinned while the rows scroll. The table scrolls inside its own frame, which takes at
   * most its parent's height — give the parent a bounded height (e.g. a growing flex child) for it to scroll.
   * @default true
   */
  stickyHeader?: boolean;
  /** Draws a rule between columns. @default true */
  verticalLines?: boolean;
  /** Shades every other body row (zebra stripes) so long rows are easy to follow. @default true */
  striped?: boolean;
}

/**
 * A semantic `<table>` in a scrollable, bordered frame. `density` flows down to every cell; with `stickyHeader`
 * (the default) the frame scrolls both ways within its parent's height and the header stays on top.
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(({ density = "comfortable", stickyHeader = true, verticalLines = true, striped = true, ...props }, ref) => (
  <TableDensityContext.Provider value={density}>
    <TableStripedContext.Provider value={striped}>
      <TableStickyHeaderContext.Provider value={stickyHeader}>
        <TableVerticalLinesContext.Provider value={verticalLines}>
          <div className={cn("w-full rounded-lg border-sm border-subtle bg-layer-2", stickyHeader ? "max-h-full overflow-auto" : "overflow-x-auto")}>
            <table ref={ref} className={cn("w-full border-collapse text-left text-body-sm-regular text-secondary")} {...props} />
          </div>
        </TableVerticalLinesContext.Provider>
      </TableStickyHeaderContext.Provider>
    </TableStripedContext.Provider>
  </TableDensityContext.Provider>
));
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, NoClass<React.ComponentPropsWithoutRef<"thead">>>(({ ...props }, ref) => {
  const sticky = React.useContext(TableStickyHeaderContext);
  // A pinned header keeps its bottom rule as an inset shadow: collapsed row borders scroll away with the body.
  return <thead ref={ref} className={cn("bg-layer-1", sticky && "sticky top-0 z-10 shadow-[inset_0_-1px_0_var(--border-subtle)]")} {...props} />;
});
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, NoClass<React.ComponentPropsWithoutRef<"tbody">>>(({ ...props }, ref) => (
  <tbody ref={ref} className={cn("[&>tr:last-child]:border-b-0")} {...props} />
));
TableBody.displayName = "TableBody";

export interface TableRowProps extends NoClass<React.ComponentPropsWithoutRef<"tr">> {
  /** Highlights the row as selected. */
  selected?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(({ selected, ...props }, ref) => {
  const striped = React.useContext(TableStripedContext);
  return (
    <tr
      ref={ref}
      data-selected={selected ? "" : undefined}
      aria-selected={selected || undefined}
      className={cn(
        "border-b-sm border-subtle transition-colors hover:bg-layer-transparent-hover data-selected:bg-layer-transparent-selected",
        // Stripes yield to hover and selection; the header's single row is never an even child.
        striped && "even:not-hover:not-data-selected:bg-layer-1"
      )}
      {...props}
    />
  );
});
TableRow.displayName = "TableRow";

export interface TableHeadProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"th">, "aria-sort" | "align">> {
  /** Current sort state of this column. Omit for a non-sortable column. */
  sortDirection?: SortDirection | "none";
  /** Makes the header a button; called when the user activates it. */
  onSort?: () => void;
  /** Text alignment; use `end` over numeric columns so headers line up with their digits. @default "start" */
  align?: CellAlign;
}

/** A column header. With `onSort` it renders a keyboard-operable button and reports `aria-sort`. */
export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(({ sortDirection, onSort, align = "start", children, ...props }, ref) => {
  const density = React.useContext(TableDensityContext);
  const verticalLines = React.useContext(TableVerticalLinesContext);
  const sortable = onSort != null;
  const SortIcon = sortDirection === "ascending" ? ArrowUp : sortDirection === "descending" ? ArrowDown : ChevronsUpDown;
  return (
    <th
      ref={ref}
      scope="col"
      aria-sort={sortable ? (sortDirection ?? "none") : undefined}
      className={cn("px-3 text-body-xs-medium text-tertiary whitespace-nowrap", density === "compact" ? "h-7" : "h-9", alignClass[align], verticalLines && columnRuleClass)}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className="-mx-1 inline-flex cursor-pointer items-center gap-1 rounded-sm px-1 outline-none hover:text-secondary focus-visible:ring-2 focus-visible:ring-accent-strong"
        >
          {children}
          <SortIcon aria-hidden className={cn("size-3", sortDirection && sortDirection !== "none" ? "text-primary" : "text-icon-placeholder")} />
        </button>
      ) : (
        children
      )}
    </th>
  );
});
TableHead.displayName = "TableHead";

export interface TableCellProps extends NoClass<Omit<React.ComponentPropsWithoutRef<"td">, "align">> {
  /** Text alignment; use `end` for money and numbers so digits line up. @default "start" */
  align?: CellAlign;
}

/** A body cell. Holds plain text or a typed cell (`UserCell`, `DateCell`, `MoneyCell`, …). */
export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(({ align = "start", ...props }, ref) => {
  const density = React.useContext(TableDensityContext);
  const verticalLines = React.useContext(TableVerticalLinesContext);
  return <td ref={ref} className={cn("max-w-80 px-3", density === "compact" ? "h-8 py-1" : "h-11 py-2", alignClass[align], verticalLines && columnRuleClass)} {...props} />;
});
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, NoClass<React.ComponentPropsWithoutRef<"caption">>>(({ ...props }, ref) => (
  <caption ref={ref} className={cn("px-3 py-2 text-left text-body-xs-regular text-tertiary")} {...props} />
));
TableCaption.displayName = "TableCaption";

/* __DOC_BLOCK
<div className="flex w-full flex-col gap-8 p-4">
  <QUI.Table>
    <QUI.TableHeader>
      <QUI.TableRow>
        <QUI.TableHead>Name</QUI.TableHead>
        <QUI.TableHead>Status</QUI.TableHead>
        <QUI.TableHead sortDirection="ascending" onSort={() => {}}>Points</QUI.TableHead>
      </QUI.TableRow>
    </QUI.TableHeader>
    <QUI.TableBody>
      <QUI.TableRow><QUI.TableCell>Login page</QUI.TableCell><QUI.TableCell>Done</QUI.TableCell><QUI.TableCell>3</QUI.TableCell></QUI.TableRow>
      <QUI.TableRow selected><QUI.TableCell>Billing</QUI.TableCell><QUI.TableCell>In progress</QUI.TableCell><QUI.TableCell>8</QUI.TableCell></QUI.TableRow>
      <QUI.TableRow><QUI.TableCell>Onboarding</QUI.TableCell><QUI.TableCell>Todo</QUI.TableCell><QUI.TableCell>5</QUI.TableCell></QUI.TableRow>
    </QUI.TableBody>
  </QUI.Table>
  <QUI.Table density="compact">
    <QUI.TableHeader>
      <QUI.TableRow>
        <QUI.TableHead>Name</QUI.TableHead>
        <QUI.TableHead>Status</QUI.TableHead>
      </QUI.TableRow>
    </QUI.TableHeader>
    <QUI.TableBody>
      <QUI.TableRow><QUI.TableCell>Login page</QUI.TableCell><QUI.TableCell>Done</QUI.TableCell></QUI.TableRow>
      <QUI.TableRow><QUI.TableCell>Billing</QUI.TableCell><QUI.TableCell>In progress</QUI.TableCell></QUI.TableRow>
    </QUI.TableBody>
  </QUI.Table>
</div>
DOC__ */

/* __PROPS
{ "density": ["comfortable", "compact"], "stickyHeader": "boolean", "verticalLines": "boolean", "striped": "boolean", "TableCell.align": ["start", "center", "end"] }
PROPS__ */
