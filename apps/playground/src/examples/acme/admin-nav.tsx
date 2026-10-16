import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { NavLink } from "./shell";

const otherSections = [
  { label: "Cards", items: ["Cards", "Card types", "Card limits"] },
  { label: "Companies", items: ["Companies", "Company users"] },
  { label: "Compliance", items: ["KYC reviews", "Screening"] },
  { label: "Payments", items: ["Payments", "Payment links", "Refunds"] },
  { label: "Reporting", items: ["Reports", "Exports"] },
];

/** The admin console's navigation tree shared by the table screens; `open` is the section the current screen is in. */
export function AdminNavigation({ open }: { open: "Accounts" | "Approvals" }) {
  return (
    <>
      <QUI.List aria-label="Main">
        <NavLink icon={Icons.House} label="Home" />
        <NavLink icon={Icons.CodeXml} label="Developer portal" />
      </QUI.List>
      <QUI.ListSection label="Accounts" defaultOpen={open === "Accounts"}>
        <QUI.List aria-label="Accounts">
          <NavLink icon={Icons.Landmark} label="Accounts" />
          <NavLink icon={Icons.WalletCards} label="Account balance logs" />
          <NavLink icon={Icons.ArrowLeftRight} label="Account balance transactions" />
          <NavLink icon={Icons.IdCard} label="Account details" />
          <NavLink icon={Icons.UserRound} label="Account managers" />
          <NavLink icon={Icons.FileText} label="Account statements" />
          <NavLink icon={Icons.Wallet} label="Balances" />
          <NavLink icon={Icons.Gauge} label="Balance limits" />
          <NavLink icon={Icons.WalletMinimal} label="Virtual account balances" />
          <NavLink icon={Icons.Hash} label="Virtual IBANs" />
          <NavLink icon={Icons.BellOff} label="Dormancy notifications" />
          <NavLink icon={Icons.Layers} label="Float accounts" />
        </QUI.List>
      </QUI.ListSection>
      <QUI.ListSection label="Approvals" defaultOpen={open === "Approvals"}>
        <QUI.List aria-label="Approvals">
          <NavLink icon={Icons.ListChecks} label="Approval requests" />
          <NavLink icon={Icons.Workflow} label="Approval rules" />
        </QUI.List>
      </QUI.ListSection>
      {otherSections.map((section) => (
        <QUI.ListSection key={section.label} label={section.label}>
          <QUI.List aria-label={section.label}>
            {section.items.map((item) => (
              <NavLink key={item} icon={Icons.Folder} label={item} />
            ))}
          </QUI.List>
        </QUI.ListSection>
      ))}
    </>
  );
}
