import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AcmeShell } from "../examples/acme/shell";
import { AdminNavigation } from "../examples/acme/admin-nav";

/**
 * An admin records table — "Account balance logs" — in the Acme shell with an admin navigation tree:
 * search, filters, saved views, sortable columns, row selection and pagination. Built only from qui
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

/** Deterministic sample rows, newest first. */
const logs: Log[] = Array.from({ length: 1000 }, (_, i) => {
  const seed = (i * 7919 + 104729) % 100000;
  const amount = Math.round(((seed * 13) % 2500000) + 1500) / 100;
  const ledgerAmount = Math.round((amount + ((seed * 31) % 4000000) / 100) * 100) / 100;
  const second = 59 - (i % 60);
  const minute = 56 - Math.floor(i / 60);
  return {
    id: 13262499 - i,
    account: accounts[(i * 3) % accounts.length]!,
    amount: i % 11 === 7 ? 0 : amount,
    currency: "AED",
    accountType: seed % 3 === 0 ? "physical" : "virtual",
    manager: managers[i % managers.length]!,
    card: String(1000 + (seed % 9000)),
    balanceUpdatedAt: `2026-10-16T10:${minute}:${String(second).padStart(2, "0")}.${String(seed % 1000).padStart(3, "0")}Z`,
    createdAt: `2026-10-16T10:${String(minute - 1).padStart(2, "0")}:00Z`,
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

/** Fixed "now" for relative dates, so the sample reads the same on every visit. */
const now = new Date("2026-10-18T09:00:00Z");

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type SortKey = "account" | "amount" | "balanceUpdatedAt" | "id" | "ledgerAmount";
type Sort = { key: SortKey; direction: "ascending" | "descending" };

const columns: { key: SortKey | null; label: string; align?: "end" }[] = [
  { key: "account", label: "Account" },
  { key: null, label: "Account manager" },
  { key: null, label: "Card" },
  { key: "amount", label: "Amount", align: "end" },
  { key: null, label: "Balance", align: "end" },
  { key: "ledgerAmount", label: "Ledger amount", align: "end" },
  { key: null, label: "Trend (3M)" },
  { key: null, label: "Status" },
  { key: "balanceUpdatedAt", label: "Balance updated" },
  { key: null, label: "Created" },
  { key: "id", label: "ID" },
  { key: null, label: "Issuer" },
  { key: null, label: "Account status" },
  { key: null, label: "Approvers" },
  { key: null, label: "Credit limit", align: "end" },
  { key: null, label: "Limit used" },
  { key: null, label: "Net flow (MTD)", align: "end" },
  { key: null, label: "MoM", align: "end" },
  { key: null, label: "Transactions", align: "end" },
  { key: null, label: "Avg. settlement", align: "end" },
  { key: null, label: "Statement period" },
];

const pageSize = 50;

function sortLogs(rows: Log[], sort: Sort) {
  const sign = sort.direction === "ascending" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = a[sort.key] ?? "";
    const y = b[sort.key] ?? "";
    return (x < y ? -1 : x > y ? 1 : 0) * sign;
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

function Toolbar({ query, onQuery, view, onView }: { query: string; onQuery: (q: string) => void; view: string; onView: (v: string) => void }) {
  return (
    <QUI.Inline justify="between" gap="2" paddingX="4" paddingBottom="3">
      <QUI.Inline gap="2">
        <QUI.Box width="2xs">
          <QUI.Input
            aria-label="Search balance logs"
            placeholder="Search…"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />}
          />
        </QUI.Box>
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.ListFilter} />} label="Filters" />
        <QUI.Box shrink={false}>
          <QUI.Tabs value={view} onValueChange={(value) => onView(String(value))}>
            <QUI.TabsList aria-label="Records">
              <QUI.Tab value="recent" label="Recent" />
              <QUI.Tab value="all" label="All records" />
            </QUI.TabsList>
          </QUI.Tabs>
        </QUI.Box>
      </QUI.Inline>
      <QUI.Inline gap="1" wrap={false}>
        <QUI.Button variant="ghost" icon={<QUI.Icon icon={Icons.Bookmark} />} label="Save view" />
        <QUI.IconButton variant="secondary" aria-label="Choose columns" icon={<QUI.Icon icon={Icons.Columns3} />} />
        <QUI.IconButton variant="secondary" aria-label="Refresh" icon={<QUI.Icon icon={Icons.RefreshCw} />} />
      </QUI.Inline>
    </QUI.Inline>
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
  onSort: (key: SortKey) => void;
  selected: Set<number>;
  onSelect: (ids: number[], checked: boolean) => void;
  onFilter: (query: string) => void;
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
              sortDirection={column.key ? (sort.key === column.key ? sort.direction : "none") : undefined}
              onSort={column.key ? () => onSort(column.key!) : undefined}
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
              <QUI.TextCell primary={row.account} secondary={row.accountType} tone="link" onClick={() => onFilter(row.account ?? "")} />
            </QUI.TableCell>
            <QUI.TableCell>{row.manager ? <QUI.UserCell name={row.manager.name} secondary={row.manager.email} onClick={() => onFilter(row.manager!.name)} /> : <QUI.EmptyCell />}</QUI.TableCell>
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
              <QUI.TagCell label={row.status} color={statusColor[row.status]} onClick={() => onFilter(row.status)} />
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
  const [view, setView] = React.useState("all");
  const [sort, setSort] = React.useState<Sort>({ key: "id", direction: "descending" });
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<number>>(() => new Set());

  const q = query.trim().toLowerCase();
  const filtered = (view === "recent" ? logs.slice(0, 30) : logs).filter(
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

  const toggleSort = (key: SortKey) => {
    setSort((s) => ({ key, direction: s.key === key && s.direction === "descending" ? "ascending" : "descending" }));
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
        view={view}
        onView={(value) => {
          setView(value);
          setPage(1);
        }}
      />
      <QUI.Box grow overflow="hidden" paddingX="4">
        <LogsTable
          rows={rows}
          sort={sort}
          onSort={toggleSort}
          selected={selected}
          onSelect={select}
          onFilter={(value) => {
            setQuery(value);
            setPage(1);
          }}
        />
      </QUI.Box>
      <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3">
        <QUI.Text size="xs" color="tertiary" tabularNums>
          {selected.size > 0 ? `${selected.size} selected · ` : ""}
          {sorted.length === 0 ? "No records" : `${(current - 1) * pageSize + 1}–${(current - 1) * pageSize + rows.length} of ${sorted.length}`}
        </QUI.Text>
        <QUI.Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
      </QUI.Inline>
    </AcmeShell>
  );
}
