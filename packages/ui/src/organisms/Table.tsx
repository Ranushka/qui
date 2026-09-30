import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/cn";

type TableDensity = "comfortable" | "compact";
type SortDirection = "ascending" | "descending";

/** Shares the table's `density` with its cells so rows size consistently without repeating the prop. */
const TableDensityContext = React.createContext<TableDensity>("comfortable");

export interface TableProps extends React.ComponentPropsWithoutRef<"table"> {
  /** Row height: roomy default or a tighter data-dense layout. @default "comfortable" */
  density?: TableDensity;
}

/** A semantic `<table>` in a horizontally scrollable, bordered frame. `density` flows down to every cell. */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(({ density = "comfortable", className, ...props }, ref) => (
  <TableDensityContext.Provider value={density}>
    <div className="w-full overflow-x-auto rounded-lg border-sm border-subtle bg-layer-2">
      <table ref={ref} className={cn("w-full border-collapse text-left text-body-sm-regular text-secondary", className)} {...props} />
    </div>
  </TableDensityContext.Provider>
));
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<"thead">>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-layer-1", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<"tbody">>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&>tr:last-child]:border-b-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

export interface TableRowProps extends React.ComponentPropsWithoutRef<"tr"> {
  /** Highlights the row as selected. */
  selected?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(({ selected, className, ...props }, ref) => (
  <tr
    ref={ref}
    data-selected={selected ? "" : undefined}
    aria-selected={selected || undefined}
    className={cn("border-b-sm border-subtle transition-colors hover:bg-layer-transparent-hover data-selected:bg-layer-transparent-selected", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export interface TableHeadProps extends Omit<React.ComponentPropsWithoutRef<"th">, "aria-sort"> {
  /** Current sort state of this column. Omit for a non-sortable column. */
  sortDirection?: SortDirection | "none";
  /** Makes the header a button; called when the user activates it. */
  onSort?: () => void;
}

/** A column header. With `onSort` it renders a keyboard-operable button and reports `aria-sort`. */
export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(({ sortDirection, onSort, className, children, ...props }, ref) => {
  const density = React.useContext(TableDensityContext);
  const sortable = onSort != null;
  const SortIcon = sortDirection === "ascending" ? ArrowUp : sortDirection === "descending" ? ArrowDown : ChevronsUpDown;
  return (
    <th
      ref={ref}
      scope="col"
      aria-sort={sortable ? (sortDirection ?? "none") : undefined}
      className={cn("px-3 text-body-xs-medium text-tertiary whitespace-nowrap", density === "compact" ? "h-7" : "h-9", className)}
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

export const TableCell = React.forwardRef<HTMLTableCellElement, React.ComponentPropsWithoutRef<"td">>(({ className, ...props }, ref) => {
  const density = React.useContext(TableDensityContext);
  return <td ref={ref} className={cn("px-3", density === "compact" ? "h-8" : "h-11", className)} {...props} />;
});
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.ComponentPropsWithoutRef<"caption">>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("px-3 py-2 text-left text-body-xs-regular text-tertiary", className)} {...props} />
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
{ "density": ["comfortable", "compact"] }
PROPS__ */
