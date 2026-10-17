import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import type { IconComponent } from "../examples/acme/data";
import { AcmeShell } from "../examples/acme/shell";
import { AdminNavigation } from "../examples/acme/admin-nav";
import { budgets, merchants, sum, transactions } from "../examples/acme/spend-data";

/**
 * The spend-management home — "Spend overview" — in the Acme shell: headline numbers, spend against budget,
 * spend by category, department budgets, top merchants and a "needs attention" list that opens the filtered
 * transactions. Built only from qui components — no className or style anywhere in this file.
 */

const aed = new Intl.NumberFormat("en-US", { style: "currency", currency: "AED", currencyDisplay: "code", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

const totalBudget = sum(budgets.map((b) => b.budget));
const spent = sum(transactions.map((t) => t.amount));
const daysInMonth = 31;
const dayOfMonth = 17;

/** Cumulative spend per day so far, against an even pace to the monthly budget. */
const paceData = Array.from({ length: daysInMonth }, (_, i) => {
  const day = i + 1;
  const toDay = transactions.filter((t) => new Date(t.date).getUTCDate() <= day);
  return {
    day: String(day),
    Spend: day <= dayOfMonth ? Math.round(sum(toDay.map((t) => t.amount)) / 1000) : undefined,
    Budget: Math.round((totalBudget / daysInMonth) * day / 1000),
  };
});

const categories = [...new Set(merchants.map((m) => m.category))]
  .map((category) => ({ category, amount: Math.round(sum(transactions.filter((t) => t.category === category).map((t) => t.amount))) }))
  .sort((a, b) => b.amount - a.amount);

const departmentRows = budgets.map((b) => {
  const used = sum(transactions.filter((t) => t.department === b.department).map((t) => t.amount));
  return { ...b, spent: Math.round(used), pct: Math.round((used / b.budget) * 100) };
});

const merchantRows = merchants
  .map((m) => {
    const rows = transactions.filter((t) => t.merchant === m.merchant);
    return { ...m, amount: Math.round(sum(rows.map((t) => t.amount))), count: rows.length };
  })
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 6);

const missingReceipts = transactions.filter((t) => t.receipt === "Missing").length;
const flagged = transactions.filter((t) => t.policy).length;
const failedSync = transactions.filter((t) => t.sync === "Failed").length;
const overBudget = departmentRows.filter((d) => d.pct >= 100).length;

const attention: { icon: IconComponent; label: string; count: number; href: string; danger?: boolean }[] = [
  { icon: Icons.ReceiptText, label: "Missing receipts", count: missingReceipts, href: "#/examples/tables/transactions?view=missing" },
  { icon: Icons.ShieldAlert, label: "Policy flags to review", count: flagged, href: "#/examples/tables/transactions?view=flagged", danger: true },
  { icon: Icons.RefreshCcwDot, label: "Failed accounting syncs", count: failedSync, href: "#/examples/tables/transactions?view=unsynced", danger: true },
  { icon: Icons.ListChecks, label: "Approvals waiting on you", count: 23, href: "#/examples/tables/approval-requests" },
  { icon: Icons.Gauge, label: "Departments near budget", count: departmentRows.filter((d) => d.pct >= 80).length + overBudget, href: "#/examples/tables/spend-overview" },
];

/** A bordered card with a title, an optional subtitle and a header action. */
function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <QUI.Box as="section" aria-label={title} border="subtle" radius="lg" padding="4" background="surface-1">
      <QUI.Stack gap="3">
        <QUI.Inline justify="between" gap="2" wrap={false}>
          <QUI.Stack gap="0.5">
            <QUI.Text size="sm" weight="semibold" color="primary">
              {title}
            </QUI.Text>
            {subtitle ? (
              <QUI.Text variant="caption" size="md" color="tertiary">
                {subtitle}
              </QUI.Text>
            ) : null}
          </QUI.Stack>
          {action}
        </QUI.Inline>
        {children}
      </QUI.Stack>
    </QUI.Box>
  );
}

function Stat({ icon, label, value, children }: { icon: IconComponent; label: string; value: string; children?: React.ReactNode }) {
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
        {children}
      </QUI.Stack>
    </QUI.Box>
  );
}

function PageHeader({ period, onPeriod }: { period: string; onPeriod: (value: string) => void }) {
  return (
    <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3">
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Icon icon={Icons.ChartPie} size="lg" tint="secondary" />
        <QUI.Heading level={1} size={5} weight="semibold" truncate>
          Spend overview
        </QUI.Heading>
      </QUI.Inline>
      <QUI.Inline gap="2" wrap={false}>
        <QUI.Box shrink={false}>
          <QUI.Tabs value={period} onValueChange={(value) => onPeriod(String(value))}>
            <QUI.TabsList aria-label="Period">
              <QUI.Tab value="month" label="October" />
              <QUI.Tab value="quarter" label="Q4" />
              <QUI.Tab value="year" label="2026" />
            </QUI.TabsList>
          </QUI.Tabs>
        </QUI.Box>
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.Download} />} label="Export" />
      </QUI.Inline>
    </QUI.Inline>
  );
}

/** Playground page: the spend-management home dashboard. */
export function SpendOverviewPage() {
  const [period, setPeriod] = React.useState("month");
  const budgetUsed = Math.round((spent / totalBudget) * 100);
  const projected = Math.round((spent / dayOfMonth) * daysInMonth);
  return (
    <AcmeShell current="Spend overview" header={<PageHeader period={period} onPeriod={setPeriod} />} navigation={<AdminNavigation open="Spend" />}>
      <QUI.Box grow overflow="auto" paddingX="4" paddingBottom="4">
        <QUI.Stack gap="4">
          <QUI.Grid columns={4} collapseBelow="lg" gap="4">
            <Stat icon={Icons.Wallet} label="Spent in October" value={aed.format(spent)}>
              <QUI.Inline gap="1">
                <QUI.Badge size="xs" variant="warning" startIcon={<QUI.Icon icon={Icons.TrendingUp} />} label="+8.4%" />
                <QUI.Text variant="caption" size="md" color="tertiary">
                  vs September, same day
                </QUI.Text>
              </QUI.Inline>
            </Stat>
            <Stat icon={Icons.Gauge} label="Budget used" value={`${budgetUsed}%`}>
              <QUI.LinearProgress value={budgetUsed} variant={budgetUsed >= 90 ? "danger" : budgetUsed >= 70 ? "warning" : "brand"} aria-label="Monthly budget used" showValue={false} />
              <QUI.Text variant="caption" size="md" color="tertiary">
                {aed.format(totalBudget - spent)} left of {compact.format(totalBudget)} · {daysInMonth - dayOfMonth} days to go
              </QUI.Text>
            </Stat>
            <Stat icon={Icons.ListChecks} label="Pending approvals" value="23">
              <QUI.Text variant="caption" size="md" color="tertiary">
                AED 48.2K waiting · oldest 3 days
              </QUI.Text>
            </Stat>
            <Stat icon={Icons.ReceiptText} label="Missing receipts" value={String(missingReceipts)}>
              <QUI.Text variant="caption" size="md" color="tertiary">
                {Math.round((missingReceipts / transactions.length) * 100)}% of card spend this month
              </QUI.Text>
            </Stat>
          </QUI.Grid>

          <QUI.Grid columns={3} collapseBelow="lg" gap="4">
            <QUI.Box>
              <Panel
                title="Spend vs budget pace"
                subtitle={`Cumulative, AED thousands · on track for ${compact.format(projected)} against ${compact.format(totalBudget)}`}
                action={<QUI.Badge size="xs" variant={projected > totalBudget ? "danger" : "success"} label={projected > totalBudget ? "Over pace" : "On pace"} />}
              >
                <QUI.LineChart
                  aria-label="Cumulative October spend against an even budget pace, AED thousands"
                  height={240}
                  categoryKey="day"
                  series={[
                    { key: "Spend", label: "Spend" },
                    { key: "Budget", label: "Budget pace" },
                  ]}
                  data={paceData}
                  valueFormatter={(v) => `${v}K`}
                />
              </Panel>
            </QUI.Box>
            <Panel title="By category" subtitle="October, AED">
              <QUI.DonutChart
                aria-label="October spend by category"
                height={180}
                nameKey="category"
                valueKey="amount"
                data={categories}
                showLegend={false}
                centerContent={
                  <QUI.Stack gap="0" align="center">
                    <QUI.Text size="sm" weight="semibold" color="primary">
                      {compact.format(spent)}
                    </QUI.Text>
                    <QUI.Text variant="caption" size="md" color="tertiary">
                      total
                    </QUI.Text>
                  </QUI.Stack>
                }
              />
              <QUI.Stack gap="1.5">
                {categories.map((c, i) => (
                  <QUI.Inline key={c.category} justify="between" gap="2" wrap={false}>
                    <QUI.Inline gap="2" wrap={false}>
                      <QUI.Swatch fill={QUI.chartColor(i)} />
                      <QUI.Text size="xs" color="secondary">
                        {c.category}
                      </QUI.Text>
                    </QUI.Inline>
                    <QUI.Text size="xs" weight="medium" color="primary" tabularNums>
                      {aed.format(c.amount)}
                    </QUI.Text>
                  </QUI.Inline>
                ))}
              </QUI.Stack>
            </Panel>
            <Panel title="Needs attention">
              <QUI.List aria-label="Needs attention">
                {attention.map((row) => (
                  <QUI.ListItem key={row.label}>
                    <QUI.ListItemLink
                      href={row.href}
                      startIcon={<QUI.Icon icon={row.icon} tint={row.danger ? "danger" : "secondary"} />}
                      label={row.label}
                      endIcon={
                        <QUI.Inline gap="2" wrap={false}>
                          <QUI.Text size="sm" weight="semibold" tabularNums color={row.danger ? "danger" : "primary"}>
                            {row.count}
                          </QUI.Text>
                          <QUI.Icon icon={Icons.ChevronRight} tint="tertiary" />
                        </QUI.Inline>
                      }
                    />
                  </QUI.ListItem>
                ))}
              </QUI.List>
            </Panel>
          </QUI.Grid>

          <QUI.Grid columns={2} collapseBelow="lg" gap="4">
            <Panel title="Department budgets" subtitle="October" action={<QUI.TextButton label="Manage budgets" />}>
              <QUI.Table aria-label="Department budgets" density="compact" stickyHeader={false}>
                <QUI.TableHeader>
                  <QUI.TableRow>
                    <QUI.TableHead>Department</QUI.TableHead>
                    <QUI.TableHead>Owner</QUI.TableHead>
                    <QUI.TableHead align="end">Spent</QUI.TableHead>
                    <QUI.TableHead align="end">Budget</QUI.TableHead>
                    <QUI.TableHead>Used</QUI.TableHead>
                  </QUI.TableRow>
                </QUI.TableHeader>
                <QUI.TableBody>
                  {departmentRows.map((row) => (
                    <QUI.TableRow key={row.department}>
                      <QUI.TableCell>{row.department}</QUI.TableCell>
                      <QUI.TableCell>
                        <QUI.UserCell name={row.owner} />
                      </QUI.TableCell>
                      <QUI.TableCell align="end">
                        <QUI.MoneyCell amount={row.spent} currency="AED" display="none" notation="compact" locale="en-US" />
                      </QUI.TableCell>
                      <QUI.TableCell align="end">
                        <QUI.MoneyCell amount={row.budget} currency="AED" display="none" notation="compact" locale="en-US" />
                      </QUI.TableCell>
                      <QUI.TableCell>
                        <QUI.ProgressCell value={Math.min(row.pct, 100)} variant={row.pct >= 100 ? "danger" : row.pct >= 80 ? "warning" : "brand"} aria-label={`${row.department} budget used`} />
                      </QUI.TableCell>
                    </QUI.TableRow>
                  ))}
                </QUI.TableBody>
              </QUI.Table>
            </Panel>
            <Panel title="Top merchants" subtitle="October" action={<QUI.TextButton label="View all" />}>
              <QUI.Table aria-label="Top merchants" density="compact" stickyHeader={false}>
                <QUI.TableHeader>
                  <QUI.TableRow>
                    <QUI.TableHead>Merchant</QUI.TableHead>
                    <QUI.TableHead>Category</QUI.TableHead>
                    <QUI.TableHead align="end">Transactions</QUI.TableHead>
                    <QUI.TableHead align="end">Spend</QUI.TableHead>
                  </QUI.TableRow>
                </QUI.TableHeader>
                <QUI.TableBody>
                  {merchantRows.map((row) => (
                    <QUI.TableRow key={row.merchant}>
                      <QUI.TableCell>
                        <QUI.TextCell primary={row.merchant} href={`#/examples/tables/transactions?q=${encodeURIComponent(row.merchant)}`} tone="link" />
                      </QUI.TableCell>
                      <QUI.TableCell>{row.category}</QUI.TableCell>
                      <QUI.TableCell align="end">
                        <QUI.NumberCell value={row.count} format="integer" />
                      </QUI.TableCell>
                      <QUI.TableCell align="end">
                        <QUI.MoneyCell amount={row.amount} currency="AED" display="code" locale="en-US" minor="hidden" />
                      </QUI.TableCell>
                    </QUI.TableRow>
                  ))}
                </QUI.TableBody>
              </QUI.Table>
            </Panel>
          </QUI.Grid>
        </QUI.Stack>
      </QUI.Box>
    </AcmeShell>
  );
}
