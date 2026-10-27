import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AcmeShell } from "../examples/acme/shell";

/**
 * An audit trail — "Activity log" — that loads a page at a time as you scroll: a virtualized `DataTable` whose
 * `onEndReached` fetches the next page from a fake server and appends it. Built only from qui components — no
 * className or style anywhere in this file.
 */

type Event = {
  id: number;
  at: string;
  actor: { name: string; email: string };
  action: string;
  target: string;
  area: "Cards" | "Accounts" | "Payments" | "Users" | "Settings";
  ip: string;
  result: "Success" | "Failed" | "Blocked";
};

const title = "Activity log";
const total = 2000;
const pageSize = 50;
/** How long the fake server takes to answer, so the loading row has time to show. */
const latency = 700;

const now = new Date("2026-10-18T09:00:00Z");
const actors = [
  { name: "Saif Kapadia", email: "saif@acme.com" },
  { name: "Mashood Pookkadan", email: "mashood@acme.com" },
  { name: "Candice Smith", email: "candice@acme.com" },
  { name: "Sohrab Khan", email: "sohrab@acme.com" },
  { name: "Aisha Khan", email: "aisha@acme.com" },
];
const actions: { action: string; area: Event["area"]; target: (seed: number) => string }[] = [
  { action: "Froze card", area: "Cards", target: (s) => `Card •••• ${1000 + (s % 9000)}` },
  { action: "Raised card limit", area: "Cards", target: (s) => `Card •••• ${1000 + ((s * 3) % 9000)}` },
  { action: "Opened account", area: "Accounts", target: (s) => `ACC-${20000 + (s % 8000)}` },
  { action: "Approved payment", area: "Payments", target: (s) => `PAY-${400000 + (s % 90000)}` },
  { action: "Refunded payment", area: "Payments", target: (s) => `PAY-${400000 + ((s * 7) % 90000)}` },
  { action: "Invited user", area: "Users", target: (s) => actors[s % actors.length]!.email },
  { action: "Changed role", area: "Users", target: (s) => actors[(s + 2) % actors.length]!.name },
  { action: "Updated approval policy", area: "Settings", target: () => "Spend over AED 10k" },
];
const areaColor = { Cards: "indigo", Accounts: "emerald", Payments: "orange", Users: "purple", Settings: "grey" } as const;
const resultColor = { Success: "emerald", Failed: "crimson", Blocked: "yellow" } as const;

/** The event at `index`, newest first: the same on every visit. */
function eventAt(index: number): Event {
  const seed = (index * 7919 + 104729) % 100000;
  const { action, area, target } = actions[seed % actions.length]!;
  return {
    id: 880000 - index,
    at: new Date(now.getTime() - index * 17 * 60 * 1000 - (seed % 600) * 1000).toISOString(),
    actor: actors[(index * 3) % actors.length]!,
    action,
    target: target(seed),
    area,
    ip: `10.${seed % 255}.${(seed * 3) % 255}.${(seed * 7) % 255}`,
    result: seed % 19 === 4 ? "Failed" : seed % 31 === 9 ? "Blocked" : "Success",
  };
}

/** A fake API: one page of events, after `latency` ms. */
function fetchPage(page: number): Promise<Event[]> {
  const start = page * pageSize;
  const rows = Array.from({ length: Math.max(0, Math.min(pageSize, total - start)) }, (_, i) => eventAt(start + i));
  return new Promise((resolve) => window.setTimeout(() => resolve(rows), latency));
}

const columns: QUI.DataTableColumn<Event>[] = [
  { id: "at", header: "Time", size: 150, accessorFn: (row) => row.at, cell: ({ row: { original: row } }) => <QUI.DateCell value={row.at} format="datetime" locale="en-GB" /> },
  { id: "actor", header: "User", size: 220, accessorFn: (row) => row.actor.name, cell: ({ row: { original: row } }) => <QUI.UserCell name={row.actor.name} secondary={row.actor.email} /> },
  { id: "action", header: "Action", size: 200, accessorFn: (row) => row.action, cell: ({ row: { original: row } }) => <QUI.TextCell primary={row.action} secondary={row.target} /> },
  { id: "area", header: "Area", size: 110, accessorFn: (row) => row.area, cell: ({ row: { original: row } }) => <QUI.TagCell label={row.area} color={areaColor[row.area]} /> },
  { id: "ip", header: "IP address", size: 130, accessorFn: (row) => row.ip, cell: ({ row: { original: row } }) => <QUI.TextCell primary={row.ip} /> },
  { id: "result", header: "Result", size: 110, accessorFn: (row) => row.result, cell: ({ row: { original: row } }) => <QUI.TagCell label={row.result} color={resultColor[row.result]} /> },
  { id: "id", header: "Event ID", size: 100, meta: { align: "end" }, accessorFn: (row) => row.id },
];

/** Pages already fetched, and whether the next one is on its way. */
function useEvents() {
  const [rows, setRows] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(false);
  /** Bumped by `reload`, so a page that lands after a reload is dropped and the table starts over. */
  const [run, setRun] = React.useState(0);
  const runRef = React.useRef(run);
  runRef.current = run;
  const loaded = React.useRef(0);
  loaded.current = rows.length;

  const loadMore = React.useCallback(() => {
    const current = runRef.current;
    setLoading(true);
    fetchPage(Math.ceil(loaded.current / pageSize)).then((page) => {
      if (runRef.current !== current) return;
      setRows((prev) => [...prev, ...page]);
      setLoading(false);
    });
  }, []);

  const reload = () => {
    setRun((n) => n + 1);
    setRows([]);
    setLoading(false);
  };

  return { rows, loading, done: rows.length >= total, loadMore, reload, run };
}

function PageHeader({ onReload }: { onReload: () => void }) {
  return (
    <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Icon icon={Icons.History} size="lg" tint="secondary" />
        <QUI.Heading level={1} size={5} weight="semibold" truncate>
          {title}
        </QUI.Heading>
      </QUI.Inline>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.RefreshCw} />} label="Reload" onClick={onReload} />
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.Download} />} label="Export" />
      </QUI.Inline>
    </QUI.Inline>
  );
}

/** Playground page: an infinite-scroll audit log, 50 events per page, 2,000 in all. */
export function ActivityLogPage() {
  const { rows, loading, done, loadMore, reload, run } = useEvents();
  const table = QUI.useDataTable({ data: rows, columns, getRowId: (row) => String(row.id), enableSorting: false });
  const pages = Math.ceil(rows.length / pageSize);

  return (
    <AcmeShell current={title} header={<PageHeader onReload={reload} />}>
      <QUI.Box grow overflow="hidden" paddingX="4">
        <QUI.DataTable key={run} table={table} aria-label={title} virtual onEndReached={done ? undefined : loadMore} loadingMore={loading} />
      </QUI.Box>
      <QUI.Box paddingX="4" paddingY="3">
        <QUI.Inline justify="between" gap="4">
          <QUI.Text size="xs" color="tertiary" tabularNums>
            {`${rows.length.toLocaleString("en-US")} of ${total.toLocaleString("en-US")} events loaded · ${pages} of ${total / pageSize} pages`}
          </QUI.Text>
          <QUI.Text size="xs" color="tertiary">
            {done ? "All events loaded" : loading ? "Loading the next page…" : "Scroll down to load more"}
          </QUI.Text>
        </QUI.Inline>
      </QUI.Box>
    </AcmeShell>
  );
}
