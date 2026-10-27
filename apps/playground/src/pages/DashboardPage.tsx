import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import type { IconComponent } from "../examples/acme/data";
import { AcmeShell } from "../examples/acme/shell";

/**
 * A customer-success dashboard in the Acme shell: actions, account snapshot, contract info, health
 * scores and trends. Built only from qui components — no className or style anywhere in this file.
 */

type Tone = "success" | "warning" | "danger" | "info" | "neutral";
type CountRow = { icon: IconComponent; label: string; count: number; tone?: Tone };

const actionRows: CountRow[] = [
  { icon: Icons.OctagonAlert, label: "Critical", count: 3, tone: "danger" },
  { icon: Icons.ArrowUp, label: "High priority", count: 8, tone: "warning" },
  { icon: Icons.CalendarClock, label: "Due this week", count: 5, tone: "warning" },
  { icon: Icons.RefreshCcw, label: "Renewals overdue", count: 3, tone: "danger" },
  { icon: Icons.TrendingUp, label: "Growth opportunities", count: 10, tone: "success" },
];

const opportunityRows: CountRow[] = [
  { icon: Icons.Plus, label: "FX opportunity", count: 4 },
  { icon: Icons.Plus, label: "Global Pay opportunity", count: 3 },
  { icon: Icons.Plus, label: "Plan upgrade (cross-sell)", count: 5 },
  { icon: Icons.Plus, label: "VAT payments opportunity", count: 2 },
  { icon: Icons.Plus, label: "Points engagement", count: 6 },
  { icon: Icons.Plus, label: "Additional cards opportunity", count: 4 },
];

const riskRows: CountRow[] = [
  { icon: Icons.CircleAlert, label: "Declining spend", count: 5, tone: "danger" },
  { icon: Icons.CircleAlert, label: "No login (30+ days)", count: 7, tone: "danger" },
  { icon: Icons.CircleAlert, label: "Low health score", count: 6, tone: "danger" },
  { icon: Icons.CircleAlert, label: "Upcoming renewal risk", count: 3, tone: "danger" },
  { icon: Icons.CircleAlert, label: "Low platform adoption", count: 4, tone: "danger" },
  { icon: Icons.CircleAlert, label: "Champion left / inactive", count: 2, tone: "danger" },
];

const renewalRows: CountRow[] = [
  { icon: Icons.Clock, label: "This month (Sep)", count: 4 },
  { icon: Icons.Clock, label: "Next month (Oct)", count: 8 },
  { icon: Icons.Clock, label: "In 2 months (Nov)", count: 12 },
  { icon: Icons.Clock, label: "Overdue", count: 3, tone: "danger" },
];

const stats: { label: string; icon: IconComponent; value: string; unit?: string; change: string }[] = [
  { label: "Total customers", icon: Icons.UsersRound, value: "186", change: "8 (4.5%)" },
  { label: "Active & spending customers", icon: Icons.UserRoundCheck, value: "148", change: "6 (4.2%)" },
  { label: "Total spend (domestic + FX)", icon: Icons.Wallet, value: "46.2M", unit: "AED", change: "3.1M (7.2%)" },
  { label: "Sellable opportunity (SOP)", icon: Icons.Target, value: "24", change: "5 (26.3%)" },
  { label: "DNA score / 23", icon: Icons.ChartColumn, value: "17", unit: "/ 23", change: "2 pts" },
];

const contractTiers: { tier: string; rows: { type: string; customers: number }[] }[] = [
  { tier: "Tier 1 · Strategic", rows: [{ type: "Premium", customers: 21 }, { type: "Business Plus", customers: 12 }, { type: "Enterprise", customers: 6 }] },
  { tier: "Tier 2 · Growth", rows: [{ type: "Plus", customers: 34 }, { type: "Lite SME", customers: 29 }, { type: "Lite", customers: 74 }] },
  { tier: "Tier 3 · Entry", rows: [{ type: "Lite (auto accounts)", customers: 10 }] },
];
const totalCustomers = 186;

const lifecycle: { stage: string; count: number; tone: Tone }[] = [
  { stage: "Onboarding", count: 16, tone: "neutral" },
  { stage: "Adoption", count: 8, tone: "info" },
  { stage: "Growth", count: 31, tone: "success" },
  { stage: "Renewal", count: 7, tone: "warning" },
  { stage: "Active", count: 121, tone: "neutral" },
  { stage: "At risk", count: 3, tone: "danger" },
];

const engagement: { label: string; status: "High" | "Medium" | "Low" }[] = [
  { label: "CSM touchpoints (90 days)", status: "High" },
  { label: "Internal planning sessions (12m)", status: "High" },
  { label: "Strategic alignment sessions (12m)", status: "Medium" },
  { label: "Executive check-ins (12m)", status: "Low" },
];
const statusTone = { High: "success", Medium: "warning", Low: "danger" } as const;

const toneColor = { success: "var(--bg-success-primary)", warning: "var(--bg-warning-primary)", danger: "var(--bg-danger-primary)" };

const relationship = [
  { level: "High", customers: 97 },
  { level: "Medium", customers: 58 },
  { level: "Low", customers: 31 },
];
const dnaScores = [
  { band: "Champion (17–23)", customers: 93 },
  { band: "Steady (11–16)", customers: 63 },
  { band: "At risk (0–10)", customers: 30 },
];

const adoption: { feature: string; value: number }[] = [
  { feature: "Company funds", value: 98 },
  { feature: "Users", value: 96 },
  { feature: "Cards", value: 94 },
  { feature: "Card types", value: 82 },
  { feature: "Pool accounts", value: 87 },
  { feature: "Categories & segments", value: 78 },
  { feature: "Approval workflows", value: 88 },
  { feature: "Chart of accounts", value: 71 },
  { feature: "ERP manual", value: 69 },
  { feature: "ERP integration", value: 55 },
  { feature: "FX", value: 38 },
  { feature: "Global Pay", value: 19 },
  { feature: "VAT payments", value: 27 },
  { feature: "Points", value: 62 },
  { feature: "Corporate travel", value: 33 },
  { feature: "Payment links", value: 41 },
];

/** Cumulative month-to-date spend (millions), split domestic / FX. */
const spendDays = [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29];
const spendData = spendDays.map((day, i) => {
  const total = Math.round((1.2 + i * 3.75) * 10) / 10;
  return { day: `${day} Sep`, total, domestic: Math.round(total * 0.797 * 10) / 10, fx: Math.round(total * 0.203 * 10) / 10 };
});
const spendSeries = { total: "Total spend", domestic: "Domestic", fx: "FX" } as const;

/** A section heading with the cards it introduces. */
function Section({ title, columns, children }: { title: string; columns: 2 | 3 | 5; children: React.ReactNode }) {
  return (
    <QUI.Stack as="section" aria-label={title} gap="3">
      <QUI.Heading level={2} size={6} weight="semibold">
        {title}
      </QUI.Heading>
      <QUI.Grid columns={columns} collapseBelow="lg" gap="4">
        {children}
      </QUI.Grid>
    </QUI.Stack>
  );
}

/** A bordered card with a title, an optional count and "View all". */
function Panel({ title, count, viewAll = true, children }: { title: string; count?: number; viewAll?: boolean; children: React.ReactNode }) {
  return (
    <QUI.Box border="subtle" radius="lg" padding="4" background="layer-2">
      <QUI.Stack gap="3">
        <QUI.Inline justify="between" wrap={false}>
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Text size="sm" weight="semibold">
              {title}
            </QUI.Text>
            {count != null ? <QUI.Badge size="xs" label={count} /> : null}
          </QUI.Inline>
          {viewAll ? <QUI.TextButton label="View all" /> : null}
        </QUI.Inline>
        {children}
      </QUI.Stack>
    </QUI.Box>
  );
}

/** Rows that each open a filtered list: icon, label, count and a chevron. */
function CountList({ label, rows }: { label: string; rows: CountRow[] }) {
  return (
    <QUI.List aria-label={label}>
      {rows.map((row) => (
        <QUI.ListItem key={row.label}>
          <QUI.ListItemButton
            startIcon={<QUI.Icon icon={row.icon} tint={row.tone === "danger" ? "danger" : "secondary"} />}
            label={row.label}
            endIcon={
              <QUI.Inline gap="2" wrap={false}>
                <QUI.Text size="sm" weight="semibold" tabularNums color={row.tone === "danger" ? "danger" : "primary"}>
                  {row.count}
                </QUI.Text>
                <QUI.Icon icon={Icons.ChevronRight} tint="tertiary" />
              </QUI.Inline>
            }
          />
        </QUI.ListItem>
      ))}
    </QUI.List>
  );
}

function PageHeader() {
  return (
    <QUI.Inline justify="between" gap="4" paddingX="6" paddingY="4" stackBelow="md">
      <QUI.Stack gap="0.5">
        <QUI.Heading level={1} size={4} weight="semibold">
          Welcome Ranu
        </QUI.Heading>
        <QUI.Text size="sm" color="tertiary">
          Your customer success book of business
        </QUI.Text>
      </QUI.Stack>
      <QUI.Inline gap="2">
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.ListFilter} />} label="Filters" />
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.Download} />} label="Export" />
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.Calendar} />} endIcon={<QUI.Icon icon={Icons.ChevronDown} />} label="1–29 Sep 2026" />
      </QUI.Inline>
    </QUI.Inline>
  );
}

function Actions() {
  return (
    <Section title="Actions" columns={3}>
      <Panel title="My action centre" count={29}>
        <CountList label="Actions" rows={actionRows} />
      </Panel>
      <Panel title="Top opportunities">
        <CountList label="Opportunities" rows={opportunityRows} />
      </Panel>
      <Panel title="At risk customers">
        <CountList label="At risk customers" rows={riskRows} />
      </Panel>
    </Section>
  );
}

function AccountSnapshot() {
  return (
    <Section title="Account snapshot" columns={5}>
      {stats.map((stat) => (
        <QUI.Box key={stat.label} border="subtle" radius="lg" padding="4" background="layer-2">
          <QUI.Stack gap="3">
            <QUI.Inline justify="between" align="start" wrap={false} gap="2">
              <QUI.Text size="sm" color="secondary">
                {stat.label}
              </QUI.Text>
              <QUI.Icon icon={stat.icon} tint="tertiary" />
            </QUI.Inline>
            <QUI.Inline gap="1" align="baseline" wrap={false}>
              <QUI.Heading level={3} size={3} weight="semibold">
                {stat.value}
              </QUI.Heading>
              {stat.unit ? (
                <QUI.Text size="xs" color="tertiary">
                  {stat.unit}
                </QUI.Text>
              ) : null}
            </QUI.Inline>
            <QUI.Stack gap="1" align="start">
              <QUI.Badge size="xs" variant="success" startIcon={<QUI.Icon icon={Icons.TrendingUp} />} label={stat.change} />
              <QUI.Text variant="caption" size="md" color="tertiary">
                vs last month
              </QUI.Text>
            </QUI.Stack>
          </QUI.Stack>
        </QUI.Box>
      ))}
    </Section>
  );
}

function ContractTable() {
  return (
    <QUI.Table density="compact" aria-label="Customers by contract type">
      <QUI.TableHeader>
        <QUI.TableRow>
          <QUI.TableHead>Contract type</QUI.TableHead>
          <QUI.TableHead>Customers</QUI.TableHead>
          <QUI.TableHead>% of total</QUI.TableHead>
        </QUI.TableRow>
      </QUI.TableHeader>
      <QUI.TableBody>
        {contractTiers.map((tier) => (
          <React.Fragment key={tier.tier}>
            <QUI.TableRow>
              <QUI.TableCell colSpan={3}>
                <QUI.Badge size="xs" variant="brand" label={tier.tier} />
              </QUI.TableCell>
            </QUI.TableRow>
            {tier.rows.map((row) => (
              <QUI.TableRow key={row.type}>
                <QUI.TableCell>{row.type}</QUI.TableCell>
                <QUI.TableCell>{row.customers}</QUI.TableCell>
                <QUI.TableCell>{Math.round((row.customers / totalCustomers) * 100)}%</QUI.TableCell>
              </QUI.TableRow>
            ))}
          </React.Fragment>
        ))}
        <QUI.TableRow>
          <QUI.TableCell>
            <QUI.Text size="sm" weight="semibold">
              Total
            </QUI.Text>
          </QUI.TableCell>
          <QUI.TableCell>
            <QUI.Text size="sm" weight="semibold">
              {totalCustomers}
            </QUI.Text>
          </QUI.TableCell>
          <QUI.TableCell>
            <QUI.Text size="sm" weight="semibold">
              100%
            </QUI.Text>
          </QUI.TableCell>
        </QUI.TableRow>
      </QUI.TableBody>
    </QUI.Table>
  );
}

function ContractInfo() {
  return (
    <Section title="Contract info" columns={3}>
      <Panel title="Contract type & tier">
        <ContractTable />
      </Panel>
      <Panel title="Renewals overview">
        <CountList label="Renewals" rows={renewalRows} />
      </Panel>
      <Panel title="Customer lifecycle">
        <QUI.Grid columns={2} gap="2">
          {lifecycle.map((stage) => (
            <QUI.Box key={stage.stage} border="subtle" radius="md" padding="3" background="surface-2">
              <QUI.Stack gap="2" align="start">
                <QUI.Badge size="sm" variant={stage.tone} label={stage.stage} />
                <QUI.Heading level={3} size={4} weight="semibold">
                  {stage.count}
                </QUI.Heading>
              </QUI.Stack>
            </QUI.Box>
          ))}
        </QUI.Grid>
      </Panel>
    </Section>
  );
}

/** A donut with its total in the middle; slices are coloured by tone in the order high → low. */
function ToneDonut({ label, data, nameKey, center, caption }: { label: string; data: ChartRow[]; nameKey: string; center: string; caption: string }) {
  const tones = [toneColor.success, toneColor.warning, toneColor.danger];
  return (
    <QUI.DonutChart
      aria-label={label}
      height={220}
      nameKey={nameKey}
      valueKey="customers"
      data={data}
      colors={Object.fromEntries(data.map((row, i) => [String(row[nameKey]), tones[i]!]))}
      centerContent={
        <>
          <QUI.Text size="md" weight="semibold">
            {center}
          </QUI.Text>
          <QUI.Text variant="caption" size="md" color="tertiary">
            {caption}
          </QUI.Text>
        </>
      }
    />
  );
}
type ChartRow = Record<string, string | number>;

function HealthScores() {
  return (
    <Section title="Health scores" columns={3}>
      <Panel title="Customer engagement">
        <QUI.Stack gap="1">
          <QUI.Inline justify="between">
            <QUI.Text size="xs" color="tertiary">
              Overall engagement
            </QUI.Text>
            <QUI.Badge size="xs" variant="success" label="High" />
          </QUI.Inline>
          <QUI.LinearProgress aria-label="Overall engagement" value={92} variant="success" showValue={false} />
        </QUI.Stack>
        <QUI.Stack as="ul" aria-label="Engagement components" gap="3" paddingY="1">
          {engagement.map((row) => (
            <QUI.Inline as="li" key={row.label} justify="between" wrap={false} gap="2">
              <QUI.Text size="sm">{row.label}</QUI.Text>
              <QUI.Badge size="xs" variant={statusTone[row.status]} label={row.status} />
            </QUI.Inline>
          ))}
        </QUI.Stack>
        <QUI.Text variant="caption" size="md" color="tertiary">
          Targets vary by contract type.
        </QUI.Text>
      </Panel>
      <Panel title="Customer relationship summary" viewAll={false}>
        <ToneDonut label="Customers by relationship strength" data={relationship} nameKey="level" center="186" caption="Customers" />
      </Panel>
      <Panel title="DNA score distribution / 23" viewAll={false}>
        <ToneDonut label="Customers by DNA score band" data={dnaScores} nameKey="band" center="17" caption="avg / 23" />
      </Panel>
    </Section>
  );
}

function adoptionVariant(value: number) {
  return value >= 70 ? "success" : value >= 50 ? "warning" : "danger";
}

function SpendTrends() {
  const [series, setSeries] = React.useState<keyof typeof spendSeries>("total");
  return (
    <Panel title="Spend trends">
      <QUI.Grid columns={4} gap="2">
        {[
          { label: "This month", value: "46.2M" },
          { label: "MoM", value: "7.2%" },
          { label: "QoQ", value: "14.2%" },
          { label: "YoY", value: "39.1%" },
        ].map((metric, i) => (
          <QUI.Stack key={metric.label} gap="0.5">
            <QUI.Text variant="caption" size="md" color="tertiary">
              {metric.label}
            </QUI.Text>
            <QUI.Inline gap="0.5" wrap={false}>
              {i > 0 ? <QUI.Icon icon={Icons.TrendingUp} size="sm" tint="secondary" /> : null}
              <QUI.Text size="sm" weight="semibold" color={i > 0 ? "success" : "primary"}>
                {metric.value}
              </QUI.Text>
            </QUI.Inline>
          </QUI.Stack>
        ))}
      </QUI.Grid>
      <QUI.Tabs value={series} onValueChange={(value) => setSeries(value as keyof typeof spendSeries)}>
        <QUI.TabsList>
          {Object.entries(spendSeries).map(([key, label]) => (
            <QUI.Tab key={key} value={key} label={label} />
          ))}
        </QUI.TabsList>
      </QUI.Tabs>
      <QUI.LineChart
        aria-label={`${spendSeries[series]}, month to date, cumulative`}
        height={220}
        categoryKey="day"
        series={[{ key: series, label: spendSeries[series] }]}
        data={spendData}
        valueFormatter={(value) => `${value}M`}
        showLegend={false}
      />
      <QUI.Text variant="caption" size="md" color="tertiary">
        Month to date, cumulative
      </QUI.Text>
    </Panel>
  );
}

function TrendingMetrics() {
  return (
    <Section title="Trending metrics" columns={2}>
      <Panel title="Platform adoption">
        <QUI.Grid columns={4} collapseBelow="md" gap="4">
          {adoption.map((row) => (
            <QUI.Stack key={row.feature} gap="1">
              <QUI.Text variant="caption" size="md" color="tertiary" maxLines={1}>
                {row.feature}
              </QUI.Text>
              <QUI.LinearProgress aria-label={row.feature} size="sm" value={row.value} variant={adoptionVariant(row.value)} />
            </QUI.Stack>
          ))}
        </QUI.Grid>
      </Panel>
      <SpendTrends />
    </Section>
  );
}

/** Playground page: the dashboard in the Acme shell, with its own header instead of the project header. */
export function DashboardPage() {
  return (
    <AcmeShell current="Dashboards" header={<PageHeader />} panel={false}>
      <QUI.Box grow overflow="auto">
        <QUI.Stack gap="8" paddingX="6" paddingTop="6" paddingBottom="8">
          <Actions />
          <AccountSnapshot />
          <ContractInfo />
          <HealthScores />
          <TrendingMetrics />
        </QUI.Stack>
      </QUI.Box>
    </AcmeShell>
  );
}
