import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AcmeShell } from "../examples/acme/shell";
import { AdminNavigation } from "../examples/acme/admin-nav";

/**
 * An approvals inbox — "Approval requests" — in the Acme shell with the admin navigation: request-type tiles
 * with counts, filter pills, a table of requests with approve / reject actions, and pagination. Built only from
 * qui components — no className or style anywhere in this file.
 */

type Person = { name: string; email: string };
type Status = "Pending" | "Approved" | "Rejected";

type Request = {
  id: number;
  type: string;
  category: Category;
  requestedBy: Person;
  requestedFor: Person;
  description: string | null;
  amount: number;
  currency: string;
  attachments: number;
  status: Status;
  layersDone: number;
  layers: number;
  approvers: { name: string }[];
  requestedAt: string;
};

const categories = [
  { value: "all", label: "All requests" },
  { value: "cards", label: "Card and fund requests" },
  { value: "invoices", label: "Invoices and reimbursements" },
  { value: "transactions", label: "Post-transaction requests" },
  { value: "rewards", label: "Reward requests" },
  { value: "beneficiaries", label: "Global pay beneficiaries" },
  { value: "global-invoices", label: "Global pay invoices" },
] as const;
type Category = Exclude<(typeof categories)[number]["value"], "all">;

const types: { type: string; category: Category }[] = [
  { type: "Card transaction", category: "transactions" },
  { type: "Card transaction", category: "transactions" },
  { type: "Card transaction", category: "transactions" },
  { type: "Card top-up", category: "cards" },
  { type: "Reimbursement", category: "invoices" },
  { type: "Invoice", category: "invoices" },
  { type: "Reward points", category: "rewards" },
  { type: "New beneficiary", category: "beneficiaries" },
  { type: "Global pay invoice", category: "global-invoices" },
];

const me: Person = { name: "Ranu Perera", email: "ranu@acme.com" };
const people: Person[] = [
  { name: "Sohrab Khan", email: "sohrab@acme.com" },
  { name: "Booker Hilpert", email: "api@acme.com" },
  { name: "Candice Smith", email: "candice@acme.com" },
  { name: "Saif Kapadia", email: "saif@acme.com" },
  me,
  { name: "Aisha Khan", email: "aisha@acme.com" },
];
const approverPool = [{ name: "Raul Patel" }, { name: "Nuwan Epa" }, { name: "Mohamed Ali" }];
const descriptions = [null, "Team lunch with client", "Fuel — Dubai to Abu Dhabi", "Software subscription", null, "Office supplies", "Conference tickets"];
const statusColor = { Pending: "yellow", Approved: "emerald", Rejected: "crimson" } as const;

/** Deterministic sample requests, newest first. */
const allRequests: Request[] = Array.from({ length: 640 }, (_, i) => {
  const seed = (i * 7919 + 104729) % 100000;
  const { type, category } = types[(seed >> 3) % types.length]!;
  const requestedBy = people[i % people.length]!;
  const layers = 1 + (seed % 3);
  const status: Status = i % 9 === 4 ? "Approved" : i % 13 === 6 ? "Rejected" : "Pending";
  const day = 17 - Math.floor(i / 40);
  return {
    id: 88412 - i,
    type,
    category,
    requestedBy,
    requestedFor: seed % 4 === 0 ? people[(i + 2) % people.length]! : requestedBy,
    description: descriptions[seed % descriptions.length]!,
    amount: Math.round(((seed * 17) % 480000) + 500) / 100,
    currency: "AED",
    attachments: seed % 5 === 0 ? 0 : seed % 3,
    status,
    layers,
    layersDone: status === "Pending" ? (seed >> 2) % layers : layers,
    approvers: approverPool.slice(0, layers),
    requestedAt: `2026-10-${String(Math.max(day, 1)).padStart(2, "0")}T${String(8 + (i % 10)).padStart(2, "0")}:${String((seed % 60)).padStart(2, "0")}:00Z`,
  };
});

/** One step per approval layer: done, waiting on now (or rejected there), or still to come. */
function layersFor(row: Request): QUI.StatusIconsCellItem[] {
  return Array.from({ length: row.layers }, (_, i) => ({
    label: `Layer ${i + 1} · ${row.approvers[i]?.name ?? "Finance"}`,
    status: i < row.layersDone ? "done" : i === row.layersDone ? (row.status === "Rejected" ? "failed" : "current") : "pending",
  }));
}

const amountRanges = [
  { value: "any", label: "Any amount", test: () => true },
  { value: "under-100", label: "Under 100 AED", test: (n: number) => n < 100 },
  { value: "100-1000", label: "100–1,000 AED", test: (n: number) => n >= 100 && n <= 1000 },
  { value: "over-1000", label: "Over 1,000 AED", test: (n: number) => n > 1000 },
];

const count = new Intl.NumberFormat("en-US");

/** A filter pill opening a single-select menu; shows `name: value` once something other than `all` is chosen. */
export function FilterMenu({ name, value, options, onChange }: { name: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  const chosen = options.find((o) => o.value === value);
  const active = value !== options[0]!.value;
  return (
    <QUI.Menu>
      <QUI.MenuTrigger
        render={<QUI.Pill variant={active ? "soft" : "outline"} label={active ? `${name}: ${chosen?.label}` : name} endIcon={<QUI.Icon icon={Icons.ChevronDown} />} />}
      />
      <QUI.MenuContent align="start">
        {options.map((option) => (
          <QUI.MenuItem key={option.value} selected={option.value === value} onClick={() => onChange(option.value)}>
            {option.label}
          </QUI.MenuItem>
        ))}
      </QUI.MenuContent>
    </QUI.Menu>
  );
}

function PageHeader({ inbox, onInbox }: { inbox: string; onInbox: (value: string) => void }) {
  return (
    <QUI.Box as="header" border="subtle" borderEdge="bottom" paddingX="4" paddingTop="3">
      <QUI.Stack gap="2">
        <QUI.Inline justify="between" gap="4" wrap={false}>
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Icon icon={Icons.ListChecks} size="lg" tint="secondary" />
            <QUI.Heading level={1} size={5} weight="semibold" truncate>
              Approval requests
            </QUI.Heading>
          </QUI.Inline>
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.Download} />} label="Export" />
            <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.Workflow} />} label="Approval rules" />
          </QUI.Inline>
        </QUI.Inline>
        <QUI.Tabs variant="underline" value={inbox} onValueChange={(value) => onInbox(String(value))}>
          <QUI.TabsList aria-label="Inbox">
            <QUI.Tab value="to-approve" label="To approve" />
            <QUI.Tab value="mine" label="Requested by me" />
          </QUI.TabsList>
        </QUI.Tabs>
      </QUI.Stack>
    </QUI.Box>
  );
}

type Filters = { query: string; status: string; requester: string; type: string; amount: string };
const noFilters: Filters = { query: "", status: "Pending", requester: "all", type: "all", amount: "any" };

function Toolbar({ filters, onFilters }: { filters: Filters; onFilters: (next: Partial<Filters>) => void }) {
  const changed = JSON.stringify(filters) !== JSON.stringify(noFilters);
  return (
    <QUI.Inline justify="between" gap="2" paddingX="4" paddingBottom="3">
      <QUI.Inline gap="2">
        <QUI.Box width="2xs">
          <QUI.Input
            aria-label="Search approval requests"
            placeholder="Search…"
            value={filters.query}
            onChange={(event) => onFilters({ query: event.target.value })}
            startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />}
          />
        </QUI.Box>
        <FilterMenu
          name="Status"
          value={filters.status}
          options={[{ value: "all", label: "Any status" }, { value: "Pending", label: "Pending" }, { value: "Approved", label: "Approved" }, { value: "Rejected", label: "Rejected" }]}
          onChange={(status) => onFilters({ status })}
        />
        <FilterMenu
          name="Requested by"
          value={filters.requester}
          options={[{ value: "all", label: "Anyone" }, ...people.map((p) => ({ value: p.name, label: p.name }))]}
          onChange={(requester) => onFilters({ requester })}
        />
        <FilterMenu
          name="Request type"
          value={filters.type}
          options={[{ value: "all", label: "Any type" }, ...[...new Set(types.map((t) => t.type))].map((t) => ({ value: t, label: t }))]}
          onChange={(type) => onFilters({ type })}
        />
        <FilterMenu name="Amount" value={filters.amount} options={amountRanges} onChange={(amount) => onFilters({ amount })} />
        <QUI.Pill variant="ghost" label="Filter" startIcon={<QUI.Icon icon={Icons.Plus} />} />
        {changed ? <QUI.Button variant="ghost" icon={<QUI.Icon icon={Icons.X} />} label="Clear all" onClick={() => onFilters(noFilters)} /> : null}
      </QUI.Inline>
      <QUI.IconButton variant="secondary" aria-label="Refresh" icon={<QUI.Icon icon={Icons.RefreshCw} />} />
    </QUI.Inline>
  );
}

const columns: { label: string; align?: "end" }[] = [
  { label: "Type" },
  { label: "Requested by" },
  { label: "Requested for" },
  { label: "Description" },
  { label: "Amount", align: "end" },
  { label: "Attachments", align: "end" },
  { label: "Status" },
  { label: "Approval layers" },
  { label: "Approvers" },
  { label: "Requested" },
  { label: "Actions" },
];

function RequestsTable({
  rows,
  selected,
  onSelect,
  onDecide,
  onFilters,
}: {
  rows: Request[];
  selected: Set<number>;
  onSelect: (ids: number[], checked: boolean) => void;
  onDecide: (id: number, status: Status) => void;
  onFilters: (next: Partial<Filters>) => void;
}) {
  const selectedOnPage = rows.filter((row) => selected.has(row.id)).length;
  return (
    <QUI.Table aria-label="Approval requests">
      <QUI.TableHeader>
        <QUI.TableRow>
          <QUI.TableHead>
            <QUI.Checkbox
              aria-label="Select all requests on this page"
              checked={rows.length > 0 && selectedOnPage === rows.length}
              indeterminate={selectedOnPage > 0 && selectedOnPage < rows.length}
              onCheckedChange={(checked) => onSelect(rows.map((row) => row.id), checked)}
            />
          </QUI.TableHead>
          {columns.map((column) => (
            <QUI.TableHead key={column.label} align={column.align}>
              {column.label}
            </QUI.TableHead>
          ))}
        </QUI.TableRow>
      </QUI.TableHeader>
      <QUI.TableBody>
        {rows.map((row) => (
          <QUI.TableRow key={row.id} selected={selected.has(row.id)}>
            <QUI.TableCell>
              <QUI.Checkbox aria-label={`Select request ${row.id}`} checked={selected.has(row.id)} onCheckedChange={(checked) => onSelect([row.id], checked)} />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.TextCell primary={row.type} secondary={`#${row.id}`} onClick={() => onFilters({ type: row.type })} />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.UserCell name={row.requestedBy.name} secondary={row.requestedBy.email} onClick={() => onFilters({ requester: row.requestedBy.name })} />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.UserCell name={row.requestedFor.name} secondary={row.requestedFor.email} />
            </QUI.TableCell>
            <QUI.TableCell>{row.description ? <QUI.TextCell primary={row.description} /> : <QUI.EmptyCell />}</QUI.TableCell>
            <QUI.TableCell align="end">
              <QUI.MoneyCell amount={row.amount} currency={row.currency} display="code" locale="en-US" />
            </QUI.TableCell>
            <QUI.TableCell align="end">{row.attachments ? <QUI.NumberCell value={row.attachments} format="integer" /> : <QUI.EmptyCell />}</QUI.TableCell>
            <QUI.TableCell>
              <QUI.TagCell label={row.status} color={statusColor[row.status]} onClick={() => onFilters({ status: row.status })} />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.StatusIconsCell items={layersFor(row)} />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.UsersCell users={row.approvers} />
            </QUI.TableCell>
            <QUI.TableCell>
              <QUI.DateCell value={row.requestedAt} format="datetime" locale="en-GB" />
            </QUI.TableCell>
            <QUI.TableCell>
              {row.status === "Pending" ? (
                <QUI.Inline gap="1" wrap={false}>
                  <QUI.Button size="sm" variant="danger-outline" label="Reject" onClick={() => onDecide(row.id, "Rejected")} />
                  <QUI.Button size="sm" variant="secondary" icon={<QUI.Icon icon={Icons.Check} />} label="Approve" onClick={() => onDecide(row.id, "Approved")} />
                </QUI.Inline>
              ) : (
                <QUI.EmptyCell />
              )}
            </QUI.TableCell>
          </QUI.TableRow>
        ))}
      </QUI.TableBody>
    </QUI.Table>
  );
}

const pageSizes = [20, 50, 100];

/** Playground page: the approval-requests inbox in the Acme shell with the admin navigation. */
export function ApprovalRequestsPage() {
  const [inbox, setInbox] = React.useState("to-approve");
  const [category, setCategory] = React.useState("all");
  const [filters, setFilters] = React.useState<Filters>(noFilters);
  const [decisions, setDecisions] = React.useState<Record<number, Status>>({});
  const [selected, setSelected] = React.useState<Set<number>>(() => new Set());
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  const requests = allRequests.map((row) => {
    const decided = decisions[row.id];
    return decided ? { ...row, status: decided, layersDone: decided === "Approved" ? row.layers : row.layersDone } : row;
  });
  const range = amountRanges.find((r) => r.value === filters.amount) ?? amountRanges[0]!;
  const q = filters.query.trim().toLowerCase();
  // Everything but the request-type tiles, so each tile can count what it would show.
  const matching = requests.filter(
    (row) =>
      (inbox === "mine" ? row.requestedBy === me : row.requestedBy !== me) &&
      (filters.status === "all" || row.status === filters.status) &&
      (filters.requester === "all" || row.requestedBy.name === filters.requester) &&
      (filters.type === "all" || row.type === filters.type) &&
      range.test(row.amount) &&
      (!q || String(row.id).includes(q) || row.type.toLowerCase().includes(q) || row.requestedBy.name.toLowerCase().includes(q) || (row.description ?? "").toLowerCase().includes(q))
  );
  const filtered = category === "all" ? matching : matching.filter((row) => row.category === category);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);

  const updateFilters = (next: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };
  const select = (ids: number[], checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) checked ? next.add(id) : next.delete(id);
      return next;
    });
  const decide = (ids: number[], status: Status) => {
    setDecisions((prev) => ({ ...prev, ...Object.fromEntries(ids.map((id) => [id, status])) }));
    setSelected(new Set());
  };
  const pendingSelected = [...selected].filter((id) => requests.find((row) => row.id === id)?.status === "Pending");

  return (
    <AcmeShell
      current="Approval requests"
      header={
        <PageHeader
          inbox={inbox}
          onInbox={(value) => {
            setInbox(value);
            setPage(1);
          }}
        />
      }
      navigation={<AdminNavigation open="Accounts" />}
    >
      <QUI.Box paddingX="4" paddingY="3">
        <QUI.Tabs
          variant="card"
          value={category}
          onValueChange={(value) => {
            setCategory(String(value));
            setPage(1);
          }}
        >
          <QUI.TabsList aria-label="Request types">
            {categories.map((c) => (
              <QUI.Tab
                key={c.value}
                value={c.value}
                label={c.label}
                count={count.format(c.value === "all" ? matching.length : matching.filter((row) => row.category === c.value).length)}
              />
            ))}
          </QUI.TabsList>
        </QUI.Tabs>
      </QUI.Box>
      <Toolbar filters={filters} onFilters={updateFilters} />
      <QUI.Box grow overflow="hidden" paddingX="4">
        <RequestsTable rows={rows} selected={selected} onSelect={select} onDecide={(id, status) => decide([id], status)} onFilters={updateFilters} />
      </QUI.Box>
      <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3">
        <QUI.Inline gap="3">
          <QUI.Text size="xs" color="tertiary" tabularNums>
            {filtered.length === 0 ? "No requests" : `${(current - 1) * pageSize + 1}–${(current - 1) * pageSize + rows.length} of ${count.format(filtered.length)}`}
          </QUI.Text>
          {pendingSelected.length > 0 ? (
            <QUI.Inline gap="1" wrap={false}>
              <QUI.Button size="sm" variant="danger-outline" label={`Reject ${pendingSelected.length}`} onClick={() => decide(pendingSelected, "Rejected")} />
              <QUI.Button size="sm" variant="primary" icon={<QUI.Icon icon={Icons.Check} />} label={`Approve ${pendingSelected.length}`} onClick={() => decide(pendingSelected, "Approved")} />
            </QUI.Inline>
          ) : null}
        </QUI.Inline>
        <QUI.Inline gap="3" wrap={false}>
          <QUI.Menu>
            <QUI.MenuTrigger render={<QUI.Pill label={`${pageSize} per page`} endIcon={<QUI.Icon icon={Icons.ChevronDown} />} />} />
            <QUI.MenuContent align="end">
              {pageSizes.map((size) => (
                <QUI.MenuItem
                  key={size}
                  selected={size === pageSize}
                  onClick={() => {
                    setPageSize(size);
                    setPage(1);
                  }}
                >
                  {size} per page
                </QUI.MenuItem>
              ))}
            </QUI.MenuContent>
          </QUI.Menu>
          <QUI.Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
        </QUI.Inline>
      </QUI.Inline>
    </AcmeShell>
  );
}
