import * as React from "react";
import { Check, Circle, CircleDashed, X } from "../icons";
import { cn } from "../lib/cn";
import type { NoClass } from "../lib/no-class";

export type TimelineTone = "done" | "current" | "pending" | "danger";

export interface TimelineItem {
  /** What happened, e.g. "Approved by Saif Kapadia". */
  title: React.ReactNode;
  /** When, already formatted, e.g. "2 Oct, 14:20". Omit for steps still to come. */
  time?: React.ReactNode;
  /** A note under the title, e.g. the approver's comment. */
  description?: React.ReactNode;
  /** `done` (check), `current` (in progress), `pending` (still to come) or `danger` (rejected, failed). @default "done" */
  tone?: TimelineTone;
  /** Replaces the tone's glyph inside the marker. */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface TimelineProps extends NoClass<React.ComponentPropsWithoutRef<"ol">> {
  items: readonly TimelineItem[];
}

const markerClass: Record<TimelineTone, string> = {
  done: "bg-success-subtle text-success-primary",
  current: "bg-accent-subtle text-accent-primary ring-2 ring-accent-subtle",
  pending: "bg-layer-3 text-tertiary",
  danger: "bg-danger-subtle text-danger-primary",
};
const toneIcon = { done: Check, current: Circle, pending: CircleDashed, danger: X } as const;

/**
 * A vertical history — a claim's or a bill's journey from submitted to paid: a marker per event, joined by a
 * line, with title, time and an optional note. Steps still to come use the `pending` tone so the whole path
 * is visible, not just what has happened. The current step is marked `aria-current="step"`.
 */
export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(({ items, ...props }, ref) => (
  <ol ref={ref} className="flex flex-col" {...props}>
    {items.map((item, i) => {
      const tone = item.tone ?? "done";
      const Glyph = item.icon ?? toneIcon[tone];
      const last = i === items.length - 1;
      return (
        <li key={i} aria-current={tone === "current" ? "step" : undefined} className="flex gap-3">
          <span className="flex flex-col items-center">
            <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", markerClass[tone])}>
              <Glyph aria-hidden className={cn("size-3.5", tone === "current" && "fill-current")} />
            </span>
            {last ? null : <span aria-hidden className={cn("w-px flex-1", tone === "done" ? "bg-success-primary" : "bg-layer-3")} />}
          </span>
          <span className={cn("flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5", last ? "pb-0" : "pb-5")}>
            <span className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className={cn("text-body-xs-medium", tone === "pending" ? "text-tertiary" : tone === "danger" ? "text-danger-primary" : "text-primary")}>{item.title}</span>
              {item.time != null ? <span className="text-caption-md-regular tabular-nums text-tertiary">{item.time}</span> : null}
            </span>
            {item.description != null ? <span className="text-caption-md-regular text-secondary">{item.description}</span> : null}
          </span>
        </li>
      );
    })}
  </ol>
));
Timeline.displayName = "Timeline";

/* __DOC_BLOCK
<div className="flex w-96 flex-col gap-4 p-4">
  <QUI.Timeline
    items={[
      { title: "Submitted by Aisha Khan", time: "2 Oct, 09:14", description: "Client dinner, Zuma Dubai" },
      { title: "Approved by Saif Kapadia", time: "2 Oct, 14:20" },
      { title: "Finance review", time: "Now", tone: "current" },
      { title: "Paid to bank account", tone: "pending" },
    ]}
  />
  <QUI.Timeline
    items={[
      { title: "Submitted", time: "28 Sep" },
      { title: "Rejected by finance", time: "29 Sep", description: "Receipt is unreadable — please upload a clearer copy.", tone: "danger" },
    ]}
  />
</div>
DOC__ */
