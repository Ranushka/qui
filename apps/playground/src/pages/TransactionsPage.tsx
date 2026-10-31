import * as React from "react";
import * as QUI from "@qui/ui";
import { Icons } from "@qui/ui";
import { AcmeShell } from "../examples/acme/shell";
import { categoryColor, departments, merchants, people, syncColor, today, transactions as allTransactions, type Transaction } from "../examples/acme/spend-data";
import { FilterMenu } from "./ApprovalRequestsPage";

/**
 * Card transactions — the spend-management workhorse — in the Acme shell: view tiles with counts (all, missing
 * receipts, policy flags, not synced), filters, a selectable table with bulk actions, and a details drawer with
 * the receipt, memo, policy and sync status. `?view=` and `?q=` in the URL pre-filter it, so the overview's
 * counts open the matching list. Built only from qui components — no className or style anywhere in this file.
 */

const views = [
  { value: "all", label: "All transactions", test: () => true },
  { value: "missing", label: "Missing receipts", test: (t: Transaction) => t.receipt === "Missing" },
  { value: "flagged", label: "Policy flags", test: (t: Transaction) => t.policy != null },
  { value: "unsynced", label: "Not synced", test: (t: Transaction) => t.sync === "Ready" || t.sync === "Failed" },
] as const;

type Filters = { query: string; category: string; department: string; cardholder: string; receipt: string };
const noFilters: Filters = { query: "", category: "all", department: "all", cardholder: "all", receipt: "all" };

const pageSize = 50;
const formatAed = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "AED", currencyDisplay: "code" }).format(amount);
const categories = [...new Set(merchants.map((m) => m.category))];

/** `view`, `q` and `department` from the hash's query string, e.g. `#/examples/tables/transactions?view=missing`. */
function readHashParams() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  const view = params.get("view");
  return { view: views.some((v) => v.value === view) ? view! : "all", query: params.get("q") ?? "", department: params.get("department") ?? "all" };
}

function PageHeader() {
  return (
    <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Icon icon={Icons.ReceiptText} size="lg" tint="secondary" />
        <QUI.Heading level={1} size={5} weight="semibold" truncate>
          Transactions
        </QUI.Heading>
      </QUI.Inline>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.RefreshCcwDot} />} label="Sync to accounting" />
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.Download} />} label="Export" />
      </QUI.Inline>
    </QUI.Inline>
  );
}

/** Receipt state as a tag: attached, missing (needs action) or not required. */
function ReceiptTag({ receipt }: { receipt: Transaction["receipt"] }) {
  return <QUI.TagCell label={receipt} color={receipt === "Attached" ? "emerald" : receipt === "Missing" ? "crimson" : "grey"} />;
}

function TransactionDrawer({
  transaction,
  onClose,
  onUpdate,
}: {
  transaction: Transaction | null;
  onClose: () => void;
  onUpdate: (id: number, patch: Partial<Transaction>) => void;
}) {
  const t = transaction;
  return (
    <QUI.Drawer open={t != null} onOpenChange={(open) => (open ? null : onClose())}>
      <QUI.DrawerContent size="sm" aria-label="Transaction details">
        {t ? (
          <QUI.Stack height="full">
            <QUI.Box grow overflow="auto" padding="4">
              <QUI.Stack gap="5">
                <QUI.Stack gap="1">
                  <QUI.Inline gap="2" wrap={false}>
                    <QUI.Badge size="xs" label={t.category} />
                    <QUI.Text variant="caption" size="md" color="tertiary">
                      #{t.id}
                    </QUI.Text>
                  </QUI.Inline>
                  <QUI.DrawerTitle>{t.merchant}</QUI.DrawerTitle>
                  <QUI.Heading level={3} size={3} weight="semibold">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "AED", currencyDisplay: "code" }).format(t.amount)}
                  </QUI.Heading>
                  <QUI.DrawerDescription>
                    {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(t.date))} · card ending {t.last4}
                  </QUI.DrawerDescription>
                </QUI.Stack>

                {t.policy ? (
                  <QUI.Banner variant="warning" title={t.policy}>
                    {t.policy === "Over limit"
                      ? "This is above the AED 8,000 single-transaction limit for this card."
                      : t.policy === "Weekend spend"
                        ? "Meals on a weekend need a business reason in the memo."
                        : "This merchant category is blocked by the card policy."}
                  </QUI.Banner>
                ) : null}

                <QUI.Stack gap="2">
                  <QUI.Text size="xs" weight="semibold" color="secondary">
                    Receipt
                  </QUI.Text>
                  <QUI.ReceiptPreview
                    file={t.receipt === "Attached" ? { name: `${t.merchant.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${t.id}.pdf`, detail: "Matched automatically" } : null}
                    emptyLabel={t.receipt === "Not required" ? "Not required under AED 75" : "Required for spend over AED 75"}
                    onView={() => {}}
                    onReplace={() => {}}
                    onUpload={t.receipt === "Missing" ? () => onUpdate(t.id, { receipt: "Attached" }) : undefined}
                    onRequest={t.receipt === "Missing" ? () => {} : undefined}
                  />
                </QUI.Stack>

                <QUI.Grid columns={2} gap="4">
                  <QUI.Property icon={Icons.UserRound} label="Cardholder">
                    <QUI.UserCell name={t.cardholder.name} secondary={t.cardholder.email} />
                  </QUI.Property>
                  <QUI.Property icon={Icons.Building2} label="Department">
                    <QUI.Text size="sm" color="primary">
                      {t.department}
                    </QUI.Text>
                  </QUI.Property>
                  <QUI.Property icon={Icons.Tag} label="Category">
                    <QUI.Menu>
                      <QUI.MenuTrigger render={<QUI.Pill size="sm" label={t.category} endIcon={<QUI.Icon icon={Icons.ChevronDown} />} />} />
                      <QUI.MenuContent align="start">
                        {categories.map((c) => (
                          <QUI.MenuItem key={c} selected={c === t.category} onClick={() => onUpdate(t.id, { category: c })}>
                            {c}
                          </QUI.MenuItem>
                        ))}
                      </QUI.MenuContent>
                    </QUI.Menu>
                  </QUI.Property>
                  <QUI.Property icon={Icons.RefreshCcwDot} label="Accounting">
                    <QUI.TagCell label={t.sync} color={syncColor[t.sync]} />
                  </QUI.Property>
                </QUI.Grid>

                <QUI.Stack gap="2">
                  <QUI.Text as="label" size="xs" weight="semibold" color="secondary" htmlFor="transaction-memo">
                    Memo
                  </QUI.Text>
                  <QUI.TextArea
                    id="transaction-memo"
                    placeholder="What was this for?"
                    autoResize
                    maxRows={5}
                    value={t.memo ?? ""}
                    onChange={(event) => onUpdate(t.id, { memo: event.target.value || null })}
                  />
                </QUI.Stack>
              </QUI.Stack>
            </QUI.Box>
            <QUI.Box border="subtle" borderEdge="top" padding="4">
              <QUI.Inline justify="end" gap="2">
              <QUI.Button variant="ghost" label="Exclude from sync" onClick={() => onUpdate(t.id, { sync: "Excluded" })} />
              <QUI.Button
                variant="primary"
                icon={<QUI.Icon icon={Icons.Check} />}
                label="Mark reviewed"
                onClick={() => {
                  onUpdate(t.id, { policy: null, sync: t.sync === "Failed" ? "Ready" : t.sync });
                  onClose();
                }}
              />
              </QUI.Inline>
            </QUI.Box>
          </QUI.Stack>
        ) : null}
      </QUI.DrawerContent>
    </QUI.Drawer>
  );
}

/** Playground page: the card transactions table with view tiles, filters, bulk actions and a details drawer. */
export function TransactionsPage() {
  const [rows, setRows] = React.useState<Transaction[]>(allTransactions);
  const [view, setView] = React.useState(() => readHashParams().view);
  const [filters, setFilters] = React.useState<Filters>(() => ({ ...noFilters, query: readHashParams().query, department: readHashParams().department }));
  const [selected, setSelected] = React.useState<Set<number>>(() => new Set());
  const [openId, setOpenId] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [notice, setNotice] = React.useState<string | null>(null);

  // Follow `?view=` / `?q=` when another screen links here while this one is open.
  React.useEffect(() => {
    const onChange = () => {
      const params = readHashParams();
      setView(params.view);
      setFilters({ ...noFilters, query: params.query, department: params.department });
      setPage(1);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const q = filters.query.trim().toLowerCase();
  const matching = rows.filter(
    (t) =>
      (filters.category === "all" || t.category === filters.category) &&
      (filters.department === "all" || t.department === filters.department) &&
      (filters.cardholder === "all" || t.cardholder.name === filters.cardholder) &&
      (filters.receipt === "all" || t.receipt === filters.receipt) &&
      (!q || t.merchant.toLowerCase().includes(q) || t.cardholder.name.toLowerCase().includes(q) || String(t.id).includes(q) || t.last4.includes(q) || (t.memo ?? "").toLowerCase().includes(q))
  );
  const viewTest = views.find((v) => v.value === view)!.test;
  const filtered = matching.filter(viewTest);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageRows = filtered.slice((current - 1) * pageSize, current * pageSize);
  const selectedOnPage = pageRows.filter((t) => selected.has(t.id)).length;
  const changed = JSON.stringify(filters) !== JSON.stringify(noFilters);

  const update = (next: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };
  const patch = (ids: number[], change: Partial<Transaction>) => setRows((prev) => prev.map((t) => (ids.includes(t.id) ? { ...t, ...change } : t)));
  const select = (ids: number[], checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) checked ? next.add(id) : next.delete(id);
      return next;
    });
  const bulk = (message: string, change?: Partial<Transaction>) => {
    if (change) patch([...selected], change);
    setNotice(message);
    setSelected(new Set());
  };

  return (
    <AcmeShell current="Transactions" header={<PageHeader />}>
      <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
        <QUI.Tabs
          variant="card"
          value={view}
          onValueChange={(value) => {
            setView(String(value));
            setPage(1);
          }}
        >
          <QUI.TabsList aria-label="Transaction views">
            {views.map((v) => (
              <QUI.Tab key={v.value} value={v.value} label={v.label} count={matching.filter(v.test).length} />
            ))}
          </QUI.TabsList>
        </QUI.Tabs>
      </QUI.Box>

      <QUI.Inline justify="between" gap="2" paddingX="4" paddingBottom="3">
        <QUI.Inline gap="2">
          <QUI.Box width="2xs">
            <QUI.Input
              aria-label="Search transactions"
              placeholder="Search merchant, person, card…"
              value={filters.query}
              onChange={(event) => update({ query: event.target.value })}
              startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />}
            />
          </QUI.Box>
          <FilterMenu name="Category" value={filters.category} options={[{ value: "all", label: "Any category" }, ...categories.map((c) => ({ value: c, label: c }))]} onChange={(category) => update({ category })} />
          <FilterMenu name="Department" value={filters.department} options={[{ value: "all", label: "Any department" }, ...departments.map((d) => ({ value: d, label: d }))]} onChange={(department) => update({ department })} />
          <FilterMenu name="Cardholder" value={filters.cardholder} options={[{ value: "all", label: "Anyone" }, ...people.map((p) => ({ value: p.name, label: p.name }))]} onChange={(cardholder) => update({ cardholder })} />
          <FilterMenu
            name="Receipt"
            value={filters.receipt}
            options={[{ value: "all", label: "Any" }, { value: "Attached", label: "Attached" }, { value: "Missing", label: "Missing" }, { value: "Not required", label: "Not required" }]}
            onChange={(receipt) => update({ receipt })}
          />
          {changed ? <QUI.Button variant="ghost" icon={<QUI.Icon icon={Icons.X} />} label="Clear all" onClick={() => update(noFilters)} /> : null}
        </QUI.Inline>
      </QUI.Inline>

      {notice ? (
        <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
          <QUI.Banner variant="success" onDismiss={() => setNotice(null)}>
            {notice}
          </QUI.Banner>
        </QUI.Box>
      ) : null}

      <QUI.Box grow overflow="hidden" paddingX="4">
        <QUI.Table aria-label="Card transactions">
          <QUI.TableHeader>
            <QUI.TableRow>
              <QUI.TableHead>
                <QUI.Checkbox
                  aria-label="Select all transactions on this page"
                  checked={pageRows.length > 0 && selectedOnPage === pageRows.length}
                  indeterminate={selectedOnPage > 0 && selectedOnPage < pageRows.length}
                  onCheckedChange={(checked) => select(pageRows.map((t) => t.id), checked)}
                />
              </QUI.TableHead>
              <QUI.TableHead>Date</QUI.TableHead>
              <QUI.TableHead>Merchant</QUI.TableHead>
              <QUI.TableHead align="end">Amount</QUI.TableHead>
              <QUI.TableHead>Cardholder</QUI.TableHead>
              <QUI.TableHead>Card</QUI.TableHead>
              <QUI.TableHead>Category</QUI.TableHead>
              <QUI.TableHead>Department</QUI.TableHead>
              <QUI.TableHead>Receipt</QUI.TableHead>
              <QUI.TableHead>Policy</QUI.TableHead>
              <QUI.TableHead>Accounting</QUI.TableHead>
              <QUI.TableHead>Memo</QUI.TableHead>
            </QUI.TableRow>
          </QUI.TableHeader>
          <QUI.TableBody>
            {pageRows.map((t) => (
              <QUI.TableRow key={t.id} selected={selected.has(t.id)}>
                <QUI.TableCell>
                  <QUI.Checkbox aria-label={`Select ${t.merchant} ${t.id}`} checked={selected.has(t.id)} onCheckedChange={(checked) => select([t.id], checked)} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.DateCell value={t.date} format="relative" now={today} locale="en-US" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TextCell primary={t.merchant} secondary={`#${t.id}`} tone="link" onClick={() => setOpenId(t.id)} />
                </QUI.TableCell>
                <QUI.TableCell align="end">
                  <QUI.MoneyCell amount={t.amount} currency="AED" display="code" locale="en-US" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.UserCell name={t.cardholder.name} onClick={() => update({ cardholder: t.cardholder.name })} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.MaskedCell last={t.last4} groups={1} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TagCell label={t.category} color={categoryColor[t.category as keyof typeof categoryColor]} onClick={() => update({ category: t.category })} />
                </QUI.TableCell>
                <QUI.TableCell>{t.department}</QUI.TableCell>
                <QUI.TableCell>
                  <ReceiptTag receipt={t.receipt} />
                </QUI.TableCell>
                <QUI.TableCell>{t.policy ? <QUI.TagCell label={t.policy} color="orange" /> : <QUI.EmptyCell />}</QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TagCell label={t.sync} color={syncColor[t.sync]} />
                </QUI.TableCell>
                <QUI.TableCell>{t.memo ? <QUI.TextCell primary={t.memo} /> : <QUI.EmptyCell />}</QUI.TableCell>
              </QUI.TableRow>
            ))}
          </QUI.TableBody>
        </QUI.Table>
      </QUI.Box>

      <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3">
        <QUI.Text size="xs" color="tertiary" tabularNums>
          {filtered.length === 0 ? "No transactions" : `${(current - 1) * pageSize + 1}–${(current - 1) * pageSize + pageRows.length} of ${filtered.length}`}
        </QUI.Text>
        <QUI.ActionBar
          placement="inline"
          open={selected.size > 0}
          aria-label="Bulk actions"
          summary={
            <>
              {selected.size} selected · Total: <QUI.Text weight="semibold">{formatAed(rows.filter((t) => selected.has(t.id)).reduce((sum, t) => sum + Math.abs(t.amount), 0))}</QUI.Text>
            </>
          }
          onClear={() => setSelected(new Set())}
        >
          <QUI.Menu>
            <QUI.MenuTrigger render={<QUI.ActionBarButton label="Categorise" icon={<QUI.Icon icon={Icons.Tag} />} endIcon={<QUI.Icon icon={Icons.ChevronDown} />} />} />
            <QUI.MenuContent align="center" side="top">
              {categories.map((c) => (
                <QUI.MenuItem key={c} onClick={() => bulk(`Moved ${selected.size} transactions to ${c}.`, { category: c })}>
                  {c}
                </QUI.MenuItem>
              ))}
            </QUI.MenuContent>
          </QUI.Menu>
          <QUI.ActionBarButton icon={<QUI.Icon icon={Icons.Send} />} label="Request receipts" onClick={() => bulk(`Asked cardholders for ${selected.size} receipts.`)} />
          <QUI.ActionBarButton icon={<QUI.Icon icon={Icons.Download} />} label="Export" onClick={() => bulk(`Exported ${selected.size} transactions.`)} />
        </QUI.ActionBar>
        <QUI.Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
      </QUI.Inline>

      <TransactionDrawer transaction={rows.find((t) => t.id === openId) ?? null} onClose={() => setOpenId(null)} onUpdate={(id, change) => patch([id], change)} />
    </AcmeShell>
  );
}
