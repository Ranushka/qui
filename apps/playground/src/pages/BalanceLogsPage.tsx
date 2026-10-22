import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AcmeShell } from "../examples/acme/shell";
import { AdminNavigation } from "../examples/acme/admin-nav";

/**
 * An admin records table — "Account balance logs" — in the Acme shell with an admin navigation tree:
 * search, a filter bar (pinned filters, "More filters", chips, kept in the URL), saved views, sortable columns, row
 * selection and pagination. Built only from qui
 * components — no className or style anywhere in this file.
 */

type Log = {
  id: number;
  account: string | null;
  amount: number;
  currency: string;
  accountType: "virtual" | "physical";
  manager: { name: string; email: string } | null;
  approvers: { name: string }[];
  status: "Active" | "Frozen" | "Dormant" | "Closed";
  creditLimit: number;
  limitUsed: number;
  netFlow: number;
  momChange: number;
  transactions: number;
  avgSettlement: number;
  periodStart: string;
  periodEnd: string;
  card: string;
  balanceUpdatedAt: string;
  createdAt: string;
  issuer: string;
  ledgerAmount: number;
};

const accounts = ["Customer Service", "Nesto Trading", "Blue Harbor LLC", "Falcon Logistics", "Test 11222211", "Marina Catering", "Desert Rose Travel"];
const approverPool = [{ name: "Raul Patel" }, { name: "Nuwan Epa" }, { name: "Mohamed Ali" }, { name: "Aisha Khan" }];
const statuses = ["Active", "Frozen", "Dormant", "Closed"] as const;
const statusColor = { Active: "emerald", Frozen: "indigo", Dormant: "yellow", Closed: "grey" } as const;
const managers = [
  { name: "Saif Kapadia", email: "saif@acme.com" },
  { name: "Mashood Pookkadan", email: "mashood@acme.com" },
  { name: "Candice Smith", email: "candice@acme.com" },
  { name: "Sohrab Khan", email: "sohrab@acme.com" },
  null,
];

/** Fixed "now" for relative dates, so the sample reads the same on every visit. */
const now = new Date("2026-10-18T09:00:00Z");
const hour = 3600 * 1000;

/** Deterministic sample rows, newest first, about eight balance updates a day over the last four months. */
const logs: Log[] = Array.from({ length: 1000 }, (_, i) => {
  const seed = (i * 7919 + 104729) % 100000;
  const amount = Math.round(((seed * 13) % 2500000) + 1500) / 100;
  const ledgerAmount = Math.round((amount + ((seed * 31) % 4000000) / 100) * 100) / 100;
  const updatedAt = new Date(now.getTime() - (i * 3 + (seed % 3)) * hour - (seed % 3600) * 1000);
  return {
    id: 13262499 - i,
    account: accounts[(i * 3) % accounts.length]!,
    amount: i % 11 === 7 ? 0 : amount,
    currency: "AED",
    accountType: seed % 3 === 0 ? "physical" : "virtual",
    manager: managers[i % managers.length]!,
    card: String(1000 + (seed % 9000)),
    balanceUpdatedAt: updatedAt.toISOString(),
    createdAt: new Date(updatedAt.getTime() - (seed % 400) * 24 * hour).toISOString(),
    issuer: "nymcard",
    ledgerAmount: i % 11 === 7 ? 0 : ledgerAmount,
    approvers: approverPool.slice(0, seed % 4),
    status: statuses[i % 17 === 5 ? 1 : i % 23 === 9 ? 2 : i % 41 === 13 ? 3 : 0]!,
    creditLimit: 50000 + (seed % 20) * 25000,
    limitUsed: (seed * 7) % 101,
    netFlow: Math.round(((seed * 37) % 5000000) - 2000000) / 100,
    momChange: Math.round(((seed % 400) - 150) / 10) / 1,
    transactions: 20 + ((seed * 3) % 4800),
    avgSettlement: 15 + (seed % 2870),
    periodStart: `2026-${String(9 + (i % 2)).padStart(2, "0")}-01T08:00:00Z`,
    periodEnd: `2026-${String(9 + (i % 2)).padStart(2, "0")}-${i % 2 ? "15" : "30"}T08:00:00Z`,
  };
});

/** Month-end ledger balances for the last three months, ending at today's ledger amount. */
function trendFor(row: Log) {
  const swing = ((row.id % 7) - 3) / 10;
  return [row.ledgerAmount * (1 - swing), row.ledgerAmount * (1 - swing / 3), row.ledgerAmount];
}

const stepNames = [
  { label: "Approved" },
  { label: "Invoice", icon: Icons.ReceiptText },
  { label: "Reviewed", icon: Icons.SquarePen },
  { label: "Stamped", icon: Icons.Stamp },
];

/** Reconciliation steps: the first few done, the next one in progress or failed, the rest pending. */
function stepsFor(row: Log): QUI.StatusIconsCellItem[] {
  const done = row.id % 5;
  return stepNames.map((step, i) => ({
    ...step,
    status: i < done ? "done" : i === done ? (row.id % 13 === 0 ? "failed" : "current") : "pending",
  }));
}

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * The table's columns, built per render so cells can filter the table (`onFilter`). Every column but Balance sorts:
 * text A→Z first, numbers and dates largest/newest first. `size` is each column's minimum width, which keeps columns
 * steady in the virtualized focus view as rows scroll in and out.
 */
function logColumns(onFilter: (key: string, value: string) => void): QUI.DataTableColumn<Log>[] {
  return [
    {
      id: "account",
      header: "Account",
      size: 160,
      accessorFn: (row) => row.account ?? "",
      cell: ({ row: { original: row } }) => <QUI.TextCell primary={row.account} secondary={row.accountType} tone="link" onClick={() => onFilter("account", row.account ?? "")} />,
    },
    {
      id: "manager",
      header: "Account manager",
      size: 210,
      accessorFn: (row) => row.manager?.name ?? "",
      cell: ({ row: { original: row } }) => (row.manager ? <QUI.UserCell name={row.manager.name} secondary={row.manager.email} onClick={() => onFilter("manager", row.manager!.name)} /> : <QUI.EmptyCell />),
    },
    { id: "card", header: "Card", size: 133, accessorFn: (row) => row.card, cell: ({ row: { original: row } }) => <QUI.MaskedCell last={row.card} /> },
    {
      id: "amount",
      header: "Amount",
      size: 136,
      meta: { align: "end" },
      accessorFn: (row) => row.amount,
      cell: ({ row: { original: row } }) => <QUI.MoneyCell amount={row.amount} currency={row.currency} display="code" locale="en-US" />,
    },
    { id: "balance", header: "Balance", size: 73, meta: { align: "end" }, enableSorting: false, cell: ({ row: { original: row } }) => <QUI.MoneyCell amount={null} currency={row.currency} /> },
    {
      id: "ledger",
      header: "Ledger amount",
      size: 130,
      meta: { align: "end" },
      accessorFn: (row) => row.ledgerAmount,
      cell: ({ row: { original: row } }) => <QUI.MoneyCell amount={row.ledgerAmount} currency={row.currency} display="none" minor="subdued" locale="en-US" />,
    },
    {
      id: "trend",
      header: "Trend (3M)",
      size: 105,
      accessorFn: (row) => row.ledgerAmount - trendFor(row)[0]!,
      cell: ({ row: { original: row } }) => <QUI.TrendCell values={trendFor(row)} label="Ledger balance, last 3 months" locale="en-US" />,
    },
    { id: "steps", header: "Status", size: 141, accessorFn: (row) => row.id % 5, cell: ({ row: { original: row } }) => <QUI.StatusIconsCell items={stepsFor(row)} /> },
    {
      id: "updated",
      header: "Balance updated",
      size: 150,
      sortDescFirst: true,
      accessorFn: (row) => row.balanceUpdatedAt,
      cell: ({ row: { original: row } }) => <QUI.DateCell value={row.balanceUpdatedAt} format="datetime" locale="en-GB" />,
    },
    {
      id: "created",
      header: "Created",
      size: 124,
      sortDescFirst: true,
      accessorFn: (row) => row.createdAt,
      cell: ({ row: { original: row } }) => <QUI.DateCell value={row.createdAt} format="relative" now={now} locale="en-US" />,
    },
    { id: "id", header: "ID", size: 92, accessorFn: (row) => row.id },
    { id: "issuer", header: "Issuer", size: 89, accessorFn: (row) => row.issuer, cell: ({ row: { original: row } }) => <QUI.TagCell label={row.issuer} color="indigo" /> },
    {
      id: "status",
      header: "Account status",
      size: 129,
      accessorFn: (row) => row.status,
      cell: ({ row: { original: row } }) => <QUI.TagCell label={row.status} color={statusColor[row.status]} onClick={() => onFilter("status", row.status)} />,
    },
    { id: "approvers", header: "Approvers", size: 121, accessorFn: (row) => row.approvers.length, cell: ({ row: { original: row } }) => <QUI.UsersCell users={row.approvers} /> },
    {
      id: "limit",
      header: "Credit limit",
      size: 110,
      meta: { align: "end" },
      accessorFn: (row) => row.creditLimit,
      cell: ({ row: { original: row } }) => <QUI.MoneyCell amount={row.creditLimit} currency={row.currency} display="code" notation="compact" locale="en-US" />,
    },
    {
      id: "used",
      header: "Limit used",
      size: 121,
      accessorFn: (row) => row.limitUsed,
      cell: ({ row: { original: row } }) => (
        <QUI.ProgressCell value={row.limitUsed} variant={row.limitUsed >= 90 ? "danger" : row.limitUsed >= 70 ? "warning" : "brand"} aria-label="Credit limit used" />
      ),
    },
    {
      id: "netFlow",
      header: "Net flow (MTD)",
      size: 136,
      meta: { align: "end" },
      accessorFn: (row) => row.netFlow,
      cell: ({ row: { original: row } }) => <QUI.MoneyCell amount={row.netFlow} currency={row.currency} display="none" negative="parentheses" locale="en-US" />,
    },
    { id: "mom", header: "MoM", size: 83, meta: { align: "end" }, accessorFn: (row) => row.momChange, cell: ({ row: { original: row } }) => <QUI.ChangeCell value={row.momChange} locale="en-US" /> },
    {
      id: "transactions",
      header: "Transactions",
      size: 117,
      meta: { align: "end" },
      accessorFn: (row) => row.transactions,
      cell: ({ row: { original: row } }) => <QUI.NumberCell value={row.transactions} format="integer" locale="en-US" />,
    },
    {
      id: "settlement",
      header: "Avg. settlement",
      size: 134,
      meta: { align: "end" },
      accessorFn: (row) => row.avgSettlement,
      cell: ({ row: { original: row } }) => <QUI.NumberCell value={row.avgSettlement} format="duration" />,
    },
    {
      id: "period",
      header: "Statement period",
      size: 144,
      sortDescFirst: true,
      accessorFn: (row) => row.periodStart,
      cell: ({ row: { original: row } }) => <QUI.DateRangeCell start={row.periodStart} end={row.periodEnd} locale="en-GB" />,
    },
  ];
}

const pageSize = 50;

const options = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

/** What the filter bar can filter on. The first three are pinned; the rest wait in "More filters". */
const filterFields: QUI.FilterField<Log>[] = [
  { key: "status", label: "Account status", kind: "select", options: options(statuses), get: (row) => row.status },
  {
    key: "manager",
    label: "Account manager",
    kind: "select",
    options: [...managers.flatMap((m) => (m ? [{ value: m.name, label: m.name }] : [])), { value: "none", label: "Unassigned" }],
    get: (row) => row.manager?.name ?? "none",
  },
  { key: "updated", label: "Balance updated", kind: "date", get: (row) => row.balanceUpdatedAt },
  { key: "account", label: "Account", icon: <QUI.Icon icon={Icons.Building2} />, kind: "select", options: options(accounts), get: (row) => row.account },
  {
    key: "type",
    label: "Account type",
    icon: <QUI.Icon icon={Icons.CreditCard} />,
    kind: "select",
    options: [{ value: "virtual", label: "Virtual" }, { value: "physical", label: "Physical" }],
    get: (row) => row.accountType,
  },
  { key: "amount", label: "Amount", icon: <QUI.Icon icon={Icons.Coins} />, kind: "number", unit: "AED", format: (n) => money.format(n), get: (row) => row.amount },
  { key: "limit", label: "Credit limit", icon: <QUI.Icon icon={Icons.Gauge} />, kind: "number", unit: "AED", get: (row) => row.creditLimit },
  { key: "used", label: "Limit used", icon: <QUI.Icon icon={Icons.Percent} />, kind: "number", unit: "%", format: (n) => `${n}%`, get: (row) => row.limitUsed },
  { key: "approvers", label: "Approvers", icon: <QUI.Icon icon={Icons.Users} />, kind: "select", options: options(approverPool.map((a) => a.name)), get: (row) => row.approvers.map((a) => a.name) },
  { key: "created", label: "Created", icon: <QUI.Icon icon={Icons.CalendarPlus} />, kind: "date", get: (row) => row.createdAt },
];

/** The hash's query (`#/examples/tables/?status=Frozen&view=focus`): filters and the focus view live there. */
const hashParams = () => new URLSearchParams(window.location.hash.split("?")[1] ?? "");
function writeHash(params: URLSearchParams, push = false) {
  const path = window.location.hash.split("?")[0]!;
  const query = params.toString();
  const base = path.endsWith("/") || !query ? path : `${path}/`;
  const url = `${window.location.pathname}${window.location.search}${base}${query ? `?${query}` : ""}`;
  if (push) window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
}

/** Filters live in the URL, so a filtered view can be shared or reloaded. */
const readFilters = () => QUI.filtersFromParams(filterFields, hashParams());
const writeFilters = (state: QUI.FilterState) => writeHash(QUI.filtersToParams(filterFields, state, hashParams()));

/** `view=focus` opens the table full screen, without the app's navigation. */
const readFocus = () => hashParams().get("view") === "focus";
function writeFocus(on: boolean, push: boolean) {
  const params = hashParams();
  if (on) params.set("view", "focus");
  else params.delete("view");
  writeHash(params, push);
}

const title = "Account balance logs";

function HeaderActions() {
  return (
    <QUI.Inline gap="2" wrap={false}>
      <QUI.Button variant="primary" icon={<QUI.Icon icon={Icons.Plus} />} label="Create" />
      <QUI.Menu>
        <QUI.MenuTrigger render={<QUI.Button variant="secondary" endIcon={<QUI.Icon icon={Icons.ChevronDown} />} label="Actions" />} />
        <QUI.MenuContent align="end">
          <QUI.MenuItem icon={<QUI.Icon icon={Icons.Download} />}>Export CSV</QUI.MenuItem>
          <QUI.MenuItem icon={<QUI.Icon icon={Icons.Upload} />}>Import</QUI.MenuItem>
          <QUI.MenuSeparator />
          <QUI.MenuItem variant="danger" icon={<QUI.Icon icon={Icons.Trash2} />}>
            Delete selected
          </QUI.MenuItem>
        </QUI.MenuContent>
      </QUI.Menu>
    </QUI.Inline>
  );
}

function PageHeader() {
  return (
    <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Icon icon={Icons.WalletCards} size="lg" tint="secondary" />
        <QUI.Heading level={1} size={5} weight="semibold" truncate>
          {title}
        </QUI.Heading>
      </QUI.Inline>
      <HeaderActions />
    </QUI.Inline>
  );
}

function Toolbar({
  query,
  onQuery,
  filters,
  onFilters,
  table,
  focus,
  onFocus,
}: {
  query: string;
  onQuery: (q: string) => void;
  filters: QUI.FilterState;
  onFilters: (next: QUI.FilterState) => void;
  table: QUI.DataTableInstance<Log>;
  /** Whether the focus view is open; the last button opens or leaves it. */
  focus: boolean;
  onFocus: () => void;
}) {
  return (
    <QUI.FilterBar
      fields={filterFields}
      value={filters}
      onValueChange={onFilters}
      rows={logs}
      now={now}
      search={
        <QUI.Box width="3xs">
          <QUI.Input
            aria-label="Search balance logs"
            placeholder="Search…"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />}
          />
        </QUI.Box>
      }
      actions={
        <>
          <QUI.IconButton variant="ghost" aria-label="Save view" icon={<QUI.Icon icon={Icons.Bookmark} />} />
          <QUI.DataTableColumnsMenu table={table} />
          <QUI.IconButton variant="secondary" aria-label="Refresh" icon={<QUI.Icon icon={Icons.RefreshCw} />} />
          <QUI.IconButton
            variant="secondary"
            aria-label={focus ? "Exit focus view" : "Open focus view"}
            icon={<QUI.Icon icon={focus ? Icons.Minimize2 : Icons.Maximize2} />}
            onClick={onFocus}
          />
        </>
      }
    />
  );
}

/** Row count, bulk actions for the selection, and — outside the focus view — the pager. */
function Footer({ table, paged }: { table: QUI.DataTableInstance<Log>; paged: boolean }) {
  const total = table.getPrePaginatedRowModel().rows.length;
  const { pageIndex, pageSize: size } = table.state.pagination;
  const shown = table.getRowModel().rows.length;
  const selected = table.getSelectedRowModel().rows.length;
  const count = total === 0 ? "No records match these filters" : paged ? `${pageIndex * size + 1}–${pageIndex * size + shown} of ${total}` : `${total.toLocaleString("en-US")} records`;
  return (
    <QUI.Inline justify="between" gap="4">
      <QUI.Text size="xs" color="tertiary" tabularNums>
        {count}
      </QUI.Text>
      <QUI.ActionBar
        placement="inline"
        open={selected > 0}
        aria-label="Bulk actions"
        summary={`${selected} ${selected === 1 ? "record" : "records"} selected`}
        onClear={() => table.resetRowSelection()}
      >
        <QUI.ActionBarButton icon={<QUI.Icon icon={Icons.Download} />} label="Export" onClick={() => table.resetRowSelection()} />
        <QUI.ActionBarButton icon={<QUI.Icon icon={Icons.FileText} />} label="Statements" onClick={() => table.resetRowSelection()} />
      </QUI.ActionBar>
      {paged ? <QUI.Pagination page={pageIndex + 1} pageCount={Math.max(1, table.getPageCount())} onPageChange={(page) => table.setPageIndex(page - 1)} /> : null}
    </QUI.Inline>
  );
}

/**
 * Playground page: the balance-log records table in the Acme shell with the admin navigation, paged; or, with
 * `view=focus`, full screen with every row in one virtualized scroll.
 */
export function BalanceLogsPage() {
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState(readFilters);
  const [focus, setFocus] = React.useState(readFocus);
  /** Whether this visit pushed the focus view's history entry, so leaving it can go back instead of adding another. */
  const pushedFocus = React.useRef(false);
  const filtersRef = React.useRef(filters);
  filtersRef.current = filters;

  // Back/forward toggles the focus view; the filters on screen stay and are written back into the URL.
  React.useEffect(() => {
    const onPopState = () => {
      setFocus(readFocus());
      writeFilters(filtersRef.current);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const changeFilters = React.useCallback((next: QUI.FilterState) => {
    setFilters(next);
    writeFilters(next);
  }, []);

  const q = query.trim().toLowerCase();
  const data = React.useMemo(
    () =>
      QUI.filterRows(logs, filterFields, filters, { now }).filter(
        (row) =>
          !q ||
          String(row.id).includes(q) ||
          (row.account ?? "").toLowerCase().includes(q) ||
          (row.manager?.name ?? "").toLowerCase().includes(q) ||
          row.status.toLowerCase() === q ||
          money.format(row.amount).includes(q)
      ),
    [filters, q]
  );
  const columns = React.useMemo(() => logColumns((key, value) => changeFilters({ ...filtersRef.current, [key]: [value] })), [changeFilters]);
  const table = QUI.useDataTable({
    data,
    columns,
    getRowId: (row) => String(row.id),
    selectable: true,
    pageSize: focus ? undefined : pageSize,
    initialState: { sorting: [{ id: "id", desc: true }] },
  });

  const openFocus = () => {
    writeFocus(true, true);
    pushedFocus.current = true;
    setFocus(true);
  };
  const exitFocus = () => {
    if (pushedFocus.current) {
      pushedFocus.current = false;
      window.history.back();
    } else {
      writeFocus(false, false);
      setFocus(false);
    }
  };

  const toolbar = <Toolbar query={query} onQuery={setQuery} filters={filters} onFilters={changeFilters} table={table} focus={focus} onFocus={focus ? exitFocus : openFocus} />;
  const dataTable = <QUI.DataTable table={table} aria-label={title} virtual={focus} />;

  if (focus) {
    return (
      <QUI.FocusView
        title={title}
        icon={<QUI.Icon icon={Icons.WalletCards} size="lg" tint="secondary" />}
        actions={<HeaderActions />}
        toolbar={toolbar}
        footer={<Footer table={table} paged={false} />}
        onExit={exitFocus}
        exitButton={false}
      >
        {dataTable}
      </QUI.FocusView>
    );
  }

  return (
    <AcmeShell current={title} header={<PageHeader />} navigation={<AdminNavigation open="Accounts" />}>
      <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
        {toolbar}
      </QUI.Box>
      <QUI.Box grow overflow="hidden" paddingX="4">
        {dataTable}
      </QUI.Box>
      <QUI.Box paddingX="4" paddingY="3">
        <Footer table={table} paged />
      </QUI.Box>
    </AcmeShell>
  );
}
