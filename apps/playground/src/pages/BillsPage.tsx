import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { AcmeShell } from "../examples/acme/shell";
import { AdminNavigation } from "../examples/acme/admin-nav";
import { aed, formatDay } from "../examples/acme/claims";
import { bills as allBills, claims, people, sum, syncColor, today, transactions, type Bill, type BillStatus, type Sync } from "../examples/acme/spend-data";

/**
 * Bills and accounting in the Acme shell, as three tabs: a bills inbox (draft → approval → scheduled → paid)
 * with an upload flow and a bill drawer; the month-end close checklist, whose data-driven tasks tick themselves
 * off; and the accounting sync log with "Fix and resync". Reuses Stepper, Timeline, UploadArea and
 * ReceiptPreview. Only qui components — no className or style anywhere in this file.
 */

const tabs = [
  { value: "bills", label: "Bills" },
  { value: "close", label: "Month-end close" },
  { value: "sync", label: "Accounting sync" },
] as const;
type Tab = (typeof tabs)[number]["value"];

const statusColor = { Draft: "grey", "Awaiting approval": "yellow", Scheduled: "indigo", Paid: "emerald" } as const;
const billViews: { value: string; label: string; test: (b: Bill) => boolean }[] = [
  { value: "awaiting", label: "Awaiting approval", test: (b) => b.status === "Awaiting approval" },
  { value: "draft", label: "Drafts", test: (b) => b.status === "Draft" },
  { value: "scheduled", label: "Scheduled", test: (b) => b.status === "Scheduled" },
  { value: "paid", label: "Paid", test: (b) => b.status === "Paid" },
  { value: "all", label: "All bills", test: () => true },
];
const billCategories = ["Rent", "Utilities", "Professional fees", "Logistics", "Software", "Office"];
const steps = [{ label: "Draft" }, { label: "Approval" }, { label: "Scheduled" }, { label: "Paid" }];
const stepOf: Record<BillStatus, number> = { Draft: 0, "Awaiting approval": 1, Scheduled: 3, Paid: 4 };
const daysUntil = (iso: string) => Math.round((new Date(iso).getTime() - today.getTime()) / 86400_000);
const isOverdue = (b: Bill) => b.status !== "Paid" && daysUntil(b.dueOn) < 0;
const plusDays = (n: number) => new Date(today.getTime() + n * 86400_000).toISOString();

function readHash() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  const tab = params.get("view");
  return tabs.some((t) => t.value === tab) ? (tab as Tab) : "bills";
}

/** The bill's history so far, then what's still to come. */
function billTimeline(bill: Bill): QUI.TimelineItem[] {
  const items: QUI.TimelineItem[] = [{ title: `Uploaded by ${bill.owner.name}`, time: formatDay(bill.issuedOn), description: bill.file }];
  if (bill.status === "Draft") return [...items, { title: "Submit for approval", time: "Now", tone: "current" }, { title: "Payment", tone: "pending" }];
  items.push(
    bill.status === "Awaiting approval" ? { title: `Waiting for ${bill.approver.name}`, time: "Now", tone: "current" } : { title: `Approved by ${bill.approver.name}`, time: formatDay(plusDays(daysUntil(bill.issuedOn) + 2)) }
  );
  if (bill.status === "Awaiting approval") return [...items, { title: "Payment", tone: "pending" }];
  items.push({ title: `Payment scheduled for ${formatDay(bill.payOn!)}`, time: formatDay(plusDays(daysUntil(bill.issuedOn) + 3)), description: "From Emirates NBD operating ••4410" });
  items.push(bill.status === "Paid" ? { title: "Paid", time: formatDay(bill.payOn!), description: "Bank transfer, reference ACME-" + bill.id } : { title: "Payment goes out", time: formatDay(bill.payOn!), tone: "current" });
  return items;
}

function BillDrawer({ bill, onClose, onAdvance }: { bill: Bill | null; onClose: () => void; onAdvance: (bill: Bill, payOn?: string) => void }) {
  const [payOn, setPayOn] = React.useState("");
  React.useEffect(() => {
    if (bill) setPayOn((bill.dueOn < today.toISOString() ? plusDays(1) : bill.dueOn).slice(0, 10));
  }, [bill]);
  const next: Partial<Record<BillStatus, string>> = { Draft: "Submit for approval", "Awaiting approval": "Approve and schedule", Scheduled: "Pay now" };
  return (
    <QUI.Drawer open={bill != null} onOpenChange={(open) => (open ? null : onClose())}>
      <QUI.DrawerContent aria-label="Bill details">
        {bill ? (
          <QUI.Stack height="full">
            <QUI.Box grow overflow="auto" padding="4">
              <QUI.Stack gap="5">
                <QUI.Stack gap="1">
                  <QUI.Inline gap="2" wrap={false}>
                    <QUI.TagCell label={bill.status} color={statusColor[bill.status]} />
                    {isOverdue(bill) ? <QUI.TagCell label={`${-daysUntil(bill.dueOn)} days overdue`} color="crimson" /> : null}
                  </QUI.Inline>
                  <QUI.DrawerTitle>{bill.vendor}</QUI.DrawerTitle>
                  <QUI.Heading level={3} size={3} weight="semibold">
                    {aed.format(bill.amount)}
                  </QUI.Heading>
                  <QUI.DrawerDescription>
                    {bill.number} · due {formatDay(bill.dueOn)}
                  </QUI.DrawerDescription>
                </QUI.Stack>
                <QUI.Stepper steps={steps} current={stepOf[bill.status]} aria-label="Bill progress" />
                <QUI.ReceiptPreview file={{ name: bill.file, kind: "pdf", detail: `Invoice ${bill.number}` }} onView={() => {}} />
                <QUI.Grid columns={2} gap="4">
                  <QUI.Property icon={Icons.Tag} label="Category">
                    <QUI.Text size="xs">{bill.category}</QUI.Text>
                  </QUI.Property>
                  <QUI.Property icon={Icons.RefreshCw} label="Accounting">
                    <QUI.TagCell label={bill.sync} color={syncColor[bill.sync]} />
                  </QUI.Property>
                  <QUI.Property icon={Icons.UserRound} label="Owner">
                    <QUI.UserCell name={bill.owner.name} />
                  </QUI.Property>
                  <QUI.Property icon={Icons.UserCheck} label="Approver">
                    <QUI.UserCell name={bill.approver.name} />
                  </QUI.Property>
                </QUI.Grid>
                <QUI.Stack gap="2">
                  <QUI.Text size="xs" weight="semibold" color="secondary">
                    History
                  </QUI.Text>
                  <QUI.Timeline items={billTimeline(bill)} />
                </QUI.Stack>
              </QUI.Stack>
            </QUI.Box>
            {next[bill.status] ? (
              <QUI.Box border="subtle" borderEdge="top" padding="4">
                <QUI.Stack gap="3">
                  {bill.status === "Awaiting approval" ? (
                    <QUI.InputField label="Pay on" type="date" value={payOn} min={today.toISOString().slice(0, 10)} onChange={(e) => setPayOn(e.target.value)} hint="Paid from Emirates NBD operating ••4410." />
                  ) : null}
                  <QUI.Inline justify="end" gap="2">
                    <QUI.Button variant="secondary" label="Close" onClick={onClose} />
                    <QUI.Button
                      variant="primary"
                      icon={<QUI.Icon icon={bill.status === "Scheduled" ? Icons.Send : Icons.Check} />}
                      label={next[bill.status]!}
                      disabled={bill.status === "Awaiting approval" && !payOn}
                      onClick={() => onAdvance(bill, bill.status === "Awaiting approval" ? `${payOn}T00:00:00.000Z` : undefined)}
                    />
                  </QUI.Inline>
                </QUI.Stack>
              </QUI.Box>
            ) : null}
          </QUI.Stack>
        ) : null}
      </QUI.DrawerContent>
    </QUI.Drawer>
  );
}

type BillDraft = { vendor: string; number: string; amount: string; dueOn: string; category: string };

/** "Upload bill": drop the PDF, check what was read off it, then save as a draft or send for approval. */
function UploadBillDialog({ open, onOpenChange, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; onSave: (bill: Bill) => void }) {
  const [step, setStep] = React.useState(0);
  const [file, setFile] = React.useState<QUI.UploadAreaFile | null>(null);
  const [draft, setDraft] = React.useState<BillDraft>({ vendor: "", number: "", amount: "", dueOn: "", category: "" });
  const [submitted, setSubmitted] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    if (open) {
      setStep(0);
      setFile(null);
      setSubmitted(false);
    }
    return () => window.clearInterval(timer.current);
  }, [open]);
  const set = (patch: Partial<BillDraft>) => setDraft((d) => ({ ...d, ...patch }));

  /** Pretend upload and read: fills the progress bar, then guesses the details from the file name. */
  const upload = (f: File) => {
    window.clearInterval(timer.current);
    setFile({ id: `${f.name}-${Date.now()}`, name: f.name, size: f.size, progress: 0 });
    timer.current = window.setInterval(() => {
      setFile((current) => {
        if (!current) return current;
        const progress = Math.min(100, (current.progress ?? 0) + 25);
        if (progress === 100) {
          window.clearInterval(timer.current);
          const words = f.name.replace(/\.[a-z]+$/i, "").split(/[-_ ]+/).filter((w) => !/^\d+$/.test(w));
          setDraft({
            vendor: words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            number: `INV-2026${String(f.size % 9000 + 1000)}`,
            amount: "",
            dueOn: plusDays(30).slice(0, 10),
            category: "",
          });
          setStep(1);
        }
        return { ...current, progress };
      });
    }, 160);
  };

  const errors: Record<string, string | null> = {
    vendor: !draft.vendor.trim() ? "Who is the bill from?" : null,
    number: !draft.number.trim() ? "Enter the invoice number." : null,
    amount: !(Number(draft.amount) > 0) ? "Enter the amount due." : null,
    dueOn: !draft.dueOn ? "Choose the due date." : null,
    category: !draft.category ? "Choose a category." : null,
  };
  const show = (key: string) => (submitted ? (errors[key] ?? undefined) : undefined);
  const save = (status: BillStatus) => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    const owner = people.find((p) => p.name === "Ranu Perera")!;
    onSave({
      id: 5700 + (Date.now() % 1000),
      number: draft.number.trim(),
      vendor: draft.vendor.trim(),
      category: draft.category,
      amount: Number(draft.amount),
      issuedOn: today.toISOString(),
      dueOn: `${draft.dueOn}T00:00:00.000Z`,
      status,
      owner,
      approver: people[4]!,
      sync: status === "Draft" ? "Excluded" : "Ready",
      file: file!.name,
    });
  };

  return (
    <QUI.Dialog open={open} onOpenChange={onOpenChange}>
      <QUI.DialogContent size="sm">
        <QUI.Stack>
          <QUI.Box padding="5">
            <QUI.Stack gap="5">
              <QUI.Stack gap="1">
                <QUI.DialogTitle>Upload bill</QUI.DialogTitle>
                <QUI.DialogDescription>We read the supplier, amount and due date off the PDF. Check them before saving.</QUI.DialogDescription>
              </QUI.Stack>
              <QUI.Stepper steps={[{ label: "Upload" }, { label: "Check details" }]} current={step} onStepClick={setStep} aria-label="Upload steps" />
              {step === 0 ? (
                <QUI.UploadArea
                  accept="application/pdf,image/*"
                  maxSize={20 * 1024 * 1024}
                  label="Drop the invoice here, or choose it"
                  hint="PDF, JPG or PNG up to 20 MB"
                  onFiles={(files) => upload(files[0]!)}
                  files={file ? [file] : []}
                  onRemove={() => setFile(null)}
                />
              ) : (
                <>
                  {file ? <QUI.ReceiptPreview file={{ name: file.name, kind: "pdf", detail: "Read just now" }} onReplace={() => setStep(0)} /> : null}
                  <QUI.InputField label="Supplier" value={draft.vendor} onChange={(e) => set({ vendor: e.target.value })} error={show("vendor")} />
                  <QUI.Grid columns={2} gap="3">
                    <QUI.InputField label="Invoice number" value={draft.number} onChange={(e) => set({ number: e.target.value })} error={show("number")} />
                    <QUI.InputField label="Amount due (AED)" inputMode="decimal" value={draft.amount} onChange={(e) => set({ amount: e.target.value.replace(/[^\d.]/g, "") })} error={show("amount")} />
                    <QUI.InputField label="Due date" type="date" value={draft.dueOn} onChange={(e) => set({ dueOn: e.target.value })} error={show("dueOn")} />
                    <QUI.SelectField
                      label="Category"
                      placeholder="Choose"
                      value={draft.category || null}
                      onValueChange={(value) => set({ category: String(value ?? "") })}
                      options={billCategories.map((c) => ({ value: c, label: c }))}
                      error={show("category")}
                    />
                  </QUI.Grid>
                </>
              )}
            </QUI.Stack>
          </QUI.Box>
          <QUI.Box border="subtle" borderEdge="top" padding="4">
            <QUI.Inline justify="end" gap="2">
              <QUI.DialogClose render={<QUI.Button variant="secondary" label="Cancel" />} />
              {step === 1 ? (
                <>
                  <QUI.Button variant="secondary" label="Save as draft" onClick={() => save("Draft")} />
                  <QUI.Button variant="primary" label="Submit for approval" onClick={() => save("Awaiting approval")} />
                </>
              ) : null}
            </QUI.Inline>
          </QUI.Box>
        </QUI.Stack>
      </QUI.DialogContent>
    </QUI.Dialog>
  );
}

function BillsView({ bills, setBills, uploading, setUploading }: { bills: Bill[]; setBills: React.Dispatch<React.SetStateAction<Bill[]>>; uploading: boolean; setUploading: (open: boolean) => void }) {
  const [view, setView] = React.useState("awaiting");
  const [query, setQuery] = React.useState("");
  const [openId, setOpenId] = React.useState<number | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const matching = bills.filter((b) => !q || b.vendor.toLowerCase().includes(q) || b.number.toLowerCase().includes(q));
  const rows = matching.filter(billViews.find((v) => v.value === view)!.test).sort((a, b) => a.dueOn.localeCompare(b.dueOn));
  const overdue = bills.filter(isOverdue);

  const advance = (bill: Bill, payOn?: string) => {
    const status: BillStatus = bill.status === "Draft" ? "Awaiting approval" : bill.status === "Awaiting approval" ? "Scheduled" : "Paid";
    setBills((prev) => prev.map((b) => (b.id === bill.id ? { ...b, status, payOn: status === "Paid" ? today.toISOString() : (payOn ?? b.payOn), sync: status === "Paid" ? "Ready" : b.sync === "Excluded" ? "Ready" : b.sync } : b)));
    setNotice(
      status === "Awaiting approval"
        ? `${bill.vendor} sent to ${bill.approver.name} for approval.`
        : status === "Scheduled"
          ? `Approved. ${aed.format(bill.amount)} to ${bill.vendor} goes out on ${formatDay(payOn!)}.`
          : `Paid ${aed.format(bill.amount)} to ${bill.vendor}.`
    );
    setOpenId(null);
  };

  return (
    <>
      {overdue.length > 0 ? (
        <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
          <QUI.Banner variant="warning">
            {overdue.length} bills are overdue, {aed.format(sum(overdue.map((b) => b.amount)))} in all. The oldest is {overdue.reduce((a, b) => (a.dueOn < b.dueOn ? a : b)).vendor}.
          </QUI.Banner>
        </QUI.Box>
      ) : null}
      <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
        <QUI.Tabs variant="card" value={view} onValueChange={(value) => setView(String(value))}>
          <QUI.TabsList aria-label="Bill status">
            {billViews.map((v) => (
              <QUI.Tab key={v.value} value={v.value} label={v.label} count={matching.filter(v.test).length} />
            ))}
          </QUI.TabsList>
        </QUI.Tabs>
      </QUI.Box>
      <QUI.Inline gap="2" paddingX="4" paddingBottom="3">
        <QUI.Box width="2xs">
          <QUI.Input aria-label="Search bills" placeholder="Search supplier or invoice…" value={query} onChange={(e) => setQuery(e.target.value)} startSlot={<QUI.Icon icon={Icons.Search} tint="placeholder" />} />
        </QUI.Box>
      </QUI.Inline>
      {notice ? (
        <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
          <QUI.Banner variant="success" onDismiss={() => setNotice(null)}>
            {notice}
          </QUI.Banner>
        </QUI.Box>
      ) : null}
      <QUI.Box grow overflow="hidden" paddingX="4" paddingBottom="4">
        <QUI.Table aria-label="Bills">
          <QUI.TableHeader>
            <QUI.TableRow>
              <QUI.TableHead>Supplier</QUI.TableHead>
              <QUI.TableHead>Category</QUI.TableHead>
              <QUI.TableHead align="end">Amount</QUI.TableHead>
              <QUI.TableHead>Due</QUI.TableHead>
              <QUI.TableHead>Status</QUI.TableHead>
              <QUI.TableHead>Pay on</QUI.TableHead>
              <QUI.TableHead>Owner</QUI.TableHead>
              <QUI.TableHead>Accounting</QUI.TableHead>
            </QUI.TableRow>
          </QUI.TableHeader>
          <QUI.TableBody>
            {rows.map((b) => (
              <QUI.TableRow key={b.id}>
                <QUI.TableCell>
                  <QUI.TextCell primary={b.vendor} secondary={b.number} tone="link" onClick={() => setOpenId(b.id)} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TextCell primary={b.category} />
                </QUI.TableCell>
                <QUI.TableCell align="end">
                  <QUI.MoneyCell amount={b.amount} currency="AED" display="code" locale="en-US" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.DateCell value={b.dueOn} locale="en-GB" tone={isOverdue(b) ? "danger" : b.status !== "Paid" && daysUntil(b.dueOn) <= 7 ? "warning" : "default"} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TagCell label={b.status} color={statusColor[b.status]} />
                </QUI.TableCell>
                <QUI.TableCell>{b.payOn ? <QUI.DateCell value={b.payOn} locale="en-GB" /> : <QUI.EmptyCell />}</QUI.TableCell>
                <QUI.TableCell>
                  <QUI.UserCell name={b.owner.name} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TagCell label={b.sync} color={syncColor[b.sync]} />
                </QUI.TableCell>
              </QUI.TableRow>
            ))}
          </QUI.TableBody>
        </QUI.Table>
      </QUI.Box>
      <BillDrawer bill={bills.find((b) => b.id === openId) ?? null} onClose={() => setOpenId(null)} onAdvance={advance} />
      <UploadBillDialog
        open={uploading}
        onOpenChange={setUploading}
        onSave={(bill) => {
          setBills((prev) => [bill, ...prev]);
          setUploading(false);
          setView(bill.status === "Draft" ? "draft" : "awaiting");
          setNotice(bill.status === "Draft" ? `Saved ${bill.vendor} as a draft.` : `${bill.vendor} sent to ${bill.approver.name} for approval.`);
        }}
      />
    </>
  );
}

/** A record in the sync log: a card payment or a bill, with its sync state and, when it failed, why. */
type SyncRecord = { key: string; kind: "Card payment" | "Bill"; title: string; reference: string; amount: number; date: string; sync: Sync; problem?: Problem };
type Problem = { message: string; fix: string; options: string[] };
const problems: Problem[] = [
  { message: "No account mapped for this category", fix: "Post to account", options: ["6100 Travel", "6200 Meals and entertainment", "6300 Software subscriptions", "6400 Advertising"] },
  { message: "Tax rate missing", fix: "Tax rate", options: ["Standard rate 5%", "Zero rated", "Exempt", "Reverse charge"] },
  { message: "Supplier not found in Xero", fix: "Supplier", options: ["Create a new supplier", "Match to an existing supplier"] },
];

function syncRecords(bills: Bill[]): SyncRecord[] {
  const fromCards = transactions.slice(0, 160).map<SyncRecord>((t) => ({
    key: `t${t.id}`,
    kind: "Card payment",
    title: t.merchant,
    reference: `#${t.id} · ${t.cardholder.name}`,
    amount: t.amount,
    date: t.date,
    sync: t.sync,
    problem: t.sync === "Failed" ? problems[t.id % problems.length] : undefined,
  }));
  const fromBills = bills
    .filter((b) => b.sync !== "Excluded")
    .map<SyncRecord>((b) => ({ key: `b${b.id}`, kind: "Bill", title: b.vendor, reference: b.number, amount: b.amount, date: b.issuedOn, sync: b.sync, problem: b.sync === "Failed" ? problems[2] : undefined }));
  return [...fromCards, ...fromBills].sort((a, b) => b.date.localeCompare(a.date));
}

const syncViews: { value: string; label: string; test: (r: SyncRecord) => boolean }[] = [
  { value: "failed", label: "Failed", test: (r) => r.sync === "Failed" },
  { value: "ready", label: "Ready to sync", test: (r) => r.sync === "Ready" },
  { value: "synced", label: "Synced", test: (r) => r.sync === "Synced" },
  { value: "all", label: "All records", test: (r) => r.sync !== "Excluded" },
];

function SyncView({ records, setSync }: { records: SyncRecord[]; setSync: (keys: string[], sync: Sync) => void }) {
  const [view, setView] = React.useState("failed");
  const [fixing, setFixing] = React.useState<SyncRecord | null>(null);
  const [choice, setChoice] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [lastSync, setLastSync] = React.useState("12 minutes ago");
  const rows = records.filter(syncViews.find((v) => v.value === view)!.test);
  const ready = records.filter((r) => r.sync === "Ready");

  const syncNow = () => {
    setSyncing(true);
    window.setTimeout(() => {
      setSync(ready.map((r) => r.key), "Synced");
      setSyncing(false);
      setLastSync("just now");
      setNotice(`Synced ${ready.length} records to Xero.`);
    }, 900);
  };

  return (
    <>
      <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
        <QUI.Box border="subtle" radius="lg" padding="4" background="layer-2">
          <QUI.Inline justify="between" gap="3">
            <QUI.Inline gap="3" wrap={false}>
              <QUI.Icon icon={Icons.PlugZap} size="lg" tint="secondary" />
              <QUI.Stack gap="0.5">
                <QUI.Text size="sm" weight="semibold" color="primary">
                  Connected to Xero · Acme Trading LLC
                </QUI.Text>
                <QUI.Text size="xs" color="secondary">
                  Last synced {lastSync}. Card payments post nightly; bills post when they're approved.
                </QUI.Text>
              </QUI.Stack>
            </QUI.Inline>
            <QUI.Button
              variant="primary"
              icon={<QUI.Icon icon={Icons.RefreshCw} />}
              loading={syncing}
              label={syncing ? "Syncing…" : `Sync ${ready.length} now`}
              disabled={ready.length === 0}
              onClick={syncNow}
            />
          </QUI.Inline>
        </QUI.Box>
      </QUI.Box>
      <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
        <QUI.Tabs variant="card" value={view} onValueChange={(value) => setView(String(value))}>
          <QUI.TabsList aria-label="Sync status">
            {syncViews.map((v) => (
              <QUI.Tab key={v.value} value={v.value} label={v.label} count={records.filter(v.test).length} />
            ))}
          </QUI.TabsList>
        </QUI.Tabs>
      </QUI.Box>
      {notice ? (
        <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
          <QUI.Banner variant="success" onDismiss={() => setNotice(null)}>
            {notice}
          </QUI.Banner>
        </QUI.Box>
      ) : null}
      <QUI.Box grow overflow="hidden" paddingX="4" paddingBottom="4">
        <QUI.Table aria-label="Sync log">
          <QUI.TableHeader>
            <QUI.TableRow>
              <QUI.TableHead>Record</QUI.TableHead>
              <QUI.TableHead>Type</QUI.TableHead>
              <QUI.TableHead align="end">Amount</QUI.TableHead>
              <QUI.TableHead>Date</QUI.TableHead>
              <QUI.TableHead>Status</QUI.TableHead>
              <QUI.TableHead>Problem</QUI.TableHead>
              <QUI.TableHead align="end">Action</QUI.TableHead>
            </QUI.TableRow>
          </QUI.TableHeader>
          <QUI.TableBody>
            {rows.length === 0 ? (
              <QUI.TableRow>
                <QUI.TableCell colSpan={7} align="center">
                  <QUI.Stack gap="2" align="center" paddingY="8">
                    <QUI.Icon icon={Icons.CircleCheck} size="lg" tint="placeholder" />
                    <QUI.Text weight="medium" color="primary">
                      Nothing here
                    </QUI.Text>
                    <QUI.Text size="xs" color="tertiary">
                      {view === "failed" ? "Every record reached Xero." : "No records in this state."}
                    </QUI.Text>
                  </QUI.Stack>
                </QUI.TableCell>
              </QUI.TableRow>
            ) : null}
            {rows.map((r) => (
              <QUI.TableRow key={r.key}>
                <QUI.TableCell>
                  <QUI.TextCell primary={r.title} secondary={r.reference} />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TextCell primary={r.kind} />
                </QUI.TableCell>
                <QUI.TableCell align="end">
                  <QUI.MoneyCell amount={r.amount} currency="AED" display="code" locale="en-US" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.DateCell value={r.date} format="relative" now={today} locale="en-US" />
                </QUI.TableCell>
                <QUI.TableCell>
                  <QUI.TagCell label={r.sync} color={syncColor[r.sync]} />
                </QUI.TableCell>
                <QUI.TableCell>{r.problem ? <QUI.TextCell primary={r.problem.message} /> : <QUI.EmptyCell />}</QUI.TableCell>
                <QUI.TableCell align="end">
                  {r.sync === "Failed" ? (
                    <QUI.Button
                      size="sm"
                      variant="secondary"
                      label="Fix and resync"
                      onClick={() => {
                        setFixing(r);
                        setChoice(null);
                      }}
                    />
                  ) : null}
                </QUI.TableCell>
              </QUI.TableRow>
            ))}
          </QUI.TableBody>
        </QUI.Table>
      </QUI.Box>
      <QUI.Dialog open={fixing != null} onOpenChange={(open) => (open ? null : setFixing(null))}>
        <QUI.DialogContent size="xs">
          {fixing?.problem ? (
            <QUI.Stack>
              <QUI.Box padding="5">
                <QUI.Stack gap="4">
                  <QUI.Stack gap="1">
                    <QUI.DialogTitle>Fix and resync</QUI.DialogTitle>
                    <QUI.DialogDescription>
                      {fixing.title}, {aed.format(fixing.amount)} ({fixing.reference})
                    </QUI.DialogDescription>
                  </QUI.Stack>
                  <QUI.Banner variant="danger">Xero said: {fixing.problem.message}.</QUI.Banner>
                  <QUI.SelectField label={fixing.problem.fix} placeholder="Choose" value={choice} onValueChange={(value) => setChoice(value == null ? null : String(value))} options={fixing.problem.options.map((o) => ({ value: o, label: o }))} />
                </QUI.Stack>
              </QUI.Box>
              <QUI.Box border="subtle" borderEdge="top" padding="4">
                <QUI.Inline justify="end" gap="2">
                  <QUI.DialogClose render={<QUI.Button variant="secondary" label="Cancel" />} />
                  <QUI.Button
                    variant="primary"
                    icon={<QUI.Icon icon={Icons.RefreshCw} />}
                    label="Resync"
                    disabled={!choice}
                    onClick={() => {
                      setSync([fixing.key], "Synced");
                      setNotice(`${fixing.title} synced with "${choice}".`);
                      setFixing(null);
                    }}
                  />
                </QUI.Inline>
              </QUI.Box>
            </QUI.Stack>
          ) : null}
        </QUI.DialogContent>
      </QUI.Dialog>
    </>
  );
}

type Task = { id: string; title: string; detail: string; owner: string; due: string; done: boolean; auto?: boolean; action?: { label: string; href: string } };

function CloseView({ bills, records }: { bills: Bill[]; records: SyncRecord[] }) {
  const [ticked, setTicked] = React.useState<Set<string>>(() => new Set(["bank-enbd", "fx"]));
  const [locked, setLocked] = React.useState(false);
  const missing = transactions.filter((t) => t.receipt === "Missing").length;
  const pendingClaims = claims.filter((c) => c.status === "Awaiting approval").length;
  const pendingBills = bills.filter((b) => b.status === "Awaiting approval" || b.status === "Draft").length;
  const failed = records.filter((r) => r.sync === "Failed").length;
  const manual = (id: string, title: string, detail: string, owner: string, due: string): Task => ({ id, title, detail, owner, due, done: ticked.has(id) });
  const auto = (id: string, title: string, count: number, detail: string, owner: string, due: string, action: Task["action"]): Task => ({
    id,
    title,
    detail: count === 0 ? "All done." : detail,
    owner,
    due,
    done: count === 0,
    auto: true,
    action: count === 0 ? undefined : action,
  });

  const groups: { label: string; tasks: Task[] }[] = [
    {
      label: "Collect",
      tasks: [
        auto("receipts", "Collect missing receipts", missing, `${missing} card payments still have no receipt.`, "Cardholders", "25 Oct", { label: "Review", href: "#/examples/tables/transactions?view=missing" }),
        auto("claims", "Approve pending reimbursements", pendingClaims, `${pendingClaims} claims are waiting for a decision.`, "Managers", "27 Oct", { label: "Review", href: "#/examples/tables/reimbursements" }),
        auto("bills", "Approve this month's bills", pendingBills, `${pendingBills} bills are drafts or waiting for approval.`, "Mashood Pookkadan", "28 Oct", { label: "Review", href: "#/examples/tables/bills" }),
      ],
    },
    {
      label: "Reconcile",
      tasks: [
        manual("bank-enbd", "Reconcile Emirates NBD operating account", "Statement balance matches the ledger.", "Mashood Pookkadan", "29 Oct"),
        manual("bank-cards", "Reconcile the card settlement account", "Card payments match the issuer's settlement report.", "Mashood Pookkadan", "29 Oct"),
        manual("fx", "Revalue USD balances", "At the 31 Oct closing rate.", "Saif Kapadia", "31 Oct"),
        auto("sync", "Fix failed accounting syncs", failed, `${failed} records didn't reach Xero.`, "Mashood Pookkadan", "30 Oct", { label: "Fix", href: "#/examples/tables/bills?view=sync" }),
      ],
    },
    {
      label: "Report",
      tasks: [
        manual("accruals", "Accrue unpaid bills", "Bills received in October but paid in November.", "Mashood Pookkadan", "31 Oct"),
        manual("budgets", "Review budget variances", "Explain any department more than 10% over.", "Department owners", "31 Oct"),
      ],
    },
  ];
  const all = groups.flatMap((g) => g.tasks);
  const done = all.filter((t) => t.done).length;

  return (
    <QUI.Box grow overflow="auto" paddingX="4" paddingBottom="4">
      <QUI.Stack gap="4">
        <QUI.Box border="subtle" radius="lg" padding="4" background="layer-2">
          <QUI.Stack gap="3">
            <QUI.Inline justify="between" gap="3">
              <QUI.Stack gap="0.5">
                <QUI.Heading level={2} size={4} weight="semibold">
                  October 2026 close
                </QUI.Heading>
                <QUI.Text size="xs" color="secondary">
                  {locked ? "October is locked. Nothing dated in October can be changed." : `Target: lock the books by 3 Nov. ${all.length - done} tasks left.`}
                </QUI.Text>
              </QUI.Stack>
              <QUI.Button
                variant={locked ? "secondary" : "primary"}
                icon={<QUI.Icon icon={locked ? Icons.LockOpen : Icons.Lock} />}
                label={locked ? "Unlock October" : "Lock October"}
                disabled={!locked && done < all.length}
                onClick={() => setLocked((l) => !l)}
              />
            </QUI.Inline>
            <QUI.LinearProgress value={(done / all.length) * 100} variant={done === all.length ? "success" : "brand"} label={`${done} of ${all.length} tasks done`} showValue={false} />
          </QUI.Stack>
        </QUI.Box>
        {groups.map((group) => (
          <QUI.Stack key={group.label} gap="2">
            <QUI.Text size="xs" weight="semibold" color="secondary">
              {group.label}
            </QUI.Text>
            <QUI.Box border="subtle" radius="lg" overflow="hidden">
              {group.tasks.map((task, i) => (
                <QUI.Box key={task.id} paddingX="4" paddingY="3" border={i === 0 ? undefined : "subtle"} borderEdge="top">
                  <QUI.Inline justify="between" gap="3" wrap={false}>
                    {task.auto ? (
                      <QUI.Inline gap="2" align="start" wrap={false}>
                        <QUI.Icon icon={task.done ? Icons.CircleCheck : Icons.CircleDashed} tint={task.done ? "success" : "tertiary"} size="md" />
                        <QUI.Stack gap="0.5">
                          <QUI.Text size="sm" weight="medium" color="primary">
                            {task.title}
                          </QUI.Text>
                          <QUI.Text size="xs" color="secondary">
                            {task.detail} {task.done ? "" : "Ticks itself off when done."}
                          </QUI.Text>
                        </QUI.Stack>
                      </QUI.Inline>
                    ) : (
                      <QUI.CheckboxField
                        size="md"
                        label={task.title}
                        description={task.detail}
                        checked={task.done}
                        disabled={locked}
                        onCheckedChange={(checked) =>
                          setTicked((prev) => {
                            const next = new Set(prev);
                            checked ? next.add(task.id) : next.delete(task.id);
                            return next;
                          })
                        }
                      />
                    )}
                    <QUI.Inline gap="3" wrap={false}>
                      <QUI.Stack gap="0.5" align="end">
                        <QUI.Text size="xs" color="primary">
                          {task.owner}
                        </QUI.Text>
                        <QUI.Text variant="caption" size="md" color="tertiary">
                          Due {task.due}
                        </QUI.Text>
                      </QUI.Stack>
                      {task.action ? <QUI.AnchorButton size="sm" href={task.action.href} label={task.action.label} /> : null}
                    </QUI.Inline>
                  </QUI.Inline>
                </QUI.Box>
              ))}
            </QUI.Box>
          </QUI.Stack>
        ))}
      </QUI.Stack>
    </QUI.Box>
  );
}

/** Playground page: bills, the month-end close and the accounting sync log. `?view=close` / `?view=sync` open a tab. */
export function BillsPage() {
  const [tab, setTab] = React.useState<Tab>(readHash);
  const [bills, setBills] = React.useState(allBills);
  const [syncOverrides, setSyncOverrides] = React.useState<Record<string, Sync>>({});
  const [uploading, setUploading] = React.useState(false);
  React.useEffect(() => {
    const onChange = () => setTab(readHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const records = syncRecords(bills).map((r) => (syncOverrides[r.key] ? { ...r, sync: syncOverrides[r.key]!, problem: syncOverrides[r.key] === "Failed" ? r.problem : undefined } : r));
  const setSync = (keys: string[], sync: Sync) => setSyncOverrides((prev) => ({ ...prev, ...Object.fromEntries(keys.map((k) => [k, sync])) }));
  const dueSoon = bills.filter((b) => b.status !== "Paid" && daysUntil(b.dueOn) >= 0 && daysUntil(b.dueOn) <= 7);

  return (
    <AcmeShell
      current="Bills"
      navigation={<AdminNavigation open="Spend" />}
      header={
        <QUI.Inline justify="between" gap="4" paddingX="4" paddingY="3" wrap={false}>
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Icon icon={Icons.FileText} size="lg" tint="secondary" />
            <QUI.Heading level={1} size={5} weight="semibold">
              Bills
            </QUI.Heading>
            <QUI.Badge size="xs" variant="warning" label={`${aed.format(sum(dueSoon.map((b) => b.amount)))} due in 7 days`} />
          </QUI.Inline>
          <QUI.Button variant="primary" icon={<QUI.Icon icon={Icons.Upload} />} label="Upload bill" onClick={() => setUploading(true)} />
        </QUI.Inline>
      }
    >
      <QUI.Box paddingX="4" paddingBottom="3" shrink={false}>
        <QUI.Tabs variant="underline" value={tab} onValueChange={(value) => setTab(value as Tab)}>
          <QUI.TabsList aria-label="Bills and accounting">
            {tabs.map((t) => (
              <QUI.Tab key={t.value} value={t.value} label={t.label} count={t.value === "sync" ? records.filter((r) => r.sync === "Failed").length || undefined : undefined} />
            ))}
          </QUI.TabsList>
        </QUI.Tabs>
      </QUI.Box>
      {tab === "bills" ? <BillsView bills={bills} setBills={setBills} uploading={uploading} setUploading={setUploading} /> : null}
      {tab === "close" ? <CloseView bills={bills} records={records} /> : null}
      {tab === "sync" ? <SyncView records={records} setSync={setSync} /> : null}
      {tab !== "bills" ? <UploadBillDialog open={uploading} onOpenChange={setUploading} onSave={(bill) => { setBills((prev) => [bill, ...prev]); setUploading(false); setTab("bills"); }} /> : null}
    </AcmeShell>
  );
}
