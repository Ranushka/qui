import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AcmeShell } from "../examples/acme/shell";
import { AdminNavigation } from "../examples/acme/admin-nav";
import { FilterMenu } from "./ApprovalRequestsPage";

/**
 * A currency account's summary — "USD account summary" — in the Acme shell with the admin navigation: a balance
 * card, then Cards / Transactions tabs, each a filterable table. Built only from qui components — no className or
 * style anywhere in this file.
 */

type Person = { name: string; email: string };
type CardStatus = "Active" | "Inactive" | "Draft" | "Frozen";

type Card = {
  id: number;
  nickname: string;
  product: "Smart Card" | "Expense Card" | "Travel Card";
  form: "Virtual" | "Physical";
  status: CardStatus;
  user: Person;
  balance: number;
  last4: string;
  pool: string | null;
  limit: number | null;
  limitUsed: number;
  limits: { atm: boolean; online: boolean; contactless: boolean; international: boolean };
  createdAt: string;
};

type Transaction = {
  id: number;
  date: string;
  merchant: string;
  category: string;
  card: Card;
  amount: number;
  status: "Settled" | "Pending" | "Declined";
};

const users: Person[] = [
  { name: "Qash Dev User", email: "dev@acme.com" },
  { name: "Candice Smith", email: "candice@acme.com" },
  { name: "Saif Kapadia", email: "saif@acme.com" },
  { name: "Aisha Khan", email: "aisha@acme.com" },
];
const nicknames = ["Test USD card", "AWS billing", "Team travel", "Marketing ads", "Office supplies", "SaaS tools", "Client dinners", "Conference fees"];
const products = ["Smart Card", "Expense Card", "Travel Card"] as const;
const cardStatuses: CardStatus[] = ["Active", "Active", "Active", "Inactive", "Draft", "Frozen"];
const statusColor = { Active: "emerald", Inactive: "grey", Draft: "yellow", Frozen: "indigo" } as const;
const pools = [null, "USD Operations pool", "Travel pool"];

/** Deterministic sample cards. */
const cards: Card[] = Array.from({ length: 24 }, (_, i) => {
  const seed = (i * 7919 + 104729) % 100000;
  const limit = seed % 4 === 0 ? null : 1000 * (1 + (seed % 10));
  return {
    id: 5100 + i,
    nickname: nicknames[i % nicknames.length]!,
    product: products[seed % products.length]!,
    form: seed % 3 === 0 ? "Physical" : "Virtual",
    status: cardStatuses[(seed >> 2) % cardStatuses.length]!,
    user: users[i % users.length]!,
    balance: i === 0 ? 0 : Math.round((seed * 13) % 900000) / 100,
    last4: String(1000 + (seed % 9000)),
    pool: pools[seed % pools.length]!,
    limit,
    limitUsed: limit ? (seed * 7) % 101 : 0,
    limits: { atm: seed % 2 === 0, online: true, contactless: seed % 3 !== 0, international: seed % 5 < 2 },
    createdAt: `2026-${String(1 + (i % 9)).padStart(2, "0")}-${String(1 + (seed % 27)).padStart(2, "0")}T09:00:00Z`,
  };
});

const merchants = [
  { merchant: "Amazon Web Services", category: "Cloud" },
  { merchant: "Emirates", category: "Travel" },
  { merchant: "Google Ads", category: "Marketing" },
  { merchant: "Notion", category: "Software" },
  { merchant: "Careem", category: "Transport" },
  { merchant: "Starbucks", category: "Meals" },
];

/** Deterministic sample transactions, newest first. */
const transactions: Transaction[] = Array.from({ length: 180 }, (_, i) => {
  const seed = (i * 6151 + 92821) % 100000;
  const m = merchants[seed % merchants.length]!;
  return {
    id: 990210 - i,
    date: `2026-10-${String(Math.max(17 - Math.floor(i / 12), 1)).padStart(2, "0")}T${String(8 + (i % 12)).padStart(2, "0")}:${String(seed % 60).padStart(2, "0")}:00Z`,
    ...m,
    card: cards[(seed >> 3) % cards.length]!,
    amount: seed % 11 === 0 ? Math.round((seed % 20000) + 500) / 100 : -Math.round(((seed * 3) % 150000) + 300) / 100,
    status: i < 6 ? "Pending" : seed % 17 === 0 ? "Declined" : "Settled",
  };
});

const usd = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** The card's spending controls as status icons: enabled ones done, disabled ones pending. */
function limitsFor(card: Card): QUI.StatusIconsCellItem[] {
  const item = (label: string, on: boolean, icon: QUI.StatusIconsCellItem["icon"]) => ({ label: `${label} ${on ? "enabled" : "disabled"}`, status: on ? "done" : "pending", icon }) as const;
  return [
    item("ATM withdrawals", card.limits.atm, Icons.Banknote),
    item("Online payments", card.limits.online, Icons.Globe),
    item("Contactless", card.limits.contactless, Icons.Nfc),
    item("International", card.limits.international, Icons.Plane),
  ];
}

function BalanceRow({ icon, label, value }: { icon: QUI.StatusIconsCellItem["icon"] & {}; label: string; value: number }) {
  return (
    <QUI.Inline justify="between" gap="4" wrap={false}>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Icon icon={icon} tint="secondary" />
        <QUI.Text size="sm" color="secondary">
          {label}
        </QUI.Text>
      </QUI.Inline>
      <QUI.Text size="sm" weight="medium" color="primary" tabularNums>
        {usd.format(value)} USD
      </QUI.Text>
    </QUI.Inline>
  );
}

function BalanceCard() {
  const cardsBalance = cards.reduce((sum, card) => sum + card.balance, 0);
  const pending = transactions.filter((t) => t.status === "Pending").reduce((sum, t) => sum - t.amount, 0);
  const available = 25000;
  return (
    <QUI.Box width="sm" border="subtle" radius="lg" background="surface-1">
      <QUI.Stack>
        <QUI.Inline gap="3" padding="4" wrap={false}>
          <QUI.Icon icon={Icons.CircleDollarSign} size="lg" tint="secondary" />
          <QUI.Stack gap="1">
            <QUI.Text size="xs" color="secondary">
              Total balance
            </QUI.Text>
            <QUI.Heading level={2} size={3} weight="semibold">
              {usd.format(cardsBalance + available)} USD
            </QUI.Heading>
          </QUI.Stack>
        </QUI.Inline>
        <QUI.Separator />
        <QUI.Stack gap="3" padding="4">
          <BalanceRow icon={Icons.Wallet} label="Available" value={available} />
          <BalanceRow icon={Icons.CreditCard} label="Cards balance" value={cardsBalance} />
          <BalanceRow icon={Icons.Clock} label="Pending authorisations" value={pending} />
        </QUI.Stack>
      </QUI.Stack>
    </QUI.Box>
  );
}

type CardFilters = { query: string; user: string; product: string; status: string };
const noCardFilters: CardFilters = { query: "", user: "all", product: "all", status: "all" };

function CardsTab() {
  const [filters, setFilters] = React.useState(noCardFilters);
  const update = (next: Partial<CardFilters>) => setFilters((prev) => ({ ...prev, ...next }));
  const q = filters.query.trim().toLowerCase();
  const rows = cards.filter(
    (card) =>
      (filters.user === "all" || card.user.name === filters.user) &&
      (filters.product === "all" || card.product === filters.product) &&
      (filters.status === "all" || card.status === filters.status) &&
      (!q || card.nickname.toLowerCase().includes(q) || card.user.name.toLowerCase().includes(q) || card.last4.includes(q))
  );
  const changed = JSON.stringify(filters) !== JSON.stringify(noCardFilters);
  return (
    <QUI.Stack grow gap="3">
      <QUI.Inline justify="between" gap="2" paddingX="4">
        <QUI.Inline gap="2">
          <QUI.Box width="2xs">
            <QUI.Input aria-label="Search cards" placeholder="Search…" value={filters.query} onChange={(e) => update({ query: e.target.value })} startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />} />
          </QUI.Box>
          <FilterMenu name="User" value={filters.user} options={[{ value: "all", label: "Anyone" }, ...users.map((u) => ({ value: u.name, label: u.name }))]} onChange={(user) => update({ user })} />
          <FilterMenu name="Card type" value={filters.product} options={[{ value: "all", label: "All" }, ...products.map((p) => ({ value: p, label: p }))]} onChange={(product) => update({ product })} />
          <FilterMenu
            name="Status"
            value={filters.status}
            options={[{ value: "all", label: "Any status" }, ...(["Active", "Inactive", "Draft", "Frozen"] as const).map((s) => ({ value: s, label: s }))]}
            onChange={(status) => update({ status })}
          />
          {changed ? <QUI.Button variant="ghost" icon={<QUI.Icon icon={Icons.X} />} label="Clear all" onClick={() => setFilters(noCardFilters)} /> : null}
        </QUI.Inline>
        <QUI.Inline gap="1" wrap={false}>
          <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.Download} />} label="Export" />
          <QUI.IconButton variant="secondary" aria-label="Refresh" icon={<QUI.Icon icon={Icons.RefreshCw} />} />
        </QUI.Inline>
      </QUI.Inline>
      <QUI.Box grow overflow="hidden" paddingX="4" paddingBottom="4">
        <QUI.Table aria-label="USD cards">
          <QUI.TableHeader>
            <QUI.TableRow>
              <QUI.TableHead>Card</QUI.TableHead>
              <QUI.TableHead>Status</QUI.TableHead>
              <QUI.TableHead>User</QUI.TableHead>
              <QUI.TableHead align="end">Balance</QUI.TableHead>
              <QUI.TableHead>Card product</QUI.TableHead>
              <QUI.TableHead>Card number</QUI.TableHead>
              <QUI.TableHead>Pool account</QUI.TableHead>
              <QUI.TableHead align="end">Card limit</QUI.TableHead>
              <QUI.TableHead>Limit used</QUI.TableHead>
              <QUI.TableHead>Enabled controls</QUI.TableHead>
              <QUI.TableHead>Created</QUI.TableHead>
              <QUI.TableHead>Actions</QUI.TableHead>
            </QUI.TableRow>
          </QUI.TableHeader>
          <QUI.TableBody>
            {rows.map((card) => (
              <QUI.TableRow key={card.id}>
                <QUI.TableCell>
                  <QUI.TextCell primary={card.nickname} secondary={`${card.form} card`} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TagCell label={card.status} color={statusColor[card.status]} onClick={() => update({ status: card.status })} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.UserCell name={card.user.name} secondary={card.user.email} onClick={() => update({ user: card.user.name })} />
                </QUI.TableCell>
                <QUI.TableCell align="end">
                  <QUI.MoneyCell amount={card.balance} currency="USD" display="code" locale="en-US" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TextCell primary={card.product} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.MaskedCell last={card.last4} />
                </QUI.TableCell>
                <QUI.TableCell>{card.pool ? <QUI.TextCell primary={card.pool} /> : <QUI.EmptyCell />}</QUI.TableCell>
                <QUI.TableCell align="end">{card.limit ? <QUI.MoneyCell amount={card.limit} currency="USD" display="code" locale="en-US" /> : <QUI.EmptyCell />}</QUI.TableCell>
                <QUI.TableCell>
                  {card.limit ? (
                    <QUI.ProgressCell value={card.limitUsed} variant={card.limitUsed >= 90 ? "danger" : card.limitUsed >= 70 ? "warning" : "brand"} aria-label="Card limit used" />
                  ) : (
                    <QUI.EmptyCell />
                  )}
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.StatusIconsCell items={limitsFor(card)} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.DateCell value={card.createdAt} locale="en-GB" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.Menu>
                    <QUI.MenuTrigger render={<QUI.IconButton variant="ghost" size="sm" aria-label={`Actions for ${card.nickname}`} icon={<QUI.Icon icon={Icons.Ellipsis} />} />} />
                    <QUI.MenuContent align="end">
                      <QUI.MenuItem icon={<QUI.Icon icon={Icons.Eye} />}>View card</QUI.MenuItem>
                      <QUI.MenuItem icon={<QUI.Icon icon={Icons.Gauge} />}>Edit limits</QUI.MenuItem>
                      <QUI.MenuItem icon={<QUI.Icon icon={Icons.Snowflake} />}>Freeze card</QUI.MenuItem>
                      <QUI.MenuSeparator />
                      <QUI.MenuItem variant="danger" icon={<QUI.Icon icon={Icons.Ban} />}>
                        Cancel card
                      </QUI.MenuItem>
                    </QUI.MenuContent>
                  </QUI.Menu>
                </QUI.TableCell>
              </QUI.TableRow>
            ))}
          </QUI.TableBody>
        </QUI.Table>
      </QUI.Box>
    </QUI.Stack>
  );
}

const txStatusColor = { Settled: "emerald", Pending: "yellow", Declined: "crimson" } as const;

function TransactionsTab() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const q = query.trim().toLowerCase();
  const rows = transactions.filter(
    (t) => (status === "all" || t.status === status) && (!q || t.merchant.toLowerCase().includes(q) || t.card.nickname.toLowerCase().includes(q) || String(t.id).includes(q))
  );
  return (
    <QUI.Stack grow gap="3">
      <QUI.Inline gap="2" paddingX="4">
        <QUI.Box width="2xs">
          <QUI.Input aria-label="Search transactions" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />} />
        </QUI.Box>
        <FilterMenu
          name="Status"
          value={status}
          options={[{ value: "all", label: "Any status" }, { value: "Settled", label: "Settled" }, { value: "Pending", label: "Pending" }, { value: "Declined", label: "Declined" }]}
          onChange={setStatus}
        />
      </QUI.Inline>
      <QUI.Box grow overflow="hidden" paddingX="4" paddingBottom="4">
        <QUI.Table aria-label="USD transactions">
          <QUI.TableHeader>
            <QUI.TableRow>
              <QUI.TableHead>Date</QUI.TableHead>
              <QUI.TableHead>Merchant</QUI.TableHead>
              <QUI.TableHead>Card</QUI.TableHead>
              <QUI.TableHead>User</QUI.TableHead>
              <QUI.TableHead align="end">Amount</QUI.TableHead>
              <QUI.TableHead>Status</QUI.TableHead>
              <QUI.TableHead>Reference</QUI.TableHead>
            </QUI.TableRow>
          </QUI.TableHeader>
          <QUI.TableBody>
            {rows.map((t) => (
              <QUI.TableRow key={t.id}>
                <QUI.TableCell>
                  <QUI.DateCell value={t.date} format="datetime" locale="en-GB" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TextCell primary={t.merchant} secondary={t.category} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TextCell primary={t.card.nickname} secondary={`•••• ${t.card.last4}`} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.UserCell name={t.card.user.name} />
                </QUI.TableCell>
                <QUI.TableCell align="end">
                  <QUI.MoneyCell amount={t.amount} currency="USD" display="code" signed locale="en-US" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TagCell label={t.status} color={txStatusColor[t.status]} onClick={() => setStatus(t.status)} />
                </QUI.TableCell>
                <QUI.TableCell>{t.id}</QUI.TableCell>
              </QUI.TableRow>
            ))}
          </QUI.TableBody>
        </QUI.Table>
      </QUI.Box>
    </QUI.Stack>
  );
}

function PageHeader() {
  return (
    <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Icon icon={Icons.CircleDollarSign} size="lg" tint="secondary" />
        <QUI.Heading level={1} size={5} weight="semibold" truncate>
          USD account summary
        </QUI.Heading>
        <QUI.IconButton variant="ghost" size="sm" aria-label="Refresh balances" icon={<QUI.Icon icon={Icons.RefreshCw} />} />
      </QUI.Inline>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.ArrowLeftRight} />} label="Transfer" />
        <QUI.Button variant="primary" icon={<QUI.Icon icon={Icons.Plus} />} label="Issue card" />
      </QUI.Inline>
    </QUI.Inline>
  );
}

/** Playground page: a USD account's balance card and its cards / transactions tables, in the Acme shell. */
export function UsdAccountSummaryPage() {
  const [tab, setTab] = React.useState("cards");
  return (
    <AcmeShell current="USD account summary" header={<PageHeader />} navigation={<AdminNavigation open="Accounts" />}>
      <QUI.Box paddingX="4" paddingBottom="4" shrink={false}>
        <BalanceCard />
      </QUI.Box>
      <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
        <QUI.Box border="subtle" borderEdge="bottom">
          <QUI.Tabs variant="underline" value={tab} onValueChange={(value) => setTab(String(value))}>
            <QUI.TabsList aria-label="Account views">
              <QUI.Tab value="cards" label="Cards" count={cards.length} />
              <QUI.Tab value="transactions" label="Transactions" count={transactions.length} />
            </QUI.TabsList>
          </QUI.Tabs>
        </QUI.Box>
      </QUI.Box>
      {tab === "cards" ? <CardsTab /> : <TransactionsTab />}
    </AcmeShell>
  );
}
