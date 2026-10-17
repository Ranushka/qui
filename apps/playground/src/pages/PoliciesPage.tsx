import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AcmeShell } from "../examples/acme/shell";
import { AdminNavigation } from "../examples/acme/admin-nav";
import { aed } from "../examples/acme/claims";
import { categoryColor, departments, merchants, people, sum, today, transactions, type Transaction } from "../examples/acme/spend-data";

/**
 * Spend policies — the rules that route card spend for approval, flag it or decline it — in the Acme shell: a
 * rule list with on/off switches and how much each rule caught this month, and a rule editor built on
 * `RuleBuilder` that previews which of this month's transactions the rule would have caught. Only qui
 * components — no className or style anywhere in this file.
 */

type Action = "approval" | "flag" | "block";
type Policy = {
  id: number;
  name: string;
  conditions: QUI.RuleCondition[];
  match: QUI.RuleMatch;
  action: Action;
  approver: string;
  active: boolean;
  updatedAt: string;
  updatedBy: string;
};

const actions: { value: Action; label: string; color: "indigo" | "yellow" | "crimson" }[] = [
  { value: "approval", label: "Require approval", color: "indigo" },
  { value: "flag", label: "Flag for review", color: "yellow" },
  { value: "block", label: "Decline the payment", color: "crimson" },
];
const actionOf = (value: Action) => actions.find((a) => a.value === value)!;

const option = (value: string) => ({ value, label: value });
const fields: QUI.RuleField[] = [
  { value: "amount", label: "Amount", type: "number", unit: "AED" },
  { value: "category", label: "Category", type: "select", options: [...new Set(merchants.map((m) => m.category))].map(option) },
  { value: "department", label: "Department", type: "select", options: departments.map(option) },
  { value: "merchant", label: "Merchant", type: "text" },
  { value: "cardholder", label: "Cardholder", type: "select", options: people.map((p) => option(p.name)) },
  { value: "receipt", label: "Receipt", type: "select", options: ["Attached", "Missing", "Not required"].map(option) },
];

/** The values a rule can test, read off a transaction. */
const recordOf = (t: Transaction) => ({ amount: t.amount, category: t.category, department: t.department, merchant: t.merchant, cardholder: t.cardholder.name, receipt: t.receipt });
const records = transactions.map((t) => ({ t, record: recordOf(t) }));
const caughtBy = (p: Pick<Policy, "conditions" | "match">) => records.filter(({ record }) => QUI.matchesRule(record, p.conditions, p.match, fields)).map(({ t }) => t);

const c = (field: string, operator: QUI.RuleOperator, value: string, id = `${field}-${value}`): QUI.RuleCondition => ({ id, field, operator, value });
const seedPolicies: Policy[] = [
  { id: 1, name: "Large purchases go to finance", conditions: [c("amount", "gt", "8000")], match: "all", action: "approval", approver: "Mashood Pookkadan", active: true, updatedAt: "2026-09-02T10:00:00Z", updatedBy: "Mashood Pookkadan" },
  { id: 2, name: "Travel over AED 3,000", conditions: [c("category", "eq", "Travel"), c("amount", "gt", "3000")], match: "all", action: "approval", approver: "Saif Kapadia", active: true, updatedAt: "2026-10-11T08:30:00Z", updatedBy: "Saif Kapadia" },
  { id: 3, name: "Expensive client meals", conditions: [c("category", "eq", "Meals"), c("amount", "gte", "400")], match: "all", action: "flag", approver: "", active: true, updatedAt: "2026-08-19T14:10:00Z", updatedBy: "Candice Smith" },
  { id: 4, name: "Missing receipt on large spend", conditions: [c("receipt", "eq", "Missing"), c("amount", "gt", "1000")], match: "all", action: "flag", approver: "", active: true, updatedAt: "2026-10-15T09:00:00Z", updatedBy: "Mashood Pookkadan" },
  { id: 5, name: "Ad spend needs marketing lead", conditions: [c("merchant", "contains", "Ads"), c("amount", "gt", "3000")], match: "all", action: "approval", approver: "Candice Smith", active: false, updatedAt: "2026-07-30T11:45:00Z", updatedBy: "Candice Smith" },
  { id: 6, name: "No personal ride-hailing", conditions: [c("merchant", "contains", "Careem"), c("department", "eq", "Finance")], match: "all", action: "block", approver: "", active: true, updatedAt: "2026-06-12T16:20:00Z", updatedBy: "Mashood Pookkadan" },
];

const describe = (p: Pick<Policy, "conditions" | "match">) =>
  p.conditions
    .filter((x) => x.value.trim() !== "")
    .map((x) => QUI.describeCondition(x, fields).replace(/^./, (ch) => ch.toLowerCase()))
    .join(p.match === "all" ? " and " : " or ");
const outcome = (p: Pick<Policy, "action" | "approver">) => (p.action === "approval" ? `Require approval from ${p.approver || "…"}` : actionOf(p.action).label);

let nextPolicyId = 100;

/** Editing a new or existing rule: name, conditions, outcome, and a preview of what it would have caught. */
function PolicyDrawer({
  policy,
  onClose,
  onSave,
  onDelete,
}: {
  policy: Policy | null;
  onClose: () => void;
  onSave: (policy: Policy) => void;
  onDelete: (id: number) => void;
}) {
  const [draft, setDraft] = React.useState<Policy | null>(policy);
  const [submitted, setSubmitted] = React.useState(false);
  React.useEffect(() => {
    setDraft(policy);
    setSubmitted(false);
  }, [policy]);
  const set = (patch: Partial<Policy>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const caught = draft ? caughtBy(draft) : [];
  const finished = draft ? draft.conditions.filter((x) => x.value.trim() !== "").length : 0;
  const errors = draft
    ? {
        name: !draft.name.trim() ? "Give the rule a name." : null,
        conditions: finished === 0 ? "Fill in at least one condition." : null,
        approver: draft.action === "approval" && !draft.approver ? "Choose who approves." : null,
      }
    : {};
  const save = () => {
    setSubmitted(true);
    if (!draft || Object.values(errors).some(Boolean)) return;
    onSave({ ...draft, name: draft.name.trim(), updatedAt: today.toISOString(), updatedBy: "Ranu Perera" });
  };
  const isNew = policy != null && policy.id >= 100 && policy.name === "";

  return (
    <QUI.Drawer open={policy != null} onOpenChange={(open) => (open ? null : onClose())}>
      <QUI.DrawerContent size="md" aria-label="Rule editor">
        {draft ? (
          <QUI.Stack height="full">
            <QUI.Box grow overflow="auto" padding="5">
              <QUI.Stack gap="6">
                <QUI.Stack gap="1">
                  <QUI.DrawerTitle>{isNew ? "New rule" : "Edit rule"}</QUI.DrawerTitle>
                  <QUI.DrawerDescription>Rules run on every card payment the moment it's made. The first matching rule that declines wins.</QUI.DrawerDescription>
                </QUI.Stack>
                <QUI.InputField label="Rule name" placeholder="e.g. Travel over AED 3,000" value={draft.name} onChange={(e) => set({ name: e.target.value })} error={submitted ? (errors.name ?? undefined) : undefined} />
                <QUI.Stack gap="2">
                  <QUI.Text size="sm" weight="medium" color="primary">
                    Conditions
                  </QUI.Text>
                  <QUI.Box border="subtle" radius="lg" padding="4" background="layer-1">
                    <QUI.RuleBuilder
                      fields={fields}
                      conditions={draft.conditions}
                      onConditionsChange={(conditions) => set({ conditions })}
                      match={draft.match}
                      onMatchChange={(match) => set({ match })}
                      then={
                        <>
                          <QUI.Box width="2xs">
                            <QUI.Select value={draft.action} items={actions} onValueChange={(value) => set({ action: value as Action })}>
                              <QUI.SelectTrigger aria-label="Outcome" />
                              <QUI.SelectContent>
                                {actions.map((a) => (
                                  <QUI.SelectItem key={a.value} value={a.value}>
                                    {a.label}
                                  </QUI.SelectItem>
                                ))}
                              </QUI.SelectContent>
                            </QUI.Select>
                          </QUI.Box>
                          {draft.action === "approval" ? (
                            <>
                              <QUI.Text size="xs" color="secondary">
                                from
                              </QUI.Text>
                              <QUI.Box width="2xs">
                                <QUI.Select value={draft.approver || null} items={people.map((p) => option(p.name))} onValueChange={(value) => set({ approver: String(value ?? "") })}>
                                  <QUI.SelectTrigger aria-label="Approver" placeholder="Choose approver" />
                                  <QUI.SelectContent>
                                    {people.map((p) => (
                                      <QUI.SelectItem key={p.name} value={p.name}>
                                        {p.name}
                                      </QUI.SelectItem>
                                    ))}
                                  </QUI.SelectContent>
                                </QUI.Select>
                              </QUI.Box>
                            </>
                          ) : null}
                        </>
                      }
                    />
                  </QUI.Box>
                  {submitted && (errors.conditions || errors.approver) ? (
                    <QUI.Text variant="caption" size="md" color="danger">
                      {errors.conditions ?? errors.approver}
                    </QUI.Text>
                  ) : null}
                </QUI.Stack>
                <QUI.Stack gap="3">
                  <QUI.Inline justify="between" gap="2">
                    <QUI.Text size="sm" weight="medium" color="primary">
                      Preview: this month
                    </QUI.Text>
                    <QUI.Text size="xs" color="secondary" tabularNums>
                      {finished === 0 ? "Add a condition to preview" : `${caught.length} of ${transactions.length} payments · ${aed.format(sum(caught.map((t) => t.amount)))}`}
                    </QUI.Text>
                  </QUI.Inline>
                  {finished > 0 && caught.length === 0 ? (
                    <QUI.Banner variant="info">No payment this month would have matched. Check the amount and the values you chose.</QUI.Banner>
                  ) : null}
                  {finished > 0 && caught.length > transactions.length / 3 ? (
                    <QUI.Banner variant="warning">This rule would catch {Math.round((caught.length / transactions.length) * 100)}% of all payments — approvers may get swamped.</QUI.Banner>
                  ) : null}
                  {caught.length > 0 ? (
                    <QUI.Box border="subtle" radius="lg" overflow="hidden">
                      <QUI.Table aria-label="Payments this rule would have caught">
                        <QUI.TableHeader>
                          <QUI.TableRow>
                            <QUI.TableHead>Merchant</QUI.TableHead>
                            <QUI.TableHead>Cardholder</QUI.TableHead>
                            <QUI.TableHead>Category</QUI.TableHead>
                            <QUI.TableHead align="end">Amount</QUI.TableHead>
                            <QUI.TableHead>Date</QUI.TableHead>
                          </QUI.TableRow>
                        </QUI.TableHeader>
                        <QUI.TableBody>
                          {caught.slice(0, 6).map((t) => (
                            <QUI.TableRow key={t.id}>
                              <QUI.TableCell>
                                <QUI.TextCell primary={t.merchant} secondary={t.department} />
                              </QUI.TableCell>
                              <QUI.TableCell>
                                <QUI.UserCell name={t.cardholder.name} />
                              </QUI.TableCell>
                              <QUI.TableCell>
                                <QUI.TagCell label={t.category} color={categoryColor[t.category as keyof typeof categoryColor]} />
                              </QUI.TableCell>
                              <QUI.TableCell align="end">
                                <QUI.MoneyCell amount={t.amount} currency="AED" display="code" locale="en-US" />
                              </QUI.TableCell>
                              <QUI.TableCell>
                                <QUI.DateCell value={t.date} format="relative" now={today} locale="en-US" />
                              </QUI.TableCell>
                            </QUI.TableRow>
                          ))}
                        </QUI.TableBody>
                      </QUI.Table>
                    </QUI.Box>
                  ) : null}
                  {caught.length > 6 ? (
                    <QUI.Text size="xs" color="tertiary">
                      And {caught.length - 6} more.
                    </QUI.Text>
                  ) : null}
                </QUI.Stack>
              </QUI.Stack>
            </QUI.Box>
            <QUI.Box border="subtle" borderEdge="top" padding="4">
              <QUI.Inline justify="between" gap="2">
                {isNew ? <span /> : <QUI.Button variant="danger-outline" icon={<QUI.Icon icon={Icons.Trash2} />} label="Delete rule" onClick={() => onDelete(draft.id)} />}
                <QUI.Inline gap="2">
                  <QUI.Button variant="secondary" label="Cancel" onClick={onClose} />
                  <QUI.Button variant="primary" label={isNew ? "Create rule" : "Save rule"} onClick={save} />
                </QUI.Inline>
              </QUI.Inline>
            </QUI.Box>
          </QUI.Stack>
        ) : null}
      </QUI.DrawerContent>
    </QUI.Drawer>
  );
}

/** Playground page: spend policies with a rule builder and a preview of what each rule catches. */
export function PoliciesPage() {
  const [policies, setPolicies] = React.useState(seedPolicies);
  const [editing, setEditing] = React.useState<Policy | null>(null);
  const [query, setQuery] = React.useState("");
  const [notice, setNotice] = React.useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const rows = policies.filter((p) => !q || p.name.toLowerCase().includes(q) || describe(p).toLowerCase().includes(q));
  const active = policies.filter((p) => p.active);
  const caughtByActive = new Set(active.flatMap((p) => caughtBy(p).map((t) => t.id)));

  const create = () =>
    setEditing({ id: nextPolicyId++, name: "", conditions: [c("amount", "gt", "", `new-${nextPolicyId}`)], match: "all", action: "approval", approver: "", active: true, updatedAt: today.toISOString(), updatedBy: "Ranu Perera" });

  return (
    <AcmeShell
      current="Policies"
      navigation={<AdminNavigation open="Spend" />}
      header={
        <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Icon icon={Icons.ShieldCheck} size="lg" tint="secondary" />
            <QUI.Heading level={1} size={5} weight="semibold">
              Policies
            </QUI.Heading>
            <QUI.Badge size="xs" variant="success" label={`${active.length} active`} />
          </QUI.Inline>
          <QUI.Button variant="primary" icon={<QUI.Icon icon={Icons.Plus} />} label="New rule" onClick={create} />
        </QUI.Inline>
      }
    >
      <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
        <QUI.Grid columns={3} collapseBelow="md" gap="3">
          <QUI.Box border="subtle" radius="lg" padding="4" background="layer-2">
            <QUI.Stack gap="1">
              <QUI.Text size="xs" color="secondary">
                Payments caught this month
              </QUI.Text>
              <QUI.Heading level={2} size={4} weight="semibold">
                {caughtByActive.size} of {transactions.length}
              </QUI.Heading>
            </QUI.Stack>
          </QUI.Box>
          <QUI.Box border="subtle" radius="lg" padding="4" background="layer-2">
            <QUI.Stack gap="1">
              <QUI.Text size="xs" color="secondary">
                Sent for approval
              </QUI.Text>
              <QUI.Heading level={2} size={4} weight="semibold">
                {aed.format(sum(transactions.filter((t) => active.some((p) => p.action === "approval" && caughtBy(p).includes(t))).map((t) => t.amount)))}
              </QUI.Heading>
            </QUI.Stack>
          </QUI.Box>
          <QUI.Box border="subtle" radius="lg" padding="4" background="layer-2">
            <QUI.Stack gap="1">
              <QUI.Text size="xs" color="secondary">
                Declined at the till
              </QUI.Text>
              <QUI.Heading level={2} size={4} weight="semibold">
                {new Set(active.filter((p) => p.action === "block").flatMap((p) => caughtBy(p).map((t) => t.id))).size} payments
              </QUI.Heading>
            </QUI.Stack>
          </QUI.Box>
        </QUI.Grid>
      </QUI.Box>
      <QUI.Inline gap="2" paddingX="4" paddingBottom="3">
        <QUI.Box width="2xs">
          <QUI.Input aria-label="Search rules" placeholder="Search rules…" value={query} onChange={(e) => setQuery(e.target.value)} startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />} />
        </QUI.Box>
      </QUI.Inline>
      {notice ? (
        <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
          <QUI.Banner variant="success" onDismiss={() => setNotice(null)}>
            {notice}
          </QUI.Banner>
        </QUI.Box>
      ) : null}
      <QUI.Box grow overflow="hidden" paddingX="4" paddingBottom="4">
        <QUI.Table aria-label="Spend rules">
          <QUI.TableHeader>
            <QUI.TableRow>
              <QUI.TableHead>Rule</QUI.TableHead>
              <QUI.TableHead>Then</QUI.TableHead>
              <QUI.TableHead align="end">Caught this month</QUI.TableHead>
              <QUI.TableHead>Updated</QUI.TableHead>
              <QUI.TableHead>Active</QUI.TableHead>
            </QUI.TableRow>
          </QUI.TableHeader>
          <QUI.TableBody>
            {rows.map((p) => {
              const caught = caughtBy(p);
              return (
                <QUI.TableRow key={p.id}>
                  <QUI.TableCell>
                    <QUI.TextCell primary={p.name} secondary={`When ${describe(p)}`} tone="link" onClick={() => setEditing(p)} />
                  </QUI.TableCell>
                  <QUI.TableCell>
                    {p.action === "approval" ? <QUI.UserCell name={p.approver} secondary="Approves" /> : <QUI.TagCell label={actionOf(p.action).label} color={actionOf(p.action).color} />}
                  </QUI.TableCell>
                  <QUI.TableCell align="end">
                    <QUI.TextCell primary={`${caught.length} payments`} secondary={aed.format(sum(caught.map((t) => t.amount)))} />
                  </QUI.TableCell>
                  <QUI.TableCell>
                    <QUI.TextCell primary={p.updatedBy} secondary={new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(p.updatedAt))} />
                  </QUI.TableCell>
                  <QUI.TableCell>
                    <QUI.Switch
                      size="sm"
                      aria-label={`${p.name} active`}
                      checked={p.active}
                      onCheckedChange={(checked) => {
                        setPolicies((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: checked } : x)));
                        setNotice(`"${p.name}" is ${checked ? "on" : "off"}.`);
                      }}
                    />
                  </QUI.TableCell>
                </QUI.TableRow>
              );
            })}
          </QUI.TableBody>
        </QUI.Table>
      </QUI.Box>
      <PolicyDrawer
        policy={editing}
        onClose={() => setEditing(null)}
        onSave={(saved) => {
          setPolicies((prev) => (prev.some((x) => x.id === saved.id) ? prev.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...prev]));
          setEditing(null);
          setNotice(`Saved "${saved.name}". ${outcome(saved)} when ${describe(saved)}.`);
        }}
        onDelete={(id) => {
          const gone = policies.find((x) => x.id === id);
          setPolicies((prev) => prev.filter((x) => x.id !== id));
          setEditing(null);
          setNotice(`Deleted "${gone?.name}".`);
        }}
      />
    </AcmeShell>
  );
}
