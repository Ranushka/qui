import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AcmeShell } from "../examples/acme/shell";
import { AdminNavigation, adminItems, type AdminItem } from "../examples/acme/admin-nav";
import { ApprovalRequestsPage } from "./ApprovalRequestsPage";
import { BalanceLogsPage } from "./BalanceLogsPage";
import { UsdAccountSummaryPage } from "./UsdAccountSummaryPage";

const placeholderColumns = ["Name", "Status", "Owner", "Created", "Updated"];

/** A screen for an admin entry that has no sample data yet: its header, a toolbar and an empty table. */
function AdminPlaceholderPage({ item, section }: { item: AdminItem; section: string | null }) {
  return (
    <AcmeShell
      current={item.label}
      navigation={<AdminNavigation open={section} />}
      header={
        <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Icon icon={item.icon} size="lg" tint="secondary" />
            <QUI.Heading level={1} size={5} weight="semibold" truncate>
              {item.label}
            </QUI.Heading>
          </QUI.Inline>
          <QUI.Button variant="primary" icon={<QUI.Icon icon={Icons.Plus} />} label="Create" />
        </QUI.Inline>
      }
    >
      <QUI.Inline gap="2" paddingX="4" paddingBottom="3">
        <QUI.Box width="2xs">
          <QUI.Input aria-label={`Search ${item.label.toLowerCase()}`} placeholder="Search…" startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />} />
        </QUI.Box>
        <QUI.Button variant="secondary" icon={<QUI.Icon icon={Icons.ListFilter} />} label="Filters" />
      </QUI.Inline>
      <QUI.Box grow overflow="hidden" paddingX="4" paddingBottom="4">
        <QUI.Table aria-label={item.label}>
          <QUI.TableHeader>
            <QUI.TableRow>
              {placeholderColumns.map((column) => (
                <QUI.TableHead key={column}>{column}</QUI.TableHead>
              ))}
            </QUI.TableRow>
          </QUI.TableHeader>
          <QUI.TableBody>
            <QUI.TableRow>
              <QUI.TableCell colSpan={placeholderColumns.length} align="center">
                <QUI.Stack gap="2" align="center" paddingY="8">
                  <QUI.Icon icon={item.icon} size="lg" tint="placeholder" />
                  <QUI.Text weight="medium" color="primary">
                    No {item.label.toLowerCase()} yet
                  </QUI.Text>
                  <QUI.Text size="xs" color="tertiary">
                    Records you create show up here.
                  </QUI.Text>
                </QUI.Stack>
              </QUI.TableCell>
            </QUI.TableRow>
          </QUI.TableBody>
        </QUI.Table>
      </QUI.Box>
    </AcmeShell>
  );
}

/** The current admin entry's slug: what follows `#/examples/tables/`, or "" for the balance logs. */
function useSlug() {
  const read = () => window.location.hash.replace(/^#\/examples\/tables\/?/, "");
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
  const entry = adminItems.find((e) => e.item.slug === slug);
  return entry ? <AdminPlaceholderPage key={slug} item={entry.item} section={entry.section} /> : <BalanceLogsPage />;
}
