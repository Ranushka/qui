import * as React from "react";
import * as QUI from "@qui/ui";
import * as Icons from "lucide-react";
import { merchants, mileageRate, today, type Claim, type ClaimStatus, type Person } from "./spend-data";

/**
 * Reimbursement pieces shared by "My spend" and "Reimbursements": a claim's status history, its details drawer,
 * and the "New claim" dialog with a receipt upload and a mileage calculator. Only qui components.
 */

export const aed = new Intl.NumberFormat("en-US", { style: "currency", currency: "AED", currencyDisplay: "code" });
const when = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const formatDay = (iso: string) => day.format(new Date(iso));

export const claimStatusColor = { "Awaiting approval": "yellow", Approved: "indigo", Paid: "emerald", Rejected: "crimson" } as const;
const categories = [...new Set(merchants.map((m) => m.category))];

/** The claim's path from submitted to paid: what happened so far, then the steps still to come. */
export function timelineFor(claim: Claim): QUI.TimelineItem[] {
  const submitted = new Date(claim.submittedAt);
  const later = (hours: number) => when.format(new Date(submitted.getTime() + hours * 3600_000));
  const items: QUI.TimelineItem[] = [{ title: `Submitted by ${claim.employee.name}`, time: when.format(submitted), description: claim.note ?? undefined }];
  if (claim.status === "Rejected") {
    items.push({ title: `Rejected by ${claim.approver.name}`, time: later(5), description: claim.rejection, tone: "danger" });
    return items;
  }
  items.push(
    claim.status === "Awaiting approval"
      ? { title: `Waiting for ${claim.approver.name}`, time: "Now", tone: "current" }
      : { title: `Approved by ${claim.approver.name}`, time: later(5) }
  );
  items.push(
    claim.status === "Paid"
      ? { title: "Paid to bank account ending 4410", time: later(52), description: "Included in the 9 Oct payout." }
      : { title: "Paid with the next payout", time: claim.status === "Approved" ? "Next Thursday" : undefined, tone: claim.status === "Approved" ? "current" : "pending" }
  );
  return items;
}

export function ClaimDrawer({
  claim,
  canDecide,
  onClose,
  onDecide,
}: {
  claim: Claim | null;
  /** Shows Approve / Reject for claims awaiting approval (the approver's view). */
  canDecide?: boolean;
  onClose: () => void;
  onDecide?: (id: number, status: ClaimStatus) => void;
}) {
  return (
    <QUI.Drawer open={claim != null} onOpenChange={(open) => (open ? null : onClose())}>
      <QUI.DrawerContent aria-label="Claim details">
        {claim ? (
          <QUI.Stack height="full">
            <QUI.Box grow overflow="auto" padding="4">
              <QUI.Stack gap="5">
                <QUI.Stack gap="1">
                  <QUI.Inline gap="2" wrap={false}>
                    <QUI.TagCell label={claim.status} color={claimStatusColor[claim.status]} />
                    <QUI.Text variant="caption" size="md" color="tertiary">
                      Claim #{claim.id}
                    </QUI.Text>
                  </QUI.Inline>
                  <QUI.DrawerTitle>{claim.title}</QUI.DrawerTitle>
                  <QUI.Heading level={3} size={3} weight="semibold">
                    {aed.format(claim.amount)}
                  </QUI.Heading>
                  <QUI.DrawerDescription>
                    {claim.kind === "Mileage" ? `${claim.km} km × AED ${mileageRate.toFixed(2)}` : claim.category} · spent {formatDay(claim.spentOn)}
                  </QUI.DrawerDescription>
                </QUI.Stack>
                <QUI.Stack gap="2">
                  <QUI.Text size="xs" weight="semibold" color="secondary">
                    Status
                  </QUI.Text>
                  <QUI.Timeline items={timelineFor(claim)} />
                </QUI.Stack>
                {claim.kind === "Expense" ? (
                  <QUI.Stack gap="2">
                    <QUI.Text size="xs" weight="semibold" color="secondary">
                      Receipt
                    </QUI.Text>
                    <QUI.ReceiptPreview file={claim.receipt ? { name: claim.receipt, kind: claim.receipt.endsWith(".jpg") ? "image" : "pdf", detail: "Uploaded with the claim" } : null} onView={() => {}} />
                  </QUI.Stack>
                ) : null}
                <QUI.Grid columns={2} gap="4">
                  <QUI.Property icon={Icons.UserRound} label="Employee">
                    <QUI.UserCell name={claim.employee.name} secondary={claim.employee.email} />
                  </QUI.Property>
                  <QUI.Property icon={Icons.UserCheck} label="Approver">
                    <QUI.UserCell name={claim.approver.name} />
                  </QUI.Property>
                </QUI.Grid>
              </QUI.Stack>
            </QUI.Box>
            {canDecide && claim.status === "Awaiting approval" && onDecide ? (
              <QUI.Box border="subtle" borderEdge="top" padding="4">
                <QUI.Inline justify="end" gap="2">
                  <QUI.Button variant="danger-outline" label="Reject" onClick={() => onDecide(claim.id, "Rejected")} />
                  <QUI.Button variant="primary" icon={<QUI.Icon icon={Icons.Check} />} label="Approve" onClick={() => onDecide(claim.id, "Approved")} />
                </QUI.Inline>
              </QUI.Box>
            ) : null}
          </QUI.Stack>
        ) : null}
      </QUI.DrawerContent>
    </QUI.Drawer>
  );
}

type Draft = { kind: "Expense" | "Mileage"; title: string; amount: string; category: string; from: string; to: string; km: string; note: string };
const emptyDraft: Draft = { kind: "Expense", title: "", amount: "", category: "", from: "", to: "", km: "", note: "" };

/** "New claim": an expense with a receipt, or a mileage trip whose amount is worked out from the distance. */
export function NewClaimDialog({
  open,
  onOpenChange,
  employee,
  approver,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Person;
  approver: Person;
  onSubmit: (claim: Claim) => void;
}) {
  const [draft, setDraft] = React.useState(emptyDraft);
  const [receipt, setReceipt] = React.useState<QUI.UploadAreaFile | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    if (open) {
      setDraft(emptyDraft);
      setReceipt(null);
      setSubmitted(false);
    }
    return () => window.clearInterval(timer.current);
  }, [open]);
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const km = Number(draft.km);
  const amount = draft.kind === "Mileage" ? Math.round(km * mileageRate * 100) / 100 : Number(draft.amount);
  const uploading = receipt != null && (receipt.progress ?? 100) < 100;
  const errors: Record<string, string | null> =
    draft.kind === "Expense"
      ? {
          title: !draft.title.trim() ? "Say what it was for." : null,
          amount: !(amount > 0) ? "Enter the amount you paid." : null,
          category: !draft.category ? "Choose a category." : null,
          receipt: !receipt ? "Add the receipt." : uploading ? "Wait for the receipt to finish uploading." : null,
        }
      : {
          from: !draft.from.trim() ? "Where did you start?" : null,
          to: !draft.to.trim() ? "Where did you go?" : null,
          km: !(km > 0) ? "Enter the distance." : km > 1000 ? "Trips over 1,000 km need a travel request instead." : null,
        };
  const show = (key: string) => (submitted ? (errors[key] ?? undefined) : undefined);

  /** Pretend upload: fills the progress bar over about a second. */
  const upload = (file: File) => {
    window.clearInterval(timer.current);
    setReceipt({ id: `${file.name}-${Date.now()}`, name: file.name, size: file.size, progress: 0 });
    timer.current = window.setInterval(() => {
      setReceipt((r) => {
        if (!r) return r;
        const progress = Math.min(100, (r.progress ?? 0) + 20);
        if (progress === 100) window.clearInterval(timer.current);
        return { ...r, progress };
      });
    }, 180);
  };

  const submit = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    const mileage = draft.kind === "Mileage";
    onSubmit({
      id: Date.now() % 100000,
      title: mileage ? `Mileage: ${draft.from.trim()} to ${draft.to.trim()}` : draft.title.trim(),
      kind: draft.kind,
      employee,
      approver,
      category: mileage ? "Transport" : draft.category,
      amount,
      km: mileage ? km : undefined,
      spentOn: today.toISOString(),
      submittedAt: today.toISOString(),
      status: "Awaiting approval",
      receipt: mileage ? null : receipt!.name,
      note: draft.note.trim() || null,
    });
  };

  return (
    <QUI.Dialog open={open} onOpenChange={onOpenChange}>
      <QUI.DialogContent size="sm">
        <QUI.Stack>
          <QUI.Box padding="5">
            <QUI.Stack gap="4">
              <QUI.Stack gap="1">
                <QUI.DialogTitle>New claim</QUI.DialogTitle>
                <QUI.DialogDescription>
                  Goes to {approver.name} for approval, then out with the next Thursday payout.
                </QUI.DialogDescription>
              </QUI.Stack>
              <QUI.RadioGroupField label="What are you claiming?" value={draft.kind} onValueChange={(value) => set({ kind: value as Draft["kind"] })}>
                <QUI.RadioGroupFieldOption value="Expense" label="Something I paid for" description="Meals, taxis, supplies — with a receipt." />
                <QUI.RadioGroupFieldOption value="Mileage" label="Mileage" description={`Driving your own car, at AED ${mileageRate.toFixed(2)} per km.`} />
              </QUI.RadioGroupField>
              {draft.kind === "Expense" ? (
                <>
                  <QUI.InputField label="What was it for?" placeholder="e.g. Client lunch, Zuma Dubai" value={draft.title} onChange={(e) => set({ title: e.target.value })} error={show("title")} />
                  <QUI.Grid columns={2} gap="3">
                    <QUI.InputField label="Amount (AED)" inputMode="decimal" value={draft.amount} onChange={(e) => set({ amount: e.target.value.replace(/[^\d.]/g, "") })} error={show("amount")} />
                    <QUI.SelectField
                      label="Category"
                      placeholder="Choose"
                      value={draft.category || null}
                      onValueChange={(value) => set({ category: String(value ?? "") })}
                      options={categories.map((c) => ({ value: c, label: c }))}
                      error={show("category")}
                    />
                  </QUI.Grid>
                  <QUI.Stack gap="1.5">
                    <QUI.Text size="sm" weight="medium" color="primary">
                      Receipt
                    </QUI.Text>
                    <QUI.UploadArea
                      accept="image/*,application/pdf"
                      maxSize={10 * 1024 * 1024}
                      hint="PDF, JPG or PNG up to 10 MB"
                      onFiles={(files) => upload(files[0]!)}
                      files={receipt ? [receipt] : []}
                      onRemove={() => setReceipt(null)}
                    />
                    {show("receipt") ? (
                      <QUI.Text variant="caption" size="md" color="danger">
                        {show("receipt")}
                      </QUI.Text>
                    ) : null}
                  </QUI.Stack>
                </>
              ) : (
                <>
                  <QUI.Grid columns={2} gap="3">
                    <QUI.InputField label="From" placeholder="Office, Business Bay" value={draft.from} onChange={(e) => set({ from: e.target.value })} error={show("from")} />
                    <QUI.InputField label="To" placeholder="Client, Jebel Ali" value={draft.to} onChange={(e) => set({ to: e.target.value })} error={show("to")} />
                  </QUI.Grid>
                  <QUI.InputField
                    label="Distance (km, round trip)"
                    inputMode="decimal"
                    value={draft.km}
                    onChange={(e) => set({ km: e.target.value.replace(/[^\d.]/g, "") })}
                    error={show("km")}
                    hint={km > 0 ? `You'll be paid ${aed.format(amount)}.` : undefined}
                  />
                </>
              )}
              <QUI.TextAreaField label="Note for your approver" placeholder="Optional" value={draft.note} onValueChange={(note) => set({ note })} />
            </QUI.Stack>
          </QUI.Box>
          <QUI.Box border="subtle" borderEdge="top" padding="4">
            <QUI.Inline justify="between" gap="2">
              <QUI.Text size="sm" weight="semibold" color="primary" tabularNums>
                {amount > 0 ? aed.format(amount) : ""}
              </QUI.Text>
              <QUI.Inline gap="2">
                <QUI.DialogClose render={<QUI.Button variant="secondary" label="Cancel" />} />
                <QUI.Button variant="primary" label="Submit claim" onClick={submit} />
              </QUI.Inline>
            </QUI.Inline>
          </QUI.Box>
        </QUI.Stack>
      </QUI.DialogContent>
    </QUI.Dialog>
  );
}
