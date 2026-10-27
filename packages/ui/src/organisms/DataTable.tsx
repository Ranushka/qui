import * as React from "react";
import {
  columnSizingFeature,
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type PaginationState,
  type ReactTable,
  type Row as TanStackRow,
  type RowData,
  type SortingState,
  type TableOptions,
  type Updater,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Columns3 } from "lucide-react";
import { Checkbox } from "../atoms/Checkbox";
import { CircularProgress } from "../atoms/CircularProgress";
import { Icon } from "../atoms/Icon";
import { IconButton } from "../atoms/IconButton";
import { Inline } from "../atoms/Inline";
import { Text } from "../atoms/Text";
import { Menu, MenuCheckboxItem, MenuContent, MenuGroup, MenuGroupLabel, MenuTrigger } from "../molecules/Menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, type TableProps } from "./Table";

export interface DataTableColumnMeta {
  /** Aligns the column's header and cells; `end` for money and numbers so digits line up. @default "start" */
  align?: "start" | "center" | "end";
}

/**
 * Every `DataTable` gets the same TanStack Table features: sorting, selection, paging, column visibility and sizing,
 * the built-in sort functions `auto` picks from, and `DataTableColumnMeta` as column `meta`.
 */
const features = tableFeatures({
  rowSortingFeature,
  rowSelectionFeature,
  rowPaginationFeature,
  columnVisibilityFeature,
  columnSizingFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, datetime: sortFn_datetime, basic: sortFn_basic },
  columnMeta: metaHelper<DataTableColumnMeta>(),
});
type Features = typeof features;

/** A column: TanStack Table's `ColumnDef`, with `meta.align` for alignment and `size` as its minimum width in px. */
export type DataTableColumn<Row extends RowData> = ColumnDef<Features, Row, any>;
/** The TanStack table instance `useDataTable` returns; read sorting, selection and paging state from it. */
export type DataTableInstance<Row extends RowData> = ReactTable<Features, Row>;
export type DataTableSorting = SortingState;

/** Row heights in px, matching `TableCell`'s `h-11` / `h-8`; the virtualizer's first guess before it measures rows. */
const ROW_HEIGHT = { comfortable: 44, compact: 32 } as const;

/** The leading checkbox column `selectable` adds: select a row, or every row on the page from the header. */
const selectColumn: DataTableColumn<any> = {
  id: "select",
  size: 44,
  enableSorting: false,
  enableHiding: false,
  header: ({ table }) => (
    <Checkbox
      aria-label="Select all rows"
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={table.getIsSomePageRowsSelected()}
      onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
    />
  ),
  cell: ({ row }) => (
    <Checkbox aria-label={`Select row ${row.id}`} checked={row.getIsSelected()} disabled={!row.getCanSelect()} onCheckedChange={(checked) => row.toggleSelected(checked)} />
  ),
};

export interface UseDataTableOptions<Row extends RowData> extends Omit<TableOptions<Features, Row>, "features" | "columns"> {
  columns: DataTableColumn<Row>[];
  /** Adds a leading checkbox column for selecting rows. Give rows stable ids with `getRowId`. */
  selectable?: boolean;
  /** Rows per page. Leave it out to show every row, e.g. on a `virtual` table. */
  pageSize?: number;
}

/**
 * A TanStack Table for `DataTable`, with sorting (A→Z first for text, largest/newest first otherwise — set
 * `sortDescFirst` on a column to change it), selection, column visibility and, with `pageSize`, paging built in.
 * The page goes back to the first one whenever the data or sorting changes, so memoize `data`.
 */
export function useDataTable<Row extends RowData>({ columns, selectable = false, pageSize, state, onPaginationChange, ...options }: UseDataTableOptions<Row>) {
  const [paging, setPaging] = React.useState<PaginationState>({ pageIndex: 0, pageSize: pageSize ?? 0 });
  // A new page size starts over on the first page.
  const pagination = paging.pageSize === pageSize ? paging : { pageIndex: 0, pageSize: pageSize ?? 0 };
  const allColumns = React.useMemo(() => (selectable ? [selectColumn as DataTableColumn<Row>, ...columns] : columns), [selectable, columns]);
  return useTable<Features, Row>({
    enableSortingRemoval: false,
    ...options,
    features,
    columns: allColumns,
    // Without `pageSize` paging is off and every row shows.
    manualPagination: !pageSize,
    onPaginationChange: (updater: Updater<PaginationState>) => {
      setPaging(typeof updater === "function" ? updater(pagination) : updater);
      onPaginationChange?.(updater);
    },
    state: { ...(pageSize ? { pagination } : {}), ...state },
  });
}

interface DataTableViewProps extends Omit<TableProps, "children"> {
  /**
   * Mounts only the rows in view, plus a few either side, so thousands of rows scroll smoothly. Off by default:
   * use it for long unpaginated tables, e.g. a full-page focus view. A column's `size` is its minimum width; give one to
   * any column whose content width varies, so it stays put as rows come and go.
   * @default false
   */
  virtual?: boolean;
  /**
   * Infinite scroll on a `virtual` table: called when the last rows scroll into view (or when the rows don't fill
   * the table yet), to fetch the next page and append it to `data`. Called once per row count and never while
   * `loadingMore`; leave it out once the last page is in.
   */
  onEndReached?: () => void;
  /** Shows a loading row under the last row while the next page is on its way. @default false */
  loadingMore?: boolean;
  /** Shown across the table when there are no rows. */
  emptyState?: React.ReactNode;
}

export type DataTableProps<Row extends RowData> = DataTableViewProps &
  ({ table: DataTableInstance<Row>; data?: never; columns?: never } | ({ table?: never } & UseDataTableOptions<Row>));

const sortDirection = (sorted: false | "asc" | "desc") => (sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none");

/**
 * A data-driven table on TanStack Table, drawn with `Table`'s parts: sortable headers, row selection, column
 * visibility, paging and optional row virtualization. Pass `data` and `columns` for a self-contained table, or build
 * the table with `useDataTable` and pass `table` when the page needs its state (selection, paging, a columns menu).
 */
export function DataTable<Row extends RowData>(props: DataTableProps<Row>) {
  if (props.table) return <DataTableView {...props} table={props.table} />;
  return <DataTableFromOptions {...(props as DataTableViewProps & UseDataTableOptions<Row>)} />;
}

function DataTableFromOptions<Row extends RowData>({
  virtual,
  onEndReached,
  loadingMore,
  emptyState,
  density,
  stickyHeader,
  verticalLines,
  striped,
  ...options
}: DataTableViewProps & UseDataTableOptions<Row>) {
  const { "aria-label": ariaLabel, ...tableOptions } = options as typeof options & { "aria-label"?: string };
  const table = useDataTable(tableOptions);
  return <DataTableView table={table} aria-label={ariaLabel} {...{ virtual, onEndReached, loadingMore, emptyState, density, stickyHeader, verticalLines, striped }} />;
}

function DataTableView<Row extends RowData>({
  table,
  virtual = false,
  onEndReached,
  loadingMore = false,
  emptyState,
  density = "comfortable",
  ...props
}: DataTableViewProps & { table: DataTableInstance<Row> }) {
  const tableRef = React.useRef<HTMLTableElement>(null);
  const rows = table.getRowModel().rows;
  const columns = table.getVisibleLeafColumns();

  const virtualizer = useVirtualizer<HTMLElement, HTMLTableRowElement>({
    count: virtual ? rows.length : 0,
    // `Table` scrolls the frame right around the <table>.
    getScrollElement: () => tableRef.current?.parentElement ?? null,
    estimateSize: () => ROW_HEIGHT[density],
    getItemKey: (index) => rows[index]?.id ?? index,
    overscan: 10,
  });

  // The last mounted row is `overscan` rows past the bottom edge, so the next page starts loading about ten rows early.
  const lastMounted = virtual ? (virtualizer.getVirtualItems().at(-1)?.index ?? -1) : -1;
  const endReached = React.useRef(onEndReached);
  endReached.current = onEndReached;
  const canLoad = virtual && onEndReached != null && !loadingMore;
  /** The row count the last call was made at: one call per count, so re-renders and Strict Mode don't fetch a page twice. */
  const calledAt = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!canLoad || lastMounted < rows.length - 1 || calledAt.current === rows.length) return;
    calledAt.current = rows.length;
    endReached.current?.();
  }, [canLoad, lastMounted, rows.length]);

  const renderRow = (row: TanStackRow<Features, Row>, index: number) => (
    <TableRow
      key={row.id}
      ref={virtual ? virtualizer.measureElement : undefined}
      data-index={index}
      aria-rowindex={virtual ? index + 2 : undefined}
      selected={row.getIsSelected()}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} align={cell.column.columnDef.meta?.align}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );

  let body: React.ReactNode;
  if (!virtual) {
    body = rows.map(renderRow);
  } else {
    const items = virtualizer.getVirtualItems();
    const start = items[0]?.index ?? 0;
    const padTop = items[0]?.start ?? 0;
    const padBottom = virtualizer.getTotalSize() - (items.at(-1)?.end ?? 0);
    // Zebra stripes come from `:nth-child(even)`, so the spacers above the window keep the same parity as the rows
    // they stand in for; otherwise the stripes would swap as you scroll.
    body = (
      <>
        {start > 0 ? <tr aria-hidden style={{ height: padTop }} /> : null}
        {start > 0 && start % 2 === 0 ? <tr aria-hidden /> : null}
        {items.map((item) => renderRow(rows[item.index]!, item.index))}
        {padBottom > 0 ? <tr aria-hidden style={{ height: padBottom }} /> : null}
      </>
    );
  }

  return (
    <Table ref={tableRef} density={density} aria-rowcount={virtual ? rows.length + 1 : undefined} {...props}>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => {
              const sortable = header.column.getCanSort();
              return (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan > 1 ? header.colSpan : undefined}
                  align={header.column.columnDef.meta?.align}
                  minWidth={header.column.columnDef.size != null ? header.column.getSize() : undefined}
                  sortDirection={sortable ? sortDirection(header.column.getIsSorted()) : undefined}
                  onSort={sortable ? header.column.getToggleSortingHandler() : undefined}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.length === 0 && emptyState != null ? (
          <TableRow>
            <TableCell colSpan={columns.length}>{emptyState}</TableCell>
          </TableRow>
        ) : (
          body
        )}
        {loadingMore ? (
          <TableRow aria-busy>
            <TableCell colSpan={columns.length}>
              <Inline gap="2" justify="center">
                <CircularProgress size="sm" indeterminate aria-label="Loading more rows" />
                <Text size="sm" color="tertiary">
                  Loading more…
                </Text>
              </Inline>
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}

export interface DataTableColumnsMenuProps<Row extends RowData> {
  table: DataTableInstance<Row>;
  /** Accessible name of the trigger. @default "Choose columns" */
  label?: string;
}

/** An icon button that opens a checklist of the table's columns, to show or hide each one. */
export function DataTableColumnsMenu<Row extends RowData>({ table, label = "Choose columns" }: DataTableColumnsMenuProps<Row>) {
  return (
    <Menu>
      <MenuTrigger render={<IconButton variant="secondary" aria-label={label} icon={<Icon icon={Columns3} />} />} />
      <MenuContent align="end">
        <MenuGroup>
          <MenuGroupLabel>Columns</MenuGroupLabel>
          {table
            .getAllLeafColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <MenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(checked) => column.toggleVisibility(checked)}>
                {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
              </MenuCheckboxItem>
            ))}
        </MenuGroup>
      </MenuContent>
    </Menu>
  );
}

/* __DOC_BLOCK
<div className="flex h-80 w-full flex-col gap-8 p-4">
  <QUI.DataTable
    aria-label="Work items"
    data={Array.from({ length: 40 }, (_, i) => ({ id: "WEB-" + (i + 1), title: "Work item " + (i + 1), points: (i * 7) % 13 }))}
    getRowId={(row) => row.id}
    selectable
    columns={[
      { accessorKey: "id", header: "ID", size: 96 },
      { accessorKey: "title", header: "Title" },
      { accessorKey: "points", header: "Points", meta: { align: "end" } },
    ]}
  />
</div>
DOC__ */

/* __PROPS
{ "virtual": "boolean", "loadingMore": "boolean", "selectable": "boolean", "density": ["comfortable", "compact"], "striped": "boolean" }
PROPS__ */
