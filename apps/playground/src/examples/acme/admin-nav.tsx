import * as Icons from "lucide-react";
import type { IconComponent } from "./data";

export type AdminItem = { label: string; icon: IconComponent; slug: string };
export type AdminSection = { label: string; items: AdminItem[] };

const item = (label: string, icon: IconComponent = Icons.Folder): AdminItem => ({
  label,
  icon,
  slug: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
});

/** Admin entries that sit with the sidebar's main entries, above the sections. */
export const adminMainItems = [item("Developer portal", Icons.CodeXml)];

/** Every section of the admin console's navigation tree. */
export const adminSections: AdminSection[] = [
  {
    label: "Spend",
    items: [
      item("Spend overview", Icons.ChartPie),
      item("Transactions", Icons.ReceiptText),
      item("Cards", Icons.CreditCard),
      item("Budgets", Icons.PiggyBank),
      item("Policies", Icons.ShieldCheck),
      item("My spend", Icons.UserRound),
      item("Reimbursements", Icons.HandCoins),
      item("Travel", Icons.Plane),
      item("Bills", Icons.FileText),
    ],
  },
  {
    label: "Accounts",
    items: [
      item("Accounts", Icons.Landmark),
      item("Account balance logs", Icons.WalletCards),
      item("Approval requests", Icons.ListChecks),
      item("USD account summary", Icons.CircleDollarSign),
      item("Account managers", Icons.UserRound),
      item("Account statements", Icons.FileText),
      item("Balances", Icons.Wallet),
      item("Balance limits", Icons.Gauge),
      item("Virtual account balances", Icons.WalletMinimal),
      item("Virtual IBANs", Icons.Hash),
      item("Dormancy notifications", Icons.BellOff),
      item("Float accounts", Icons.Layers),
    ],
  },
  { label: "Approvals", items: [item("Approval rules", Icons.Workflow), item("Approval policies", Icons.ShieldCheck)] },
  { label: "Card programs", items: [item("Card types", Icons.Shapes), item("Card limits", Icons.Gauge)] },
  { label: "Companies", items: [item("Companies", Icons.Building2), item("Company users", Icons.UsersRound)] },
  { label: "Compliance", items: [item("KYC reviews", Icons.ScanFace), item("Screening", Icons.ShieldCheck)] },
  { label: "Payments", items: [item("Payments", Icons.Banknote), item("Payment links", Icons.Link), item("Refunds", Icons.Undo2)] },
  { label: "Reporting", items: [item("Reports", Icons.ChartColumn), item("Activity log", Icons.History), item("Exports", Icons.Download)] },
];

/** Every admin entry, for looking one up by its URL slug. */
export const adminItems: { item: AdminItem; section: string | null }[] = [
  ...adminMainItems.map((i) => ({ item: i, section: null })),
  ...adminSections.flatMap((s) => s.items.map((i) => ({ item: i, section: s.label }))),
];

/** Where an entry opens: balance logs and approval requests have their own screens, the rest a generic one. */
export function adminHref(entry: AdminItem) {
  return entry.slug === "account-balance-logs" ? "#/examples/tables" : `#/examples/tables/${entry.slug}`;
}
