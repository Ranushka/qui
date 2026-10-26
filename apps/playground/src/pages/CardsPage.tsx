import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AcmeShell } from "../examples/acme/shell";
import { cards as allCards, departments, merchants, people, today, transactions, type SpendCard } from "../examples/acme/spend-data";
import { FilterMenu } from "./ApprovalRequestsPage";

/**
 * Company cards in the Acme shell: status tiles, filters, a cards table, a card drawer (the card itself, limit
 * usage, allowed categories, recent spend, freeze / cancel) and an "Issue card" dialog that walks through
 * cardholder → type → limit → categories → review with a Stepper. Built only from qui components — no
 * className or style anywhere in this file.
 */

const aed = new Intl.NumberFormat("en-US", { style: "currency", currency: "AED", currencyDisplay: "code", maximumFractionDigits: 0 });
const categories = [...new Set(merchants.map((m) => m.category))];
const statusColor = { Active: "emerald", Frozen: "indigo", Cancelled: "grey" } as const;

/** Cards whose expiry month is within the next 3 months. */
const expiringSoon = (card: SpendCard) => {
  const [mm, yy] = card.expiry.split("/").map(Number);
  const months = (2000 + yy! - 2026) * 12 + (mm! - 10);
  return card.status !== "Cancelled" && months >= 0 && months <= 3;
};

const views = [
  { value: "all", label: "All cards", test: (c: SpendCard) => c.status !== "Cancelled" },
  { value: "active", label: "Active", test: (c: SpendCard) => c.status === "Active" },
  { value: "frozen", label: "Frozen", test: (c: SpendCard) => c.status === "Frozen" },
  { value: "expiring", label: "Expiring soon", test: expiringSoon },
  { value: "cancelled", label: "Cancelled", test: (c: SpendCard) => c.status === "Cancelled" },
];

function usageVariant(pct: number) {
  return pct >= 90 ? "danger" : pct >= 70 ? "warning" : "brand";
}

function CardDrawer({ card, onClose, onUpdate }: { card: SpendCard | null; onClose: () => void; onUpdate: (id: number, patch: Partial<SpendCard>) => void }) {
  const recent = card ? transactions.filter((t) => t.cardholder.name === card.holder.name).slice(0, 5) : [];
  const pct = card ? Math.round((card.spent / card.limit) * 100) : 0;
  return (
    <QUI.Drawer open={card != null} onOpenChange={(open) => (open ? null : onClose())}>
      <QUI.DrawerContent aria-label="Card details">
        {card ? (
          <QUI.Stack height="full">
            <QUI.Box grow overflow="auto" padding="4">
              <QUI.Stack gap="5">
                <QUI.Stack gap="1">
                  <QUI.DrawerTitle>{card.nickname}</QUI.DrawerTitle>
                  <QUI.DrawerDescription>
                    {card.holder.name} · {card.department}
                  </QUI.DrawerDescription>
                </QUI.Stack>
                <QUI.CardVisual
                  holder={card.holder.name}
                  last4={card.last4}
                  expiry={card.expiry}
                  nickname={card.nickname}
                  form={card.form}
                  network={card.network}
                  color={card.color}
                  frozen={card.status === "Frozen"}
                />
                {card.status !== "Cancelled" ? (
                  <QUI.Inline gap="2">
                    <QUI.Button
                      variant="secondary"
                      size="sm"
                      icon={<QUI.Icon icon={card.status === "Frozen" ? Icons.Sun : Icons.Snowflake} />}
                      label={card.status === "Frozen" ? "Unfreeze" : "Freeze"}
                      onClick={() => onUpdate(card.id, { status: card.status === "Frozen" ? "Active" : "Frozen" })}
                    />
                    <QUI.Button variant="secondary" size="sm" icon={<QUI.Icon icon={Icons.Gauge} />} label="Edit limit" />
                    <QUI.Button variant="danger-outline" size="sm" label="Cancel card" onClick={() => onUpdate(card.id, { status: "Cancelled" })} />
                  </QUI.Inline>
                ) : (
                  <QUI.Banner variant="info">This card was cancelled and can't be used.</QUI.Banner>
                )}
                <QUI.Stack gap="2">
                  <QUI.Inline justify="between" gap="2">
                    <QUI.Text size="xs" weight="semibold" color="secondary">
                      {card.period} limit
                    </QUI.Text>
                    <QUI.Text size="xs" color="secondary" tabularNums>
                      {aed.format(card.spent)} of {aed.format(card.limit)}
                    </QUI.Text>
                  </QUI.Inline>
                  <QUI.LinearProgress value={Math.min(pct, 100)} variant={usageVariant(pct)} aria-label="Limit used" showValue={false} />
                </QUI.Stack>
                <QUI.Property icon={Icons.Tag} label="Allowed categories">
                  <QUI.Inline gap="1">
                    {card.categories.map((c) => (
                      <QUI.Badge key={c} size="xs" label={c} />
                    ))}
                  </QUI.Inline>
                </QUI.Property>
                <QUI.Stack gap="2">
                  <QUI.Text size="xs" weight="semibold" color="secondary">
                    Recent transactions
                  </QUI.Text>
                  {recent.map((t) => (
                    <QUI.Inline key={t.id} justify="between" gap="2" wrap={false}>
                      <QUI.Stack gap="0">
                        <QUI.Text size="sm" color="primary">
                          {t.merchant}
                        </QUI.Text>
                        <QUI.Text variant="caption" size="md" color="tertiary">
                          {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(t.date))} · {t.category}
                        </QUI.Text>
                      </QUI.Stack>
                      <QUI.Text size="sm" weight="medium" color="primary" tabularNums>
                        {aed.format(t.amount)}
                      </QUI.Text>
                    </QUI.Inline>
                  ))}
                  <QUI.AnchorButton href={`#/examples/tables/transactions?q=${encodeURIComponent(card.holder.name)}`} label="All transactions" />
                </QUI.Stack>
              </QUI.Stack>
            </QUI.Box>
          </QUI.Stack>
        ) : null}
      </QUI.DrawerContent>
    </QUI.Drawer>
  );
}

type Draft = { holder: string; nickname: string; form: "virtual" | "physical"; limit: string; period: SpendCard["period"]; categories: string[] };
const emptyDraft: Draft = { holder: "", nickname: "", form: "virtual", limit: "5000", period: "Monthly", categories: ["Software"] };
const issueSteps = ["Cardholder", "Card type", "Limit", "Categories", "Review"];

/** The guided "Issue card" flow: one question per step, a Stepper on top, Back / Next at the bottom. */
function IssueCardDialog({ open, onOpenChange, onIssue }: { open: boolean; onOpenChange: (open: boolean) => void; onIssue: (draft: Draft) => void }) {
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState<Draft>(emptyDraft);
  const [touched, setTouched] = React.useState(false);
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  React.useEffect(() => {
    if (open) {
      setStep(0);
      setDraft(emptyDraft);
      setTouched(false);
    }
  }, [open]);

  const limit = Number(draft.limit);
  const errors = [
    !draft.holder ? "Choose who the card is for." : !draft.nickname.trim() ? "Give the card a name." : null,
    null,
    !(limit > 0) ? "Enter a limit above zero." : limit > 50000 ? "Limits above AED 50,000 need finance approval." : null,
    draft.categories.length === 0 ? "Allow at least one category." : null,
    null,
  ];
  const next = () => {
    setTouched(true);
    if (errors[step]) return;
    setTouched(false);
    if (step === issueSteps.length - 1) onIssue(draft);
    else setStep(step + 1);
  };
  const error = touched ? errors[step] : null;

  return (
    <QUI.Dialog open={open} onOpenChange={onOpenChange}>
      <QUI.DialogContent size="md">
        <QUI.Stack>
          <QUI.Box padding="5">
            <QUI.Stack gap="5">
              <QUI.Stack gap="1">
                <QUI.DialogTitle>Issue a card</QUI.DialogTitle>
                <QUI.DialogDescription>Virtual cards work right away; physical cards arrive in 3–5 working days.</QUI.DialogDescription>
              </QUI.Stack>
              <QUI.Stepper
                current={step}
                onStepClick={setStep}
                steps={issueSteps.map((label, i) => ({
                  label,
                  description:
                    i >= step
                      ? undefined
                      : i === 0
                        ? draft.holder
                        : i === 1
                          ? draft.form === "virtual" ? "Virtual" : "Physical"
                          : i === 2
                            ? `${aed.format(limit)} · ${draft.period}`
                            : i === 3
                              ? `${draft.categories.length} allowed`
                              : undefined,
                }))}
              />
              {step === 0 ? (
                <QUI.Stack gap="4">
                  <QUI.SelectField
                    label="Cardholder"
                    placeholder="Choose a person"
                    value={draft.holder || null}
                    onValueChange={(value) => set({ holder: String(value ?? "") })}
                    options={people.map((p) => ({ value: p.name, label: p.name }))}
                    error={error && !draft.holder ? error : undefined}
                  />
                  <QUI.InputField
                    label="Card name"
                    description="Shown on statements and in the cards list."
                    placeholder="e.g. AWS billing"
                    value={draft.nickname}
                    onChange={(event) => set({ nickname: event.target.value })}
                    error={error && draft.holder ? error : undefined}
                  />
                </QUI.Stack>
              ) : step === 1 ? (
                <QUI.RadioGroupField label="Card type" value={draft.form} onValueChange={(value) => set({ form: value as Draft["form"] })}>
                  <QUI.RadioGroupFieldOption value="virtual" label="Virtual" description="Ready to use online in seconds. Best for subscriptions and ads." />
                  <QUI.RadioGroupFieldOption value="physical" label="Physical" description="Contactless card posted to the cardholder. Works in shops and ATMs." />
                </QUI.RadioGroupField>
              ) : step === 2 ? (
                <QUI.Stack gap="4">
                  <QUI.InputField
                    label="Limit (AED)"
                    inputMode="decimal"
                    value={draft.limit}
                    onChange={(event) => set({ limit: event.target.value.replace(/[^\d.]/g, "") })}
                    error={error ?? undefined}
                  />
                  <QUI.RadioGroupField label="Resets" value={draft.period} onValueChange={(value) => set({ period: value as Draft["period"] })}>
                    <QUI.RadioGroupFieldOption value="Monthly" label="Every month" />
                    <QUI.RadioGroupFieldOption value="Per transaction" label="Per transaction" />
                    <QUI.RadioGroupFieldOption value="One-time" label="Never — one-time budget" />
                  </QUI.RadioGroupField>
                </QUI.Stack>
              ) : step === 3 ? (
                <QUI.CheckboxGroupField
                  label="Allowed categories"
                  description="Purchases outside these are declined."
                  value={draft.categories}
                  onValueChange={(value) => set({ categories: value as string[] })}
                  error={error ?? undefined}
                >
                  {categories.map((c) => (
                    <QUI.CheckboxGroupFieldOption key={c} value={c} label={c} />
                  ))}
                </QUI.CheckboxGroupField>
              ) : (
                <QUI.Inline gap="5" align="start" stackBelow="sm">
                  <QUI.CardVisual holder={draft.holder} last4="••••" nickname={draft.nickname} form={draft.form} size="sm" />
                  <QUI.Stack gap="3">
                    <QUI.Property icon={Icons.UserRound} label="Cardholder">
                      <QUI.Text size="sm">{draft.holder}</QUI.Text>
                    </QUI.Property>
                    <QUI.Property icon={Icons.Gauge} label="Limit">
                      <QUI.Text size="sm">
                        {aed.format(limit)} · {draft.period}
                      </QUI.Text>
                    </QUI.Property>
                    <QUI.Property icon={Icons.Tag} label="Categories">
                      <QUI.Text size="sm">{draft.categories.join(", ")}</QUI.Text>
                    </QUI.Property>
                  </QUI.Stack>
                </QUI.Inline>
              )}
            </QUI.Stack>
          </QUI.Box>
          <QUI.Box border="subtle" borderEdge="top" padding="4">
            <QUI.Inline justify="between" gap="2">
              <QUI.DialogClose render={<QUI.Button variant="ghost" label="Cancel" />} />
              <QUI.Inline gap="2">
                {step > 0 ? <QUI.Button variant="secondary" label="Back" onClick={() => setStep(step - 1)} /> : null}
                <QUI.Button variant="primary" label={step === issueSteps.length - 1 ? "Issue card" : "Next"} onClick={next} />
              </QUI.Inline>
            </QUI.Inline>
          </QUI.Box>
        </QUI.Stack>
      </QUI.DialogContent>
    </QUI.Dialog>
  );
}

/** Playground page: company cards with a details drawer and a guided issue flow. */
export function CardsPage() {
  const [cards, setCards] = React.useState(allCards);
  const [view, setView] = React.useState("all");
  const [filters, setFilters] = React.useState({ query: "", holder: "all", form: "all", department: "all" });
  const [openId, setOpenId] = React.useState<number | null>(null);
  const [issuing, setIssuing] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  const update = (next: Partial<typeof filters>) => setFilters((f) => ({ ...f, ...next }));
  const patch = (id: number, change: Partial<SpendCard>) => setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...change } : c)));
  const q = filters.query.trim().toLowerCase();
  const matching = cards.filter(
    (c) =>
      (filters.holder === "all" || c.holder.name === filters.holder) &&
      (filters.form === "all" || c.form === filters.form) &&
      (filters.department === "all" || c.department === filters.department) &&
      (!q || c.nickname.toLowerCase().includes(q) || c.holder.name.toLowerCase().includes(q) || c.last4.includes(q))
  );
  const rows = matching.filter(views.find((v) => v.value === view)!.test);

  return (
    <AcmeShell
      current="Cards"
     
      header={
        <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Icon icon={Icons.CreditCard} size="lg" tint="secondary" />
            <QUI.Heading level={1} size={5} weight="semibold">
              Cards
            </QUI.Heading>
          </QUI.Inline>
          <QUI.Button variant="primary" icon={<QUI.Icon icon={Icons.Plus} />} label="Issue card" onClick={() => setIssuing(true)} />
        </QUI.Inline>
      }
    >
      <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
        <QUI.Tabs variant="card" value={view} onValueChange={(value) => setView(String(value))}>
          <QUI.TabsList aria-label="Card views">
            {views.map((v) => (
              <QUI.Tab key={v.value} value={v.value} label={v.label} count={matching.filter(v.test).length} />
            ))}
          </QUI.TabsList>
        </QUI.Tabs>
      </QUI.Box>
      <QUI.Inline gap="2" paddingX="4" paddingBottom="3">
        <QUI.Box width="2xs">
          <QUI.Input aria-label="Search cards" placeholder="Search card, person, last 4…" value={filters.query} onChange={(e) => update({ query: e.target.value })} startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />} />
        </QUI.Box>
        <FilterMenu name="Cardholder" value={filters.holder} options={[{ value: "all", label: "Anyone" }, ...people.map((p) => ({ value: p.name, label: p.name }))]} onChange={(holder) => update({ holder })} />
        <FilterMenu name="Type" value={filters.form} options={[{ value: "all", label: "Any type" }, { value: "virtual", label: "Virtual" }, { value: "physical", label: "Physical" }]} onChange={(form) => update({ form })} />
        <FilterMenu name="Department" value={filters.department} options={[{ value: "all", label: "Any department" }, ...departments.map((d) => ({ value: d, label: d }))]} onChange={(department) => update({ department })} />
      </QUI.Inline>
      {notice ? (
        <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
          <QUI.Banner variant="success" onDismiss={() => setNotice(null)}>
            {notice}
          </QUI.Banner>
        </QUI.Box>
      ) : null}
      <QUI.Box grow overflow="hidden" paddingX="4" paddingBottom="4">
        <QUI.Table aria-label="Company cards">
          <QUI.TableHeader>
            <QUI.TableRow>
              <QUI.TableHead>Card</QUI.TableHead>
              <QUI.TableHead>Cardholder</QUI.TableHead>
              <QUI.TableHead>Status</QUI.TableHead>
              <QUI.TableHead>Type</QUI.TableHead>
              <QUI.TableHead align="end">Limit</QUI.TableHead>
              <QUI.TableHead>Used</QUI.TableHead>
              <QUI.TableHead>Department</QUI.TableHead>
              <QUI.TableHead>Expires</QUI.TableHead>
              <QUI.TableHead>Last used</QUI.TableHead>
            </QUI.TableRow>
          </QUI.TableHeader>
          <QUI.TableBody>
            {rows.map((c) => {
              const pct = Math.round((c.spent / c.limit) * 100);
              return (
                <QUI.TableRow key={c.id}>
                  <QUI.TableCell>
                    <QUI.TextCell primary={c.nickname} secondary={`•••• ${c.last4}`} tone="link" onClick={() => setOpenId(c.id)} />
                  </QUI.TableCell>
                  <QUI.TableCell>
                    <QUI.UserCell name={c.holder.name} secondary={c.holder.email} onClick={() => update({ holder: c.holder.name })} />
                  </QUI.TableCell>
                  <QUI.TableCell>
                    <QUI.TagCell label={c.status} color={statusColor[c.status]} />
                  </QUI.TableCell>
                  <QUI.TableCell>
                    <QUI.TextCell primary={c.form === "virtual" ? "Virtual" : "Physical"} secondary={c.network === "visa" ? "Visa" : "Mastercard"} />
                  </QUI.TableCell>
                  <QUI.TableCell align="end">
                    <QUI.TextCell primary={aed.format(c.limit)} secondary={c.period} />
                  </QUI.TableCell>
                  <QUI.TableCell>{c.status === "Cancelled" ? <QUI.EmptyCell /> : <QUI.ProgressCell value={Math.min(pct, 100)} variant={usageVariant(pct)} aria-label="Limit used" />}</QUI.TableCell>
                  <QUI.TableCell>{c.department}</QUI.TableCell>
                  <QUI.TableCell>{expiringSoon(c) ? <QUI.TagCell label={c.expiry} color="orange" /> : c.expiry}</QUI.TableCell>
                  <QUI.TableCell>
                    <QUI.DateCell value={c.lastUsed} format="relative" now={today} locale="en-US" />
                  </QUI.TableCell>
                </QUI.TableRow>
              );
            })}
          </QUI.TableBody>
        </QUI.Table>
      </QUI.Box>
      <CardDrawer card={cards.find((c) => c.id === openId) ?? null} onClose={() => setOpenId(null)} onUpdate={patch} />
      <IssueCardDialog
        open={issuing}
        onOpenChange={setIssuing}
        onIssue={(draft) => {
          const holder = people.find((p) => p.name === draft.holder)!;
          const card: SpendCard = {
            id: Date.now(),
            nickname: draft.nickname.trim(),
            holder,
            last4: String(1000 + (Date.now() % 9000)),
            expiry: "10/30",
            form: draft.form,
            network: "visa",
            color: "indigo",
            status: "Active",
            limit: Number(draft.limit),
            period: draft.period,
            spent: 0,
            department: "Operations",
            categories: draft.categories,
            lastUsed: today.toISOString(),
          };
          setCards((prev) => [card, ...prev]);
          setIssuing(false);
          setView("all");
          setNotice(`${draft.form === "virtual" ? "Virtual" : "Physical"} card "${card.nickname}" issued to ${holder.name}.`);
        }}
      />
    </AcmeShell>
  );
}
