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

type Direction = "ascending" | "descending";
type Sort = { key: string; direction: Direction };

/**
 * The table's columns. `value` is what a column sorts by; a column without one can't be sorted. Text sorts A→Z on the
 * first click, numbers and dates largest/newest first.
 */
const columns: { label: string; align?: "end"; value?: (row: Log) => string | number }[] = [
  { label: "Account", value: (row) => row.account ?? "" },
  { label: "Account manager", value: (row) => row.manager?.name ?? "" },
  { label: "Card", value: (row) => row.card },
  { label: "Amount", align: "end", value: (row) => row.amount },
  { label: "Balance", align: "end" },
  { label: "Ledger amount", align: "end", value: (row) => row.ledgerAmount },
  { label: "Trend (3M)", value: (row) => row.ledgerAmount - trendFor(row)[0]! },
  { label: "Status", value: (row) => row.id % 5 },
  { label: "Balance updated", value: (row) => row.balanceUpdatedAt },
  { label: "Created", value: (row) => row.createdAt },
  { label: "ID", value: (row) => row.id },
  { label: "Issuer", value: (row) => row.issuer },
  { label: "Account status", value: (row) => row.status },
  { label: "Approvers", value: (row) => row.approvers.length },
  { label: "Credit limit", align: "end", value: (row) => row.creditLimit },
  { label: "Limit used", value: (row) => row.limitUsed },
  { label: "Net flow (MTD)", align: "end", value: (row) => row.netFlow },
  { label: "MoM", align: "end", value: (row) => row.momChange },
  { label: "Transactions", align: "end", value: (row) => row.transactions },
  { label: "Avg. settlement", align: "end", value: (row) => row.avgSettlement },
  { label: "Statement period", value: (row) => row.periodStart },
];

/** Dates are ISO strings, so they sort as text but read as "newest first" like numbers. */
const firstDirection = (label: string): Direction => {
  const sample = columns.find((c) => c.label === label)!.value!(logs[0]!);
  return typeof sample === "number" || /^\d{4}-\d{2}-\d{2}T/.test(sample) ? "descending" : "ascending";
};

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

/** Filters live in the hash's query (`#/examples/tables/?status=Frozen`), so a filtered view can be shared or reloaded. */
const readFilters = () => QUI.filtersFromParams(filterFields, new URLSearchParams(window.location.hash.split("?")[1] ?? ""));
function writeFilters(state: QUI.FilterState) {
  const [path, query] = window.location.hash.split("?");
  const params = QUI.filtersToParams(filterFields, state, new URLSearchParams(query ?? "")).toString();
  const base = path!.endsWith("/") || !params ? path : `${path}/`;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${base}${params ? `?${params}` : ""}`);
}

function sortLogs(rows: Log[], sort: Sort) {
  const value = columns.find((c) => c.label === sort.key)?.value;
  if (!value) return rows;
  const sign = sort.direction === "ascending" ? 1 : -1;
  const text = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
  return [...rows].sort((a, b) => {
    const x = value(a);
    const y = value(b);
    return (typeof x === "number" && typeof y === "number" ? x - y : text.compare(String(x), String(y))) * sign;
  });
}

function PageHeader() {
  return (
    <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Icon icon={Icons.WalletCards} size="lg" tint="secondary" />
        <QUI.Heading level={1} size={5} weight="semibold" truncate>
          Account balance logs
        </QUI.Heading>
      </QUI.Inline>
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
    </QUI.Inline>
  );
}

function Toolbar({ query, onQuery, filters, onFilters }: { query: string; onQuery: (q: string) => void; filters: QUI.FilterState; onFilters: (next: QUI.FilterState) => void }) {
  return (
    <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
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
            <QUI.IconButton variant="secondary" aria-label="Choose columns" icon={<QUI.Icon icon={Icons.Columns3} />} />
            <QUI.IconButton variant="secondary" aria-label="Refresh" icon={<QUI.Icon icon={Icons.RefreshCw} />} />
          </>
        }
      />
    </QUI.Box>
  );
}

/** The records table. Clicking an account, manager or status filters the table to it via `onFilter`. */
function LogsTable({
  rows,
  sort,
  onSort,
  selected,
  onSelect,
  onFilter,
}: {
  rows: Log[];
  sort: Sort;
  onSort: (key: string) => void;
  selected: Set<number>;
  onSelect: (ids: number[], checked: boolean) => void;
  onFilter: (key: string, value: string) => void;
}) {
  const selectedOnPage = rows.filter((row) => selected.has(row.id)).length;
  return (
    <QUI.Table aria-label="Account balance logs">
      <QUI.TableHeader>
        <QUI.TableRow>
          <QUI.TableHead>
            <QUI.Checkbox
              aria-label="Select all rows on this page"
              checked={rows.length > 0 && selectedOnPage === rows.length}
              indeterminate={selectedOnPage > 0 && selectedOnPage < rows.length}
              onCheckedChange={(checked) => onSelect(rows.map((row) => row.id), checked)}
            />
          </QUI.TableHead>
          {columns.map((column) => (
            <QUI.TableHead
              key={column.label}
              align={column.align}
              sortDirection={column.value ? (sort.key === column.label ? sort.direction : "none") : undefined}
              onSort={column.value ? () => onSort(column.label) : undefined}
            >
              {column.label}
            </QUI.TableHead>
          ))}
        </QUI.TableRow>
      </QUI.TableHeader>
      <QUI.TableBody>
        {rows.map((row) => (
          <QUI.TableRow key={row.id} selected={selected.has(row.id)}>
            <QUI.TableCell>
              <QUI.Checkbox aria-label={`Select log ${row.id}`} checked={selected.has(row.id)} onCheckedChange={(checked) => onSelect([row.id], checked)} />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.TextCell primary={row.account} secondary={row.accountType} tone="link" onClick={() => onFilter("account", row.account ?? "")} />
            </QUI.TableCell>
            <QUI.TableCell>{row.manager ? <QUI.UserCell name={row.manager.name} secondary={row.manager.email} onClick={() => onFilter("manager", row.manager!.name)} /> : <QUI.EmptyCell />}</QUI.TableCell>
            <QUI.TableCell>
              <QUI.MaskedCell last={row.card} />
            </QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.MoneyCell amount={row.amount} currency={row.currency} display="code" locale="en-US" />
            </QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.MoneyCell amount={null} currency={row.currency} />
            </QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.MoneyCell amount={row.ledgerAmount} currency={row.currency} display="none" minor="subdued" locale="en-US" />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.TrendCell values={trendFor(row)} label="Ledger balance, last 3 months" locale="en-US" />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.StatusIconsCell items={stepsFor(row)} />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.DateCell value={row.balanceUpdatedAt} format="datetime" locale="en-GB" />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.DateCell value={row.createdAt} format="relative" now={now} locale="en-US" />
            </QUI.TableCell>
            <QUI.TableCell>{row.id}</QUI.TableCell>
            <QUI.TableCell>
              <QUI.TagCell label={row.issuer} color="indigo" />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.TagCell label={row.status} color={statusColor[row.status]} onClick={() => onFilter("status", row.status)} />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.UsersCell users={row.approvers} />
            </QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.MoneyCell amount={row.creditLimit} currency={row.currency} display="code" notation="compact" locale="en-US" />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.ProgressCell value={row.limitUsed} variant={row.limitUsed >= 90 ? "danger" : row.limitUsed >= 70 ? "warning" : "brand"} aria-label="Credit limit used" />
            </QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.MoneyCell amount={row.netFlow} currency={row.currency} display="none" negative="parentheses" locale="en-US" />
            </QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.ChangeCell value={row.momChange} locale="en-US" />
            </QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.NumberCell value={row.transactions} format="integer" locale="en-US" />
            </QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.NumberCell value={row.avgSettlement} format="duration" />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.DateRangeCell start={row.periodStart} end={row.periodEnd} locale="en-GB" />
            </QUI.TableCell>
          </QUI.TableRow>
        ))}
      </QUI.TableBody>
    </QUI.Table>
  );
}

/** Playground page: the balance-log records table in the Acme shell with the admin navigation. */
export function BalanceLogsPage() {
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState(readFilters);
  const [sort, setSort] = React.useState<Sort>({ key: "ID", direction: "descending" });
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<number>>(() => new Set());

  const q = query.trim().toLowerCase();
  const filtered = QUI.filterRows(logs, filterFields, filters, { now }).filter(
    (row) =>
      !q ||
      String(row.id).includes(q) ||
      (row.account ?? "").toLowerCase().includes(q) ||
      (row.manager?.name ?? "").toLowerCase().includes(q) ||
      row.status.toLowerCase() === q ||
      money.format(row.amount).includes(q)
  );
  const sorted = sortLogs(filtered, sort);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pageCount);
  const rows = sorted.slice((current - 1) * pageSize, current * pageSize);

  const changeFilters = (next: QUI.FilterState) => {
    setFilters(next);
    writeFilters(next);
    setPage(1);
  };
  const toggleSort = (key: string) => {
    setSort((s) => ({ key, direction: s.key === key ? (s.direction === "descending" ? "ascending" : "descending") : firstDirection(key) }));
    setPage(1);
  };
  const select = (ids: number[], checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) checked ? next.add(id) : next.delete(id);
      return next;
    });

  return (
    <AcmeShell current="Account balance logs" header={<PageHeader />} navigation={<AdminNavigation open="Accounts" />}>
      <Toolbar
        query={query}
        onQuery={(value) => {
          setQuery(value);
          setPage(1);
        }}
        filters={filters}
        onFilters={changeFilters}
      />
      <QUI.Box grow overflow="hidden" paddingX="4">
        <LogsTable
          rows={rows}
          sort={sort}
          onSort={toggleSort}
          selected={selected}
          onSelect={select}
          onFilter={(key, value) => changeFilters({ ...filters, [key]: [value] })}
        />
      </QUI.Box>
      <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3">
        <QUI.Text size="xs" color="tertiary" tabularNums>
          {sorted.length === 0 ? "No records match these filters" : `${(current - 1) * pageSize + 1}–${(current - 1) * pageSize + rows.length} of ${sorted.length}`}
        </QUI.Text>
        <QUI.ActionBar
          placement="inline"
          open={selected.size > 0}
          aria-label="Bulk actions"
          summary={`${selected.size} ${selected.size === 1 ? "record" : "records"} selected`}
          onClear={() => setSelected(new Set())}
        >
          <QUI.ActionBarButton icon={<QUI.Icon icon={Icons.Download} />} label="Export" onClick={() => setSelected(new Set())} />
          <QUI.ActionBarButton icon={<QUI.Icon icon={Icons.FileText} />} label="Statements" onClick={() => setSelected(new Set())} />
        </QUI.ActionBar>
        <QUI.Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
      </QUI.Inline>
    </AcmeShell>
  );
}
