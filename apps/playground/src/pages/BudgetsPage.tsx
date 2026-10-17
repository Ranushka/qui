import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import type { IconComponent } from "../examples/acme/data";
import { AcmeShell } from "../examples/acme/shell";
import { AdminNavigation } from "../examples/acme/admin-nav";
import { budgets as departmentBudgets, people, sum, transactions } from "../examples/acme/spend-data";

/**
 * Budgets in the Acme shell: totals, status tiles (on track / at risk / over), and one card per department or
 * project with what's spent, committed and left, a burn-rate sparkline, alerts and a link to its transactions.
 * "New budget" opens a short form. Built only from qui components — no className or style anywhere in this file.
 */

type Budget = {
  id: string;
  name: string;
  kind: "Department" | "Project";
  owner: string;
  amount: number;
  period: "Monthly" | "Quarterly" | "One-time";
  spent: number;
  committed: number;
  /** Spend in each week of the period so far, for the burn-rate line (rising = spending faster). */
  weekly: number[];
  alerts: number[];
  link: string;
};

const aed = new Intl.NumberFormat("en-US", { style: "currency", currency: "AED", currencyDisplay: "code", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const periodElapsed = 17 / 31;

const initialBudgets: Budget[] = [
  ...departmentBudgets.map((b, i) => {
    const rows = transactions.filter((t) => t.department === b.department);
    const spent = Math.round(sum(rows.map((t) => t.amount)));
    const weekly = [[1, 4], [5, 8], [9, 12], [13, 17]].map(([from, to]) =>
      Math.round(sum(rows.filter((t) => new Date(t.date).getUTCDate() >= from! && new Date(t.date).getUTCDate() <= to!).map((t) => t.amount)))
    );
    return {
      id: b.department,
      name: b.department,
      kind: "Department" as const,
      owner: b.owner,
      amount: b.budget,
      period: "Monthly" as const,
      spent,
      committed: [18000, 9500, 22000, 4000, 2500][i]!,
      weekly,
      alerts: [80, 100],
      link: `#/examples/tables/transactions?department=${encodeURIComponent(b.department)}`,
    };
  }),
  {
    id: "riyadh",
    name: "Q4 kick-off, Riyadh",
    kind: "Project",
    owner: "Saif Kapadia",
    amount: 85000,
    period: "One-time",
    spent: 61200,
    committed: 14800,
    weekly: [8000, 23000, 30200],
    alerts: [80, 100],
    link: "#/examples/tables/transactions?q=Riyadh",
  },
  {
    id: "website",
    name: "Website relaunch",
    kind: "Project",
    owner: "Candice Smith",
    amount: 120000,
    period: "Quarterly",
    spent: 23400,
    committed: 40000,
    weekly: [6000, 9000, 8400],
    alerts: [50, 80, 100],
    link: "#/examples/tables/transactions?department=Marketing",
  },
];

type Status = "On track" | "At risk" | "Over budget";
/** Over if spent passes the budget; at risk if spent + committed would, or spending runs well ahead of the period. */
function statusOf(b: Budget): Status {
  if (b.spent >= b.amount) return "Over budget";
  const pace = b.period === "Monthly" ? b.spent / b.amount / periodElapsed : 0;
  return b.spent + b.committed > b.amount || pace > 1.15 ? "At risk" : "On track";
}
const statusVariant = { "On track": "success", "At risk": "warning", "Over budget": "danger" } as const;

const views = [
  { value: "all", label: "All budgets" },
  { value: "On track", label: "On track" },
  { value: "At risk", label: "At risk" },
  { value: "Over budget", label: "Over budget" },
];

function Stat({ icon, label, value, caption }: { icon: IconComponent; label: string; value: string; caption: string }) {
  return (
    <QUI.Box border="subtle" radius="lg" padding="4" background="surface-1">
      <QUI.Stack gap="2">
        <QUI.Inline justify="between" gap="2" wrap={false}>
          <QUI.Text size="xs" color="secondary">
            {label}
          </QUI.Text>
          <QUI.Icon icon={icon} tint="tertiary" />
        </QUI.Inline>
        <QUI.Heading level={3} size={3} weight="semibold">
          {value}
        </QUI.Heading>
        <QUI.Text variant="caption" size="md" color="tertiary">
          {caption}
        </QUI.Text>
      </QUI.Stack>
    </QUI.Box>
  );
}

function BudgetCard({ budget }: { budget: Budget }) {
  const status = statusOf(budget);
  const left = budget.amount - budget.spent;
  const pct = Math.round((budget.spent / budget.amount) * 100);
  return (
    <QUI.Box as="article" aria-label={budget.name} border="subtle" radius="lg" padding="4" background="surface-1">
      <QUI.Stack gap="4">
        <QUI.Inline justify="between" align="start" gap="2" wrap={false}>
          <QUI.Stack gap="1">
            <QUI.Text size="sm" weight="semibold" color="primary">
              {budget.name}
            </QUI.Text>
            <QUI.Inline gap="1.5" wrap={false}>
              <QUI.Avatar size="2xs" alt={budget.owner} />
              <QUI.Text variant="caption" size="md" color="tertiary">
                {budget.owner} · {budget.kind} · {budget.period}
              </QUI.Text>
            </QUI.Inline>
          </QUI.Stack>
          <QUI.Inline gap="1" wrap={false}>
            <QUI.Badge size="xs" variant={statusVariant[status]} label={status} />
            <QUI.Menu>
              <QUI.MenuTrigger render={<QUI.IconButton variant="ghost" size="sm" aria-label={`Actions for ${budget.name}`} icon={<QUI.Icon icon={Icons.Ellipsis} />} />} />
              <QUI.MenuContent align="end">
                <QUI.MenuItem icon={<QUI.Icon icon={Icons.Pencil} />}>Edit budget</QUI.MenuItem>
                <QUI.MenuItem icon={<QUI.Icon icon={Icons.Bell} />}>Alert settings</QUI.MenuItem>
                <QUI.MenuSeparator />
                <QUI.MenuItem variant="danger" icon={<QUI.Icon icon={Icons.Archive} />}>
                  Archive
                </QUI.MenuItem>
              </QUI.MenuContent>
            </QUI.Menu>
          </QUI.Inline>
        </QUI.Inline>

        <QUI.Inline justify="between" align="end" gap="3" wrap={false}>
          <QUI.Stack gap="0.5">
            <QUI.Heading level={3} size={4} weight="semibold" color={left < 0 ? "danger" : "primary"}>
              {left < 0 ? `${aed.format(-left)} over` : `${aed.format(left)} left`}
            </QUI.Heading>
            <QUI.Text variant="caption" size="md" color="tertiary">
              of {aed.format(budget.amount)}
            </QUI.Text>
          </QUI.Stack>
          <QUI.Stack gap="0.5" align="end">
            <QUI.TrendCell values={budget.weekly} good="down" label={`${budget.name} spend per week this period`} />
            <QUI.Text variant="caption" size="md" color="tertiary">
              Weekly spend
            </QUI.Text>
          </QUI.Stack>
        </QUI.Inline>

        <QUI.Stack gap="2">
          <QUI.LinearProgress value={Math.min(pct, 100)} variant={statusVariant[status] === "success" ? "brand" : statusVariant[status]} aria-label={`${budget.name} budget used`} showValue={false} />
          <QUI.Inline justify="between" gap="2">
            <QUI.Text size="xs" color="secondary" tabularNums>
              Spent {compact.format(budget.spent)} ({pct}%)
            </QUI.Text>
            <QUI.Text size="xs" color="tertiary" tabularNums>
              Committed {compact.format(budget.committed)}
            </QUI.Text>
          </QUI.Inline>
        </QUI.Stack>

        <QUI.Inline justify="between" gap="2">
          <QUI.Inline gap="1" wrap={false}>
            <QUI.Icon icon={Icons.Bell} size="sm" tint="tertiary" />
            <QUI.Text variant="caption" size="md" color="tertiary">
              Alerts at {budget.alerts.map((a) => `${a}%`).join(", ")}
            </QUI.Text>
          </QUI.Inline>
          <QUI.AnchorButton href={budget.link} label="View transactions" />
        </QUI.Inline>
      </QUI.Stack>
    </QUI.Box>
  );
}

type Draft = { name: string; owner: string; amount: string; period: Budget["period"]; alerts: string[] };
const emptyDraft: Draft = { name: "", owner: "", amount: "", period: "Monthly", alerts: ["80", "100"] };

function NewBudgetDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (open: boolean) => void; onCreate: (budget: Budget) => void }) {
  const [draft, setDraft] = React.useState(emptyDraft);
  const [submitted, setSubmitted] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setDraft(emptyDraft);
      setSubmitted(false);
    }
  }, [open]);
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const amount = Number(draft.amount);
  const errors = {
    name: !draft.name.trim() ? "Name the budget." : null,
    owner: !draft.owner ? "Choose an owner." : null,
    amount: !(amount > 0) ? "Enter an amount above zero." : null,
  };
  const submit = () => {
    setSubmitted(true);
    if (errors.name || errors.owner || errors.amount) return;
    onCreate({
      id: `${Date.now()}`,
      name: draft.name.trim(),
      kind: "Project",
      owner: draft.owner,
      amount,
      period: draft.period,
      spent: 0,
      committed: 0,
      weekly: [0, 0],
      alerts: draft.alerts.map(Number).sort((a, b) => a - b),
      link: `#/examples/tables/transactions?q=${encodeURIComponent(draft.name.trim())}`,
    });
  };
  return (
    <QUI.Dialog open={open} onOpenChange={onOpenChange}>
      <QUI.DialogContent size="sm">
        <QUI.Stack>
          <QUI.Box padding="5">
            <QUI.Stack gap="4">
              <QUI.Stack gap="1">
                <QUI.DialogTitle>New budget</QUI.DialogTitle>
                <QUI.DialogDescription>Track spend for a team, project or event. Cards and approvals can be linked to it later.</QUI.DialogDescription>
              </QUI.Stack>
              <QUI.InputField label="Name" placeholder="e.g. Dubai offsite" value={draft.name} onChange={(e) => set({ name: e.target.value })} error={submitted ? errors.name ?? undefined : undefined} />
              <QUI.SelectField
                label="Owner"
                description="Gets the alerts and approves spend over the budget."
                placeholder="Choose a person"
                value={draft.owner || null}
                onValueChange={(value) => set({ owner: String(value ?? "") })}
                options={people.map((p) => ({ value: p.name, label: p.name }))}
                error={submitted ? errors.owner ?? undefined : undefined}
              />
              <QUI.InputField
                label="Amount (AED)"
                inputMode="decimal"
                value={draft.amount}
                onChange={(e) => set({ amount: e.target.value.replace(/[^\d.]/g, "") })}
                error={submitted ? errors.amount ?? undefined : undefined}
              />
              <QUI.RadioGroupField label="Period" value={draft.period} onValueChange={(value) => set({ period: value as Draft["period"] })}>
                <QUI.RadioGroupFieldOption value="Monthly" label="Monthly" description="Resets on the 1st." />
                <QUI.RadioGroupFieldOption value="Quarterly" label="Quarterly" />
                <QUI.RadioGroupFieldOption value="One-time" label="One-time" description="For a project or event; never resets." />
              </QUI.RadioGroupField>
              <QUI.CheckboxGroupField label="Alert the owner at" value={draft.alerts} onValueChange={(value) => set({ alerts: value as string[] })}>
                <QUI.CheckboxGroupFieldOption value="50" label="50% spent" />
                <QUI.CheckboxGroupFieldOption value="80" label="80% spent" />
                <QUI.CheckboxGroupFieldOption value="100" label="100% spent" />
              </QUI.CheckboxGroupField>
            </QUI.Stack>
          </QUI.Box>
          <QUI.Box border="subtle" borderEdge="top" padding="4">
            <QUI.Inline justify="end" gap="2">
              <QUI.DialogClose render={<QUI.Button variant="secondary" label="Cancel" />} />
              <QUI.Button variant="primary" label="Create budget" onClick={submit} />
            </QUI.Inline>
          </QUI.Box>
        </QUI.Stack>
      </QUI.DialogContent>
    </QUI.Dialog>
  );
}

/** Playground page: department and project budgets with status, burn rate and alerts. */
export function BudgetsPage() {
  const [budgets, setBudgets] = React.useState(initialBudgets);
  const [view, setView] = React.useState("all");
  const [creating, setCreating] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  const total = sum(budgets.map((b) => b.amount));
  const spent = sum(budgets.map((b) => b.spent));
  const committed = sum(budgets.map((b) => b.committed));
  const shown = view === "all" ? budgets : budgets.filter((b) => statusOf(b) === view);

  return (
    <AcmeShell
      current="Budgets"
      navigation={<AdminNavigation open="Spend" />}
      header={
        <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Icon icon={Icons.PiggyBank} size="lg" tint="secondary" />
            <QUI.Heading level={1} size={5} weight="semibold">
              Budgets
            </QUI.Heading>
          </QUI.Inline>
          <QUI.Button variant="primary" icon={<QUI.Icon icon={Icons.Plus} />} label="New budget" onClick={() => setCreating(true)} />
        </QUI.Inline>
      }
    >
      <QUI.Box grow overflow="auto" paddingX="4" paddingBottom="4">
        <QUI.Stack gap="4">
          <QUI.Grid columns={4} collapseBelow="lg" gap="4">
            <Stat icon={Icons.PiggyBank} label="Total budgeted" value={aed.format(total)} caption={`${budgets.length} budgets this period`} />
            <Stat icon={Icons.Wallet} label="Spent" value={aed.format(spent)} caption={`${Math.round((spent / total) * 100)}% of budgets`} />
            <Stat icon={Icons.Hourglass} label="Committed" value={aed.format(committed)} caption="Approved, not yet spent" />
            <Stat icon={Icons.CircleDollarSign} label="Available" value={aed.format(total - spent - committed)} caption="After spent and committed" />
          </QUI.Grid>
          {notice ? (
            <QUI.Banner variant="success" onDismiss={() => setNotice(null)}>
              {notice}
            </QUI.Banner>
          ) : null}
          <QUI.Tabs variant="card" value={view} onValueChange={(value) => setView(String(value))}>
            <QUI.TabsList aria-label="Budget status">
              {views.map((v) => (
                <QUI.Tab key={v.value} value={v.value} label={v.label} count={v.value === "all" ? budgets.length : budgets.filter((b) => statusOf(b) === v.value).length} />
              ))}
            </QUI.TabsList>
          </QUI.Tabs>
          <QUI.Grid columns={3} collapseBelow="lg" gap="4">
            {shown.map((b) => (
              <BudgetCard key={b.id} budget={b} />
            ))}
          </QUI.Grid>
        </QUI.Stack>
      </QUI.Box>
      <NewBudgetDialog
        open={creating}
        onOpenChange={setCreating}
        onCreate={(budget) => {
          setBudgets((prev) => [...prev, budget]);
          setCreating(false);
          setView("all");
          setNotice(`Budget "${budget.name}" created for ${aed.format(budget.amount)}.`);
        }}
      />
    </AcmeShell>
  );
}
