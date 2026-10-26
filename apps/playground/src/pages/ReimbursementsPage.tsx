import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AcmeShell } from "../examples/acme/shell";
import { ClaimDrawer, NewClaimDialog, aed, claimStatusColor } from "../examples/acme/claims";
import { categoryColor, claims as allClaims, people, today, type Claim, type ClaimStatus } from "../examples/acme/spend-data";
import { FilterMenu } from "./ApprovalRequestsPage";

/**
 * Reimbursements — out-of-pocket claims — in the Acme shell, from the approver's side: status tiles, filters, a
 * claims table with bulk approve, a claim drawer with its status timeline and receipt, and "New claim" (expense
 * with receipt upload, or mileage). Built only from qui components — no className or style anywhere in this file.
 */

const views: { value: string; label: string; test: (c: Claim) => boolean }[] = [
  { value: "awaiting", label: "Awaiting approval", test: (c) => c.status === "Awaiting approval" },
  { value: "approved", label: "Approved, not paid", test: (c) => c.status === "Approved" },
  { value: "paid", label: "Paid", test: (c) => c.status === "Paid" },
  { value: "rejected", label: "Rejected", test: (c) => c.status === "Rejected" },
  { value: "all", label: "All claims", test: () => true },
];

const me = people.find((p) => p.name === "Ranu Perera")!;
const myApprover = people.find((p) => p.name === "Saif Kapadia")!;

/** Playground page: reimbursement claims with approvals and a new-claim form. */
export function ReimbursementsPage() {
  const [claims, setClaims] = React.useState(allClaims);
  const [view, setView] = React.useState(() => (window.location.hash.includes("new=1") ? "all" : "awaiting"));
  const [filters, setFilters] = React.useState({ query: "", employee: "all", kind: "all" });
  const [selected, setSelected] = React.useState<Set<number>>(() => new Set());
  const [openId, setOpenId] = React.useState<number | null>(null);
  const [creating, setCreating] = React.useState(() => window.location.hash.includes("new=1"));
  const [notice, setNotice] = React.useState<string | null>(null);

  const q = filters.query.trim().toLowerCase();
  const matching = claims.filter(
    (c) =>
      (filters.employee === "all" || c.employee.name === filters.employee) &&
      (filters.kind === "all" || c.kind === filters.kind) &&
      (!q || c.title.toLowerCase().includes(q) || c.employee.name.toLowerCase().includes(q) || String(c.id).includes(q))
  );
  const rows = matching.filter(views.find((v) => v.value === view)!.test);
  const pendingSelected = [...selected].filter((id) => claims.find((c) => c.id === id)?.status === "Awaiting approval");

  const decide = (ids: number[], status: ClaimStatus) => {
    setClaims((prev) => prev.map((c) => (ids.includes(c.id) ? { ...c, status, rejection: status === "Rejected" ? "Rejected from the claims list." : undefined } : c)));
    setSelected(new Set());
    setNotice(`${status === "Approved" ? "Approved" : "Rejected"} ${ids.length} claim${ids.length === 1 ? "" : "s"}.`);
  };
  const select = (ids: number[], checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) checked ? next.add(id) : next.delete(id);
      return next;
    });
  const selectable = rows.filter((c) => c.status === "Awaiting approval");
  const selectedOnPage = selectable.filter((c) => selected.has(c.id)).length;
  const awaitingTotal = claims.filter((c) => c.status === "Awaiting approval").reduce((sum, c) => sum + c.amount, 0);

  return (
    <AcmeShell
      current="Reimbursements"
     
      header={
        <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Icon icon={Icons.HandCoins} size="lg" tint="secondary" />
            <QUI.Heading level={1} size={5} weight="semibold">
              Reimbursements
            </QUI.Heading>
            <QUI.Badge size="xs" variant="warning" label={`${aed.format(awaitingTotal)} awaiting`} />
          </QUI.Inline>
          <QUI.Button variant="primary" icon={<QUI.Icon icon={Icons.Plus} />} label="New claim" onClick={() => setCreating(true)} />
        </QUI.Inline>
      }
    >
      <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
        <QUI.Tabs
          variant="card"
          value={view}
          onValueChange={(value) => {
            setView(String(value));
            setSelected(new Set());
          }}
        >
          <QUI.TabsList aria-label="Claim status">
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
              aria-label="Search claims"
              placeholder="Search claim, person, number…"
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />}
            />
          </QUI.Box>
          <FilterMenu
            name="Employee"
            value={filters.employee}
            options={[{ value: "all", label: "Anyone" }, ...people.map((p) => ({ value: p.name, label: p.name }))]}
            onChange={(employee) => setFilters((f) => ({ ...f, employee }))}
          />
          <FilterMenu
            name="Type"
            value={filters.kind}
            options={[{ value: "all", label: "Any type" }, { value: "Expense", label: "Expense" }, { value: "Mileage", label: "Mileage" }]}
            onChange={(kind) => setFilters((f) => ({ ...f, kind }))}
          />
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
        <QUI.Table aria-label="Reimbursement claims">
          <QUI.TableHeader>
            <QUI.TableRow>
              <QUI.TableHead>
                <QUI.Checkbox
                  aria-label="Select all claims awaiting approval"
                  disabled={selectable.length === 0}
                  checked={selectable.length > 0 && selectedOnPage === selectable.length}
                  indeterminate={selectedOnPage > 0 && selectedOnPage < selectable.length}
                  onCheckedChange={(checked) => select(selectable.map((c) => c.id), checked)}
                />
              </QUI.TableHead>
              <QUI.TableHead>Claim</QUI.TableHead>
              <QUI.TableHead>Employee</QUI.TableHead>
              <QUI.TableHead>Category</QUI.TableHead>
              <QUI.TableHead align="end">Amount</QUI.TableHead>
              <QUI.TableHead>Spent</QUI.TableHead>
              <QUI.TableHead>Submitted</QUI.TableHead>
              <QUI.TableHead>Status</QUI.TableHead>
              <QUI.TableHead>Receipt</QUI.TableHead>
              <QUI.TableHead>Approver</QUI.TableHead>
            </QUI.TableRow>
          </QUI.TableHeader>
          <QUI.TableBody>
            {rows.map((c) => (
              <QUI.TableRow key={c.id} selected={selected.has(c.id)}>
                <QUI.TableCell>
                  {c.status === "Awaiting approval" ? (
                    <QUI.Checkbox aria-label={`Select claim ${c.id}`} checked={selected.has(c.id)} onCheckedChange={(checked) => select([c.id], checked)} />
                  ) : null}
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TextCell primary={c.title} secondary={`#${c.id} · ${c.kind}`} tone="link" onClick={() => setOpenId(c.id)} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.UserCell name={c.employee.name} secondary={c.employee.email} onClick={() => setFilters((f) => ({ ...f, employee: c.employee.name }))} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TagCell label={c.category} color={categoryColor[c.category as keyof typeof categoryColor]} />
                </QUI.TableCell>
                <QUI.TableCell align="end">
                  <QUI.MoneyCell amount={c.amount} currency="AED" display="code" locale="en-US" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.DateCell value={c.spentOn} locale="en-GB" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.DateCell value={c.submittedAt} format="relative" now={today} locale="en-US" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TagCell label={c.status} color={claimStatusColor[c.status]} />
                </QUI.TableCell>
                <QUI.TableCell>{c.kind === "Mileage" ? <QUI.TextCell primary={`${c.km} km`} /> : c.receipt ? <QUI.TagCell label="Attached" color="emerald" /> : <QUI.EmptyCell />}</QUI.TableCell>
                <QUI.TableCell>
                  <QUI.UserCell name={c.approver.name} />
                </QUI.TableCell>
              </QUI.TableRow>
            ))}
          </QUI.TableBody>
        </QUI.Table>
      </QUI.Box>
      <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3">
        <QUI.Text size="xs" color="tertiary" tabularNums>
          {rows.length === 0 ? "No claims" : `${rows.length} ${rows.length === 1 ? "claim" : "claims"}`}
        </QUI.Text>
        <QUI.ActionBar
          placement="inline"
          open={selected.size > 0}
          aria-label="Bulk actions"
          summary={
            <>
              {selected.size} selected · Total: <QUI.Text weight="semibold">{aed.format(claims.filter((c) => selected.has(c.id)).reduce((sum, c) => sum + c.amount, 0))}</QUI.Text>
            </>
          }
          onClear={() => setSelected(new Set())}
        >
          <QUI.ActionBarButton icon={<QUI.Icon icon={Icons.X} />} label={`Reject ${pendingSelected.length}`} disabled={pendingSelected.length === 0} onClick={() => decide(pendingSelected, "Rejected")} />
          <QUI.ActionBarButton icon={<QUI.Icon icon={Icons.Check} />} label={`Approve ${pendingSelected.length}`} disabled={pendingSelected.length === 0} onClick={() => decide(pendingSelected, "Approved")} />
        </QUI.ActionBar>
      </QUI.Inline>
      <ClaimDrawer
        claim={claims.find((c) => c.id === openId) ?? null}
        canDecide
        onClose={() => setOpenId(null)}
        onDecide={(id, status) => {
          decide([id], status);
          setOpenId(null);
        }}
      />
      <NewClaimDialog
        open={creating}
        onOpenChange={setCreating}
        employee={me}
        approver={myApprover}
        onSubmit={(claim) => {
          setClaims((prev) => [claim, ...prev]);
          setCreating(false);
          setView("awaiting");
          setNotice(`Claim "${claim.title}" for ${aed.format(claim.amount)} sent to ${myApprover.name}.`);
        }}
      />
    </AcmeShell>
  );
}
