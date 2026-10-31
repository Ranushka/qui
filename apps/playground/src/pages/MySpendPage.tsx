import * as React from "react";
import * as QUI from "@qui/ui";
import { Icons } from "@qui/ui";
import { AcmeShell } from "../examples/acme/shell";
import { ClaimDrawer, NewClaimDialog, aed, claimStatusColor, formatDay } from "../examples/acme/claims";
import { cards, claims as allClaims, people, transactions as allTransactions, type Transaction } from "../examples/acme/spend-data";

/**
 * "My spend" — the employee's home, phone-first: a to-do list of missing receipts (each with an upload), their
 * cards with what's left, recent spend and their reimbursement claims. One column on phones, two from `lg` up.
 * Built only from qui components — no className or style anywhere in this file.
 */

const me = people.find((p) => p.name === "Ranu Perera")!;
const myApprover = people.find((p) => p.name === "Saif Kapadia")!;
const myCards = cards.filter((c) => c.holder.name === me.name && c.status !== "Cancelled").slice(0, 3);
const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function Panel({ title, count, action, children }: { title: string; count?: number; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <QUI.Box as="section" aria-label={title} border="subtle" radius="lg" padding="4" background="surface-1">
      <QUI.Stack gap="3">
        <QUI.Inline justify="between" gap="2" wrap={false}>
          <QUI.Inline gap="2" wrap={false}>
            <QUI.Text size="sm" weight="semibold" color="primary">
              {title}
            </QUI.Text>
            {count != null ? <QUI.Badge size="xs" variant={count > 0 ? "warning" : "success"} label={count} /> : null}
          </QUI.Inline>
          {action}
        </QUI.Inline>
        {children}
      </QUI.Stack>
    </QUI.Box>
  );
}

/** One line of a list: leading icon, title and detail, trailing value. Wraps on narrow screens. */
function Row({ icon, title, detail, trailing }: { icon: QUI.TimelineItem["icon"] & {}; title: React.ReactNode; detail: React.ReactNode; trailing: React.ReactNode }) {
  return (
    <QUI.Inline justify="between" gap="3" wrap={false}>
      <QUI.Inline gap="3" wrap={false}>
        <QUI.Box background="layer-3" radius="md" padding="2" shrink={false}>
          <QUI.Icon icon={icon} tint="secondary" />
        </QUI.Box>
        <QUI.Stack gap="0">
          <QUI.Text size="sm" weight="medium" color="primary" maxLines={1}>
            {title}
          </QUI.Text>
          <QUI.Text variant="caption" size="md" color="tertiary">
            {detail}
          </QUI.Text>
        </QUI.Stack>
      </QUI.Inline>
      {trailing}
    </QUI.Inline>
  );
}

/** Add one receipt: an upload that fills its progress bar, then "Attach". */
function ReceiptDialog({ transaction, onClose, onAttach }: { transaction: Transaction | null; onClose: () => void; onAttach: (id: number) => void }) {
  const [file, setFile] = React.useState<QUI.UploadAreaFile | null>(null);
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    setFile(null);
    return () => window.clearInterval(timer.current);
  }, [transaction]);
  const done = file != null && (file.progress ?? 100) >= 100;
  return (
    <QUI.Dialog open={transaction != null} onOpenChange={(open) => (open ? null : onClose())}>
      <QUI.DialogContent size="xs">
        {transaction ? (
          <QUI.Stack>
            <QUI.Box padding="5">
              <QUI.Stack gap="4">
                <QUI.Stack gap="1">
                  <QUI.DialogTitle>Add receipt</QUI.DialogTitle>
                  <QUI.DialogDescription>
                    {transaction.merchant} · {aed.format(transaction.amount)} · {shortDate.format(new Date(transaction.date))}
                  </QUI.DialogDescription>
                </QUI.Stack>
                <QUI.UploadArea
                  accept="image/*,application/pdf"
                  maxSize={10 * 1024 * 1024}
                  label="Take a photo or choose a file"
                  hint="PDF, JPG or PNG up to 10 MB"
                  onFiles={([f]) => {
                    window.clearInterval(timer.current);
                    setFile({ id: `${f!.name}-${Date.now()}`, name: f!.name, size: f!.size, progress: 0 });
                    timer.current = window.setInterval(() => {
                      setFile((cur) => {
                        if (!cur) return cur;
                        const progress = Math.min(100, (cur.progress ?? 0) + 25);
                        if (progress === 100) window.clearInterval(timer.current);
                        return { ...cur, progress };
                      });
                    }, 160);
                  }}
                  files={file ? [file] : []}
                  onRemove={() => setFile(null)}
                />
              </QUI.Stack>
            </QUI.Box>
            <QUI.Box border="subtle" borderEdge="top" padding="4">
              <QUI.Inline justify="end" gap="2">
                <QUI.DialogClose render={<QUI.Button variant="secondary" label="Cancel" />} />
                <QUI.Button variant="primary" label="Attach" disabled={!done} onClick={() => onAttach(transaction.id)} />
              </QUI.Inline>
            </QUI.Box>
          </QUI.Stack>
        ) : null}
      </QUI.DialogContent>
    </QUI.Dialog>
  );
}

/** Playground page: the employee's own spend, receipts to-do and claims. */
export function MySpendPage() {
  const [transactions, setTransactions] = React.useState(() => allTransactions.filter((t) => t.cardholder.name === me.name));
  const [claims, setClaims] = React.useState(() => allClaims.filter((c) => c.employee.name === me.name));
  const [receiptFor, setReceiptFor] = React.useState<number | null>(null);
  const [claimId, setClaimId] = React.useState<number | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  const missing = transactions.filter((t) => t.receipt === "Missing");
  const needsMemo = transactions.filter((t) => t.policy === "Weekend spend" && !t.memo);
  const todo = missing.length;

  return (
    <AcmeShell
      current="My spend"
      header={
        <QUI.Box paddingX="4" paddingY="3">
          <QUI.Inline justify="between" gap="3" maxWidth="6xl" centered>
            <QUI.Stack gap="0.5">
              <QUI.Heading level={1} size={5} weight="semibold">
                Hi {me.name.split(" ")[0]}
              </QUI.Heading>
              <QUI.Text size="xs" color="tertiary">
                {todo === 0 ? "You're all caught up." : `${todo} receipt${todo === 1 ? "" : "s"} to add before the 25th.`}
              </QUI.Text>
            </QUI.Stack>
            <QUI.Button variant="primary" icon={<QUI.Icon icon={Icons.Plus} />} label="New claim" onClick={() => setCreating(true)} />
          </QUI.Inline>
        </QUI.Box>
      }
    >
      <QUI.Box grow overflow="auto" paddingX="4" paddingBottom="4">
        <QUI.Stack gap="4" maxWidth="6xl" centered>
          {notice ? (
            <QUI.Banner variant="success" onDismiss={() => setNotice(null)}>
              {notice}
            </QUI.Banner>
          ) : null}
          <QUI.Grid columns={2} collapseBelow="lg" gap="4" align="start">
            <QUI.Stack gap="4">
              <Panel title="To do" count={todo + needsMemo.length}>
                {todo + needsMemo.length === 0 ? (
                  <QUI.Text size="sm" color="tertiary">
                    Nothing to do — every receipt is in.
                  </QUI.Text>
                ) : (
                  <QUI.Stack as="ul" gap="3">
                    {missing.slice(0, 6).map((t) => (
                      <QUI.Box as="li" key={t.id}>
                        <Row
                          icon={Icons.ReceiptText}
                          title={t.merchant}
                          detail={`Receipt missing · ${shortDate.format(new Date(t.date))} · ${aed.format(t.amount)}`}
                          trailing={<QUI.Button size="sm" variant="secondary" icon={<QUI.Icon icon={Icons.Upload} />} label="Add" aria-label={`Add receipt for ${t.merchant}`} onClick={() => setReceiptFor(t.id)} />}
                        />
                      </QUI.Box>
                    ))}
                    {needsMemo.slice(0, 2).map((t) => (
                      <QUI.Box as="li" key={`memo-${t.id}`}>
                        <Row
                          icon={Icons.MessageSquareText}
                          title={t.merchant}
                          detail={`Weekend meal · add a business reason · ${aed.format(t.amount)}`}
                          trailing={<QUI.AnchorButton href={`#/examples/tables/transactions?q=${t.id}`} label="Explain" />}
                        />
                      </QUI.Box>
                    ))}
                    {missing.length > 6 ? (
                      <QUI.Text variant="caption" size="md" color="tertiary">
                        and {missing.length - 6} more
                      </QUI.Text>
                    ) : null}
                  </QUI.Stack>
                )}
              </Panel>

              <Panel title="Recent spend" action={<QUI.AnchorButton href={`#/examples/tables/transactions?q=${encodeURIComponent(me.name)}`} label="See all" />}>
                <QUI.Stack as="ul" gap="3">
                  {transactions.slice(0, 6).map((t) => (
                    <QUI.Box as="li" key={t.id}>
                      <Row
                        icon={t.category === "Travel" ? Icons.Plane : t.category === "Meals" ? Icons.Coffee : t.category === "Transport" ? Icons.Car : Icons.ShoppingBag}
                        title={t.merchant}
                        detail={`${shortDate.format(new Date(t.date))} · ${t.category}${t.receipt === "Missing" ? " · no receipt" : ""}`}
                        trailing={
                          <QUI.Text size="sm" weight="medium" color="primary" tabularNums>
                            {aed.format(t.amount)}
                          </QUI.Text>
                        }
                      />
                    </QUI.Box>
                  ))}
                </QUI.Stack>
              </Panel>
            </QUI.Stack>

            <QUI.Stack gap="4">
              <Panel title="My cards">
                <QUI.Stack gap="4">
                  {myCards.map((card) => {
                    const pct = Math.round((card.spent / card.limit) * 100);
                    return (
                      <QUI.Inline key={card.id} gap="4" align="center" stackBelow="sm">
                        <QUI.CardVisual size="sm" holder={card.holder.name} last4={card.last4} expiry={card.expiry} nickname={card.nickname} form={card.form} network={card.network} color={card.color} frozen={card.status === "Frozen"} />
                        <QUI.Stack gap="2" grow>
                          <QUI.Stack gap="0">
                            <QUI.Text size="sm" weight="semibold" color="primary">
                              {aed.format(Math.max(0, card.limit - card.spent))} left
                            </QUI.Text>
                            <QUI.Text variant="caption" size="md" color="tertiary">
                              of {aed.format(card.limit)} · {card.period.toLowerCase()}
                            </QUI.Text>
                          </QUI.Stack>
                          <QUI.LinearProgress value={Math.min(pct, 100)} variant={pct >= 90 ? "danger" : pct >= 70 ? "warning" : "brand"} aria-label={`${card.nickname} limit used`} showValue={false} />
                          {card.status === "Frozen" ? (
                            <QUI.Text variant="caption" size="md" color="tertiary">
                              Frozen by finance — ask {myApprover.name} to unfreeze.
                            </QUI.Text>
                          ) : null}
                        </QUI.Stack>
                      </QUI.Inline>
                    );
                  })}
                </QUI.Stack>
              </Panel>

              <Panel title="My claims" action={<QUI.Button size="sm" variant="ghost" icon={<QUI.Icon icon={Icons.Plus} />} label="New" onClick={() => setCreating(true)} />}>
                {claims.length === 0 ? (
                  <QUI.Text size="sm" color="tertiary">
                    Paid for something yourself? Claim it back here.
                  </QUI.Text>
                ) : (
                  <QUI.List aria-label="My claims">
                    {claims.slice(0, 6).map((c) => (
                      <QUI.ListItem key={c.id}>
                        <QUI.ListItemButton
                          startIcon={<QUI.Icon icon={c.kind === "Mileage" ? Icons.Car : Icons.HandCoins} />}
                          label={c.title}
                          onClick={() => setClaimId(c.id)}
                          endIcon={
                            <QUI.Inline gap="2" wrap={false}>
                              <QUI.Text size="xs" weight="medium" color="primary" tabularNums>
                                {aed.format(c.amount)}
                              </QUI.Text>
                              <QUI.TagCell label={c.status} color={claimStatusColor[c.status]} />
                            </QUI.Inline>
                          }
                        />
                      </QUI.ListItem>
                    ))}
                  </QUI.List>
                )}
              </Panel>
            </QUI.Stack>
          </QUI.Grid>
        </QUI.Stack>
      </QUI.Box>

      <ReceiptDialog
        transaction={transactions.find((t) => t.id === receiptFor) ?? null}
        onClose={() => setReceiptFor(null)}
        onAttach={(id) => {
          const t = transactions.find((x) => x.id === id)!;
          setTransactions((prev) => prev.map((x) => (x.id === id ? { ...x, receipt: "Attached" } : x)));
          setReceiptFor(null);
          setNotice(`Receipt added for ${t.merchant} (${formatDay(t.date)}).`);
        }}
      />
      <ClaimDrawer claim={claims.find((c) => c.id === claimId) ?? null} onClose={() => setClaimId(null)} />
      <NewClaimDialog
        open={creating}
        onOpenChange={setCreating}
        employee={me}
        approver={myApprover}
        onSubmit={(claim) => {
          setClaims((prev) => [claim, ...prev]);
          setCreating(false);
          setNotice(`Claim "${claim.title}" for ${aed.format(claim.amount)} sent to ${myApprover.name}.`);
        }}
      />
    </AcmeShell>
  );
}
