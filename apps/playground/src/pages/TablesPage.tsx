import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { adminItems } from "../examples/acme/admin-nav";
import { PlaceholderPage } from "../examples/acme/placeholder";
import { ApprovalRequestsPage } from "./ApprovalRequestsPage";
import { BalanceLogsPage } from "./BalanceLogsPage";
import { BillsPage } from "./BillsPage";
import { BudgetsPage } from "./BudgetsPage";
import { CardsPage } from "./CardsPage";
import { MySpendPage } from "./MySpendPage";
import { PoliciesPage } from "./PoliciesPage";
import { ReimbursementsPage } from "./ReimbursementsPage";
import { SpendOverviewPage } from "./SpendOverviewPage";
import { TransactionsPage } from "./TransactionsPage";
import { TravelPage } from "./TravelPage";
import { UsdAccountSummaryPage } from "./UsdAccountSummaryPage";

/** The current admin entry's slug: what follows `#/examples/tables/`, or "" for the balance logs. */
function useSlug() {
  const read = () => window.location.hash.replace(/^#\/examples\/tables\/?/, "").split("?")[0]!;
  const [slug, setSlug] = React.useState(read);
  React.useEffect(() => {
    const onChange = () => setSlug(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return slug;
}

/** The table screens, switched by the admin sidebar: balance logs, approval requests, the USD account summary, and an empty screen for every other entry. */
export function TablesPage() {
  const slug = useSlug();
  if (slug === "approval-requests") return <ApprovalRequestsPage />;
  if (slug === "usd-account-summary") return <UsdAccountSummaryPage />;
  if (slug === "spend-overview") return <SpendOverviewPage />;
  if (slug === "transactions") return <TransactionsPage />;
  if (slug === "cards") return <CardsPage />;
  if (slug === "budgets") return <BudgetsPage />;
  if (slug === "my-spend") return <MySpendPage />;
  if (slug === "reimbursements") return <ReimbursementsPage />;
  if (slug === "policies") return <PoliciesPage />;
  if (slug === "bills") return <BillsPage />;
  if (slug === "travel") return <TravelPage />;
  const entry = adminItems.find((e) => e.item.slug === slug);
  return entry ? <PlaceholderPage key={slug} icon={entry.item.icon} label={entry.item.label} /> : <BalanceLogsPage />;
}
