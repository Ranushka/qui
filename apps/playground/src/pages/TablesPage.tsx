import * as React from "react";
import { ApprovalRequestsPage } from "./ApprovalRequestsPage";
import { BalanceLogsPage } from "./BalanceLogsPage";

/** The table screens, switched by the admin sidebar: `#/examples/tables` and `#/examples/tables/approval-requests`. */
export function TablesPage() {
  const read = () => window.location.hash.endsWith("/approval-requests");
  const [approvals, setApprovals] = React.useState(read);
  React.useEffect(() => {
    const onChange = () => setApprovals(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return approvals ? <ApprovalRequestsPage /> : <BalanceLogsPage />;
}
