import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import type { IconComponent } from "./data";
import { NavLink } from "./shell";

export type AdminItem = { label: string; icon: IconComponent; slug: string };
export type AdminSection = { label: string; items: AdminItem[] };

const item = (label: string, icon: IconComponent = Icons.Folder): AdminItem => ({
  label,
  icon,
  slug: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
});

/** The top-level entries above the sections. */
const mainItems = [item("Home", Icons.House), item("Developer portal", Icons.CodeXml)];

/** Every section of the admin console's navigation tree. */
export const adminSections: AdminSection[] = [
  {
    label: "Accounts",
    items: [
      item("Accounts", Icons.Landmark),
      item("Account balance logs", Icons.WalletCards),
      item("Account balance transactions", Icons.ArrowLeftRight),
      item("Account details", Icons.IdCard),
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
  { label: "Approvals", items: [item("Approval requests", Icons.ListChecks), item("Approval rules", Icons.Workflow)] },
  { label: "Cards", items: [item("Cards", Icons.CreditCard), item("Card types", Icons.Shapes), item("Card limits", Icons.Gauge)] },
  { label: "Companies", items: [item("Companies", Icons.Building2), item("Company users", Icons.UsersRound)] },
  { label: "Compliance", items: [item("KYC reviews", Icons.ScanFace), item("Screening", Icons.ShieldCheck)] },
  { label: "Payments", items: [item("Payments", Icons.Banknote), item("Payment links", Icons.Link), item("Refunds", Icons.Undo2)] },
  { label: "Reporting", items: [item("Reports", Icons.ChartColumn), item("Exports", Icons.Download)] },
];

/** Every admin entry, for looking one up by its URL slug. */
export const adminItems: { item: AdminItem; section: string | null }[] = [
  ...mainItems.map((i) => ({ item: i, section: null })),
  ...adminSections.flatMap((s) => s.items.map((i) => ({ item: i, section: s.label }))),
];

/** Where an entry opens: balance logs and approval requests have their own screens, the rest a generic one. */
export function adminHref(entry: AdminItem) {
  return entry.slug === "account-balance-logs" ? "#/examples/tables" : `#/examples/tables/${entry.slug}`;
}

/** The admin console's navigation tree shared by the table screens; `open` is the section the current screen is in. */
export function AdminNavigation({ open }: { open: string | null }) {
  return (
    <>
      <QUI.List aria-label="Main">
        {mainItems.map((i) => (
          <NavLink key={i.slug} icon={i.icon} label={i.label} href={adminHref(i)} />
        ))}
      </QUI.List>
      {adminSections.map((section) => (
        <QUI.ListSection key={section.label} label={section.label} defaultOpen={open === section.label}>
          <QUI.List aria-label={section.label}>
            {section.items.map((i) => (
              <NavLink key={i.slug} icon={i.icon} label={i.label} href={adminHref(i)} />
            ))}
          </QUI.List>
        </QUI.ListSection>
      ))}
    </>
  );
}
