import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import type { IconComponent } from "../examples/acme/data";
import { AcmeShell } from "../examples/acme/shell";

/**
 * The glass material across qui: a glass stage in the Acme shell, glass tabs, glass buttons and glass cards. Built
 * only from qui components — no className or style anywhere in this file.
 */

const ranges = ["Day", "Week", "Month", "Quarter", "Year"];

const tiles: { icon: IconComponent; label: string; value: string; note: string }[] = [
  { icon: Icons.Wallet, label: "Spend this week", value: "AED 48,210", note: "12% under budget" },
  { icon: Icons.CreditCard, label: "Active cards", value: "1,284", note: "36 issued this week" },
  { icon: Icons.ReceiptText, label: "Receipts missing", value: "17", note: "Down from 42" },
];

function PageHeader() {
  return (
    <QUI.Inline justify="between" gap="4" paddingX="6" paddingY="4" stackBelow="md">
      <QUI.Stack gap="0.5">
        <QUI.Heading level={1} size={4} weight="semibold">
          Glass
        </QUI.Heading>
        <QUI.Text size="sm" color="tertiary">
          The glass material on the stage, tabs, buttons and cards
        </QUI.Text>
      </QUI.Stack>
      <QUI.Inline gap="2">
        <QUI.IconButton variant="glass" size="lg" aria-label="Search" icon={<QUI.Icon icon={Icons.Search} />} />
        <QUI.IconButton variant="glass" size="lg" aria-label="Notifications" icon={<QUI.Icon icon={Icons.Bell} />} />
        <QUI.Button variant="glass" size="lg" icon={<QUI.Icon icon={Icons.Download} />} label="Export" />
      </QUI.Inline>
    </QUI.Inline>
  );
}

function Hero() {
  return (
    <QUI.Box background="glass" radius="xl" padding="8">
      <QUI.Stack gap="6" align="center">
        <QUI.Stack gap="2" align="center">
          <QUI.Heading level={2} size={2} weight="semibold" align="center">
            Spend smarter, together
          </QUI.Heading>
          <QUI.Text size="md" color="secondary" align="center">
            Cards, bills and approvals in one place. Set up your team in minutes.
          </QUI.Text>
        </QUI.Stack>
        <QUI.Inline gap="3" justify="center">
          <QUI.Button variant="glass" size="2xl" label="Get started" endIcon={<QUI.Icon icon={Icons.ChevronRight} />} />
          <QUI.Button variant="glass" size="2xl" icon={<QUI.Icon icon={Icons.Play} />} label="Watch demo" />
        </QUI.Inline>
      </QUI.Stack>
    </QUI.Box>
  );
}

function Overview() {
  const [range, setRange] = React.useState("Week");
  return (
    <QUI.Stack gap="4">
      <QUI.Inline justify="between" gap="3" stackBelow="sm">
        <QUI.Heading level={2} size={5} weight="semibold">
          This {range.toLowerCase()}
        </QUI.Heading>
        <QUI.Tabs variant="glass" value={range} onValueChange={(next) => setRange(next as string)}>
          <QUI.TabsList aria-label="Range">
            {ranges.map((r) => (
              <QUI.Tab key={r} value={r} label={r} />
            ))}
          </QUI.TabsList>
        </QUI.Tabs>
      </QUI.Inline>
      <QUI.Grid columns={3} collapseBelow="md" gap="4">
        {tiles.map((tile) => (
          <QUI.Box key={tile.label} background="glass" radius="lg" padding="5">
            <QUI.Stack gap="3">
              <QUI.Inline justify="between" wrap={false} gap="2">
                <QUI.Text size="sm" color="tertiary" maxLines={1}>
                  {tile.label}
                </QUI.Text>
                <QUI.IconButton variant="glass" size="sm" aria-label={`Open ${tile.label}`} icon={<QUI.Icon icon={tile.icon} />} />
              </QUI.Inline>
              <QUI.Heading level={3} size={3} weight="semibold">
                {tile.value}
              </QUI.Heading>
              <QUI.Text size="xs" color="secondary">
                {tile.note}
              </QUI.Text>
            </QUI.Stack>
          </QUI.Box>
        ))}
      </QUI.Grid>
    </QUI.Stack>
  );
}

function Controls() {
  return (
    <QUI.Box background="glass" radius="lg" padding="5">
      <QUI.Stack gap="4">
        <QUI.Heading level={2} size={5} weight="semibold">
          Every size
        </QUI.Heading>
        <QUI.Inline gap="3">
          {(["xs", "sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
            <QUI.Button key={size} variant="glass" size={size} label={size} />
          ))}
        </QUI.Inline>
        <QUI.Inline gap="3">
          <QUI.Button variant="glass" size="lg" label="Continue" endIcon={<QUI.Icon icon={Icons.ArrowRight} />} />
          <QUI.Button variant="glass" size="lg" label="Saving" loading />
          <QUI.Button variant="glass" size="lg" label="Disabled" disabled />
          <QUI.IconButton variant="glass" size="xl" aria-label="Add" icon={<QUI.Icon icon={Icons.Plus} />} />
        </QUI.Inline>
      </QUI.Stack>
    </QUI.Box>
  );
}

export function GlassPage() {
  return (
    <AcmeShell current="Dashboards" header={<PageHeader />} panel="glass">
      <QUI.Box grow overflow="auto">
        <QUI.Stack gap="8" paddingX="6" paddingTop="2" paddingBottom="8">
          <Hero />
          <Overview />
          <Controls />
        </QUI.Stack>
      </QUI.Box>
    </AcmeShell>
  );
}
